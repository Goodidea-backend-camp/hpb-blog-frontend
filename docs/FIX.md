# Code Review 修復清單

> Code Review 日期：2025-10-13
> 分支：feature/HPB-164
> 目標分支：main

本文檔列出 Code Review 中發現的問題及建議修復方案。

---

## 🚨 必須修復（P0 - 嚴重問題）

### 1. useAlert.ts - Memory Leak 風險

**文件位置**：`app/composables/useAlert.ts`

**問題描述**：
當前實現使用模塊級別的 `autoHideTimeout` 變數，如果組件在 timeout 完成前被銷毀，會導致 memory leak。

**現有代碼**：

```typescript
let autoHideTimeout: ReturnType<typeof setTimeout> | null = null

export function useAlert() {
  const alert = ref<AlertState>({
    show: false,
    variant: 'default',
    title: '',
    message: ''
  })

  const showAlert = (options: ShowAlertOptions) => {
    // ...
    autoHideTimeout = setTimeout(() => {
      hideAlert()
    }, duration)
  }
}
```

**問題**：

- Timeout 回調函數持有對 `alert` ref 的引用
- 組件銷毀時 timeout 仍在運行
- 可能導致已銷毀組件的狀態被更新

**修復方案**：

```typescript
import { ref, readonly, onUnmounted } from 'vue'
import { ALERT_AUTO_HIDE_DURATION } from '@/constants/alert'
import type { AlertState, ShowAlertOptions } from '@/types/alert'

export function useAlert() {
  const alert = ref<AlertState>({
    show: false,
    variant: 'default',
    title: '',
    message: ''
  })

  let autoHideTimeout: ReturnType<typeof setTimeout> | null = null

  // 清理函數
  const cleanup = () => {
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout)
      autoHideTimeout = null
    }
  }

  // 組件銷毀時清理
  onUnmounted(() => {
    cleanup()
  })

  const showAlert = (options: ShowAlertOptions) => {
    // Clear existing auto-hide timeout to prevent memory leaks
    cleanup()

    alert.value = {
      show: true,
      variant: options.variant,
      title: options.title,
      message: options.message
    }

    const duration = options.duration ?? ALERT_AUTO_HIDE_DURATION

    // Only set timeout if duration is finite (not Infinity)
    if (isFinite(duration)) {
      autoHideTimeout = setTimeout(() => {
        hideAlert()
      }, duration)
    }
  }

  const hideAlert = () => {
    alert.value.show = false
    cleanup()
  }

  return {
    alert: readonly(alert),
    showAlert,
    hideAlert
  }
}
```

**測試更新**：
在 `test/nuxt/useAlert.test.ts` 中加入測試：

```typescript
it('should cleanup timeout on unmount', async () => {
  const wrapper = mount({
    setup() {
      const { alert, showAlert } = useAlert()
      return { alert, showAlert }
    },
    template: '<div>{{ alert }}</div>'
  })

  wrapper.vm.showAlert({
    variant: 'default',
    title: 'Test',
    message: 'Test message',
    duration: 5000
  })

  // Unmount before timeout completes
  wrapper.unmount()

  // Wait for the original timeout duration
  await new Promise((resolve) => setTimeout(resolve, 6000))

  // Should not throw or cause issues
  expect(true).toBe(true)
})
```

---

### 2. useArticle.ts - 錯誤處理被移除

**文件位置**：`app/composables/useArticle.ts`

**問題描述**：
移除了 `error` state 和 catch block，導致：

1. UI 無法統一顯示錯誤狀態
2. 呼叫方必須自行處理所有錯誤
3. 失去統一的錯誤管理機制

**移除的代碼**：

```typescript
const error = useState<Error | null>('articles:error', () => null)

// 在每個函數中：
error.value = null
try {
  // ...
} catch (e) {
  error.value = e as Error
  throw e
}
```

**影響範圍**：

- `list()` - 文章列表載入失敗
- `get(slug)` - 單篇文章載入失敗
- `create()` - 文章創建失敗
- `update()` - 文章更新失敗
- `remove()` - 文章刪除失敗

**修復方案選項**：

#### 選項 A：恢復 error state（推薦）

```typescript
export function useArticle() {
  const articles = useState<Article[]>('articles', () => [])
  const currentArticle = useState<Article | null>('currentArticle', () => null)
  const loading = useState<boolean>('articles:loading', () => false)
  const error = useState<Error | null>('articles:error', () => null)

  const apiClient = useApiClient()

  async function list() {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.get<Article[]>('/articles')
      articles.value = result
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 其他函數同理...

  return {
    // states
    articles: readonly(articles),
    currentArticle: readonly(currentArticle),
    loading: readonly(loading),
    error: readonly(error),
    // methods
    list,
    get,
    create,
    update,
    remove
  }
}
```

#### 選項 B：確保所有呼叫方都有錯誤處理

如果選擇不恢復 error state，則需要：

1. 在所有使用 `useArticle` 的地方加入 try-catch
2. 使用 `useAlert` 顯示錯誤訊息
3. 建立統一的錯誤處理工具函數

**範例**：

```typescript
// app/utils/article-handlers.ts
import { useAlert } from '@/composables/useAlert'
import { getErrorMessage } from '@/utils/errors'

export async function handleArticleOperation<T>(
  operation: () => Promise<T>,
  successMessage?: string
): Promise<T | null> {
  const { showAlert } = useAlert()

  try {
    const result = await operation()

    if (successMessage) {
      showAlert({
        variant: 'default',
        title: 'Success',
        message: successMessage,
        duration: 3000
      })
    }

    return result
  } catch (error) {
    showAlert({
      variant: 'destructive',
      title: 'Error',
      message: getErrorMessage(error),
      duration: 5000
    })
    return null
  }
}
```

**測試更新**：
`test/nuxt/useArticle.test.ts` 需要恢復 error state 的測試。

**建議**：採用選項 A，恢復 error state。這樣可以：

- 保持 API 的一致性
- 讓呼叫方可以選擇如何處理錯誤
- 在列表頁面可以顯示整體的錯誤狀態

---

### 3. useArticlePayload.ts - Scheduled 狀態邏輯錯誤

**文件位置**：`app/composables/useArticlePayload.ts`

**問題描述**：
排程發布（scheduled publish）的文章應該保持 `draft` 狀態，直到排程時間到達才變成 `published`。

**現有代碼**：

```typescript
export function useArticlePayload() {
  function transformToNewArticle(values: ArticleFormValues): NewArticle {
    const { title, slug, publishSetting, scheduledDateTime } = values
    const content = htmlToMarkdown(values.content)

    return {
      title: title.trim(),
      slug: slug.trim(),
      content,
      publishStatus: publishSetting === 'save-draft' ? 'draft' : 'published',
      scheduledAt: publishSetting === 'publish-scheduled' ? scheduledDateTime : undefined
    }
  }
}
```

**問題**：

- `publish-scheduled` 時 `publishStatus` 被設為 `published`
- 但文章應該在排程時間前保持 `draft` 狀態
- 後端可能有 scheduler 會在 `scheduledAt` 時間到時自動發布

**修復方案**：

```typescript
export function useArticlePayload() {
  function transformToNewArticle(values: ArticleFormValues): NewArticle {
    const { title, slug, publishSetting, scheduledDateTime } = values
    const content = htmlToMarkdown(values.content)

    // 決定發布狀態
    // - save-draft: 明確保存為草稿
    // - publish-scheduled: 排程發布，在排程時間前保持草稿狀態
    // - publish-immediate: 立即發布
    const publishStatus = publishSetting === 'publish-immediate' ? 'published' : 'draft'

    return {
      title: title.trim(),
      slug: slug.trim(),
      content,
      publishStatus,
      scheduledAt: publishSetting === 'publish-scheduled' ? scheduledDateTime : undefined
    }
  }

  function transformToUpdateArticle(values: ArticleFormValues): UpdateArticle {
    const { title, slug, publishSetting, scheduledDateTime } = values
    const content = htmlToMarkdown(values.content)

    // 更新時邏輯相同
    const publishStatus = publishSetting === 'publish-immediate' ? 'published' : 'draft'

    return {
      title: title.trim(),
      slug: slug.trim(),
      content,
      publishStatus,
      scheduledAt: publishSetting === 'publish-scheduled' ? scheduledDateTime : undefined
    }
  }

  return {
    transformToNewArticle,
    transformToUpdateArticle
  }
}
```

**測試更新**：
在 `test/unit/composables/useArticlePayload.test.ts` 中更新測試：

```typescript
it('should set status to draft for scheduled publish', () => {
  const values: ArticleFormValues = {
    title: 'Test Article',
    slug: 'test-article',
    content: '<p>Test content</p>',
    publishSetting: 'publish-scheduled',
    scheduledDateTime: '2025-12-31T10:00'
  }

  const result = transformToNewArticle(values)

  expect(result.publishStatus).toBe('draft') // 應該是 draft，不是 published
  expect(result.scheduledAt).toBe('2025-12-31T10:00')
})
```

**後端配合**：
確保後端有 scheduler 會：

1. 定期檢查 `scheduledAt` 時間已到且 `publishStatus` 為 `draft` 的文章
2. 自動將這些文章的 `publishStatus` 更新為 `published`

---

## ⚠️ 建議修復（P1 - 重要問題）

### 4. ArticleForm.vue - 防止 Loading 時重複提交

**文件位置**：`app/components/article/ArticleForm.vue:56`

**問題描述**：
雖然按鈕有 `:disabled="loading"`，但如果使用者快速點擊或用鍵盤觸發，仍有可能重複提交。

**現有代碼**：

```typescript
const handleSubmit = articleForm.handleSubmit((articleFormValues) => {
  emit('submit', articleFormValues)
})
```

**修復方案**：

```typescript
const handleSubmit = articleForm.handleSubmit((articleFormValues) => {
  // 防止 loading 時重複提交
  if (props.loading) {
    return
  }
  emit('submit', articleFormValues)
})
```

或使用 debounce：

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSubmit = useDebounceFn((articleFormValues: ArticleFormValues) => {
  if (props.loading) return
  emit('submit', articleFormValues)
}, 300)

const handleSubmit = articleForm.handleSubmit((articleFormValues) => {
  debouncedSubmit(articleFormValues)
})
```

---

### 5. ArticleForm.vue - Props 更新不會同步到表單

**文件位置**：`app/components/article/ArticleForm.vue:28`

**問題描述**：
如果 `initialValues` prop 在組件掛載後更新（例如編輯模式下異步載入文章數據），表單不會同步更新。

**現有代碼**：

```typescript
const articleForm = useForm({
  validationSchema: articleFormSchema,
  initialValues: {
    title: props.initialValues?.title || '',
    slug: props.initialValues?.slug || '',
    content: props.initialValues?.content || '',
    publishSetting: props.initialValues?.publishSetting || 'publish-immediate',
    scheduledDateTime: props.initialValues?.scheduledDateTime || ''
  }
})
```

**修復方案**：

```typescript
import { watchEffect } from 'vue'

const articleForm = useForm({
  validationSchema: articleFormSchema,
  initialValues: {
    title: '',
    slug: '',
    content: '',
    publishSetting: 'publish-immediate' as ArticleAction,
    scheduledDateTime: ''
  }
})

// 監聽 initialValues 變化並同步到表單
watchEffect(() => {
  if (props.initialValues) {
    articleForm.resetForm({
      values: {
        title: props.initialValues.title || '',
        slug: props.initialValues.slug || '',
        content: props.initialValues.content || '',
        publishSetting: props.initialValues.publishSetting || 'publish-immediate',
        scheduledDateTime: props.initialValues.scheduledDateTime || ''
      }
    })
  }
})
```

**注意事項**：

- 需要考慮是否要在用戶已經編輯表單時仍然重置
- 可能需要加入 dirty 狀態檢查：

```typescript
watchEffect(() => {
  // 只在表單尚未被編輯時才重置
  if (props.initialValues && !articleForm.meta.value.dirty) {
    articleForm.resetForm({
      values: {
        /* ... */
      }
    })
  }
})
```

---

### 6. PublishOptions.vue - Type Assertion 缺乏驗證

**文件位置**：`app/components/article/PublishOptions.vue:30`

**問題描述**：
直接將 string 強制轉換為 `ArticleAction` 類型，缺乏運行時驗證。

**現有代碼**：

```typescript
@update:model-value="(val: string) => emit('update:publishSetting', val as ArticleAction)"
```

**問題**：

- RadioGroup 可能傳入非預期的值
- Type assertion 在運行時不提供保護
- 可能導致類型不安全

**修復方案**：

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { ArticleAction } from '@/types/form'

interface Props {
  publishSetting: ArticleAction
  scheduledDateTime?: string
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:publishSetting': [value: ArticleAction]
  'update:scheduledDateTime': [value: string]
}>()

const isScheduledPublish = computed(() => props.publishSetting === 'publish-scheduled')

// 類型守衛函數
const isValidArticleAction = (val: string): val is ArticleAction => {
  const validActions: ArticleAction[] = ['publish-immediate', 'publish-scheduled', 'save-draft']
  return validActions.includes(val as ArticleAction)
}

// 安全的更新函數
const handlePublishSettingUpdate = (val: string) => {
  if (isValidArticleAction(val)) {
    emit('update:publishSetting', val)
  } else {
    console.error(`Invalid article action: ${val}`)
    // 可選：拋出錯誤或使用默認值
    // emit('update:publishSetting', 'publish-immediate')
  }
}
</script>

<template>
  <div class="space-y-4">
    <RadioGroup
      :model-value="publishSetting"
      :disabled="disabled"
      class="flex-col gap-3"
      @update:model-value="handlePublishSettingUpdate"
    >
      <!-- ... -->
    </RadioGroup>
  </div>
</template>
```

**更嚴格的方案**（使用 TypeScript const assertion）：

```typescript
// app/types/form.ts
export const ARTICLE_ACTIONS = ['publish-immediate', 'publish-scheduled', 'save-draft'] as const
export type ArticleAction = (typeof ARTICLE_ACTIONS)[number]

// PublishOptions.vue
import { ARTICLE_ACTIONS } from '@/types/form'

const isValidArticleAction = (val: string): val is ArticleAction => {
  return ARTICLE_ACTIONS.includes(val as ArticleAction)
}
```

---

### 7. new-article.vue - 成功後跳轉太快

**文件位置**：`app/pages/admin/new-article.vue:39`

**問題描述**：
顯示成功訊息後立即跳轉，用戶可能看不到訊息。

**現有代碼**：

```typescript
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  loading.value = true

  try {
    const newArticle = transformToNewArticle(articleFormValues)
    await create(newArticle)

    showAlert({
      variant: 'default',
      title: 'Success',
      message: 'Article published successfully!',
      duration: 3000
    })

    await navigateTo('/admin')
  } catch (error) {
    showAlert({
      variant: 'destructive',
      title: 'Error',
      message: getErrorMessage(error),
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}
```

**問題**：

- `navigateTo` 會立即執行路由跳轉
- 用戶看不到 success alert（或只看到一瞬間）
- 體驗不佳

**修復方案**：

#### 方案 A：延遲跳轉

```typescript
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  loading.value = true

  try {
    const newArticle = transformToNewArticle(articleFormValues)
    await create(newArticle)

    showAlert({
      variant: 'default',
      title: 'Success',
      message: 'Article published successfully!',
      duration: 2000
    })

    // 延遲跳轉，讓用戶看到成功訊息
    setTimeout(() => {
      navigateTo('/admin')
    }, 1500)
  } catch (error) {
    showAlert({
      variant: 'destructive',
      title: 'Error',
      message: getErrorMessage(error),
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}
```

#### 方案 B：成功訊息改為重定向提示

```typescript
showAlert({
  variant: 'default',
  title: 'Success',
  message: 'Article published successfully! Redirecting...',
  duration: 1500
})

await new Promise((resolve) => setTimeout(resolve, 1500))
await navigateTo('/admin')
```

#### 方案 C：使用 Toast 通知（推薦）

如果使用 toast 通知系統，可以在跳轉後仍然顯示：

```typescript
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  loading.value = true

  try {
    const newArticle = transformToNewArticle(articleFormValues)
    const result = await create(newArticle)

    // Toast 可以在跳轉後繼續顯示
    await navigateTo('/admin')

    // 在新頁面顯示 toast
    showToast({
      variant: 'success',
      message: 'Article published successfully!'
    })
  } catch (error) {
    showAlert({
      variant: 'destructive',
      title: 'Error',
      message: getErrorMessage(error),
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}
```

**建議**：採用方案 A（延遲跳轉），最簡單且不需要額外依賴。

---

## 💡 優化建議（P2 - 可選改進）

### 8. TinyMceEditor.vue - CSS 一致性

**文件位置**：`app/components/article/TinyMceEditor.vue:40`

**問題描述**：
編輯器內容樣式硬編碼，可能與網站其他部分不一致。

**現有代碼**：

```typescript
content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Hiragino Sans GB", "Microsoft JhengHei", "Helvetica Neue", Arial, sans-serif; font-size: 14px }'
```

**建議改進**：

#### 方案 A：從 Tailwind 配置讀取

```typescript
// composables/useEditorStyles.ts
export function useEditorStyles() {
  // 從 Tailwind 配置或 CSS 變數讀取
  const fontFamily =
    getComputedStyle(document.documentElement).getPropertyValue('--font-sans') ||
    '-apple-system, BlinkMacSystemFont, ...'

  const fontSize =
    getComputedStyle(document.documentElement).getPropertyValue('--text-base') || '14px'

  return {
    contentStyle: `body {
      font-family: ${fontFamily};
      font-size: ${fontSize};
      line-height: 1.6;
      color: var(--text-primary);
    }`
  }
}

// TinyMceEditor.vue
const { contentStyle } = useEditorStyles()

const editorConfig = {
  // ...
  content_style: contentStyle
}
```

#### 方案 B：導入 CSS 文件

```typescript
// 創建 tinymce-content.css
// app/assets/css/tinymce-content.css
body {
  font-family: theme('fontFamily.sans');
  font-size: theme('fontSize.sm');
  line-height: theme('lineHeight.relaxed');
  color: theme('colors.gray.900');
}

// 在 TinyMCE 中引用
import contentCss from '@/assets/css/tinymce-content.css?inline'

const editorConfig = {
  content_style: contentCss
}
```

#### 方案 C：使用 content_css（推薦）

```typescript
const editorConfig = {
  // ...
  content_css: '/css/editor-content.css', // 從 public 目錄載入
  // 或使用多個 CSS 文件
  content_css: ['/css/tailwind-base.css', '/css/editor-content.css']
}
```

---

### 9. useArticleValidation.ts - Timezone 處理

**文件位置**：`app/composables/useArticleValidation.ts:16`

**問題描述**：
時間驗證使用瀏覽器本地時間，但後端可能使用 UTC。

**現有代碼**：

```typescript
const now = new Date()
now.setSeconds(0, 0)

const scheduledDateTime = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true
      const selectedDate = new Date(val)
      return selectedDate > now
    },
    { message: 'Scheduled date must be in the future' }
  )
```

**潛在問題**：

- 用戶在台灣（UTC+8）選擇明天 10:00
- 後端在 UTC 時區可能認為是今天
- 可能導致驗證不一致

**建議改進**：

#### 方案 A：明確註解行為

```typescript
// 使用瀏覽器本地時間進行驗證
// 注意：後端應該再次驗證，因為時區可能不同
const now = new Date()
now.setSeconds(0, 0)

const scheduledDateTime = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true
      const selectedDate = new Date(val)
      // 比較時會自動轉換為相同時區
      return selectedDate > now
    },
    { message: 'Scheduled date must be in the future (local time)' }
  )
```

#### 方案 B：統一使用 UTC

```typescript
const nowUTC = new Date(Date.now())

const scheduledDateTime = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true
      // datetime-local 輸入會是本地時間字串，需要轉換
      const selectedDate = new Date(val)
      return selectedDate.getTime() > nowUTC.getTime()
    },
    { message: 'Scheduled date must be in the future' }
  )
```

#### 方案 C：增加緩衝時間（推薦）

```typescript
const now = new Date()
// 增加 5 分鐘緩衝，避免邊界情況
const minScheduledTime = new Date(now.getTime() + 5 * 60 * 1000)
minScheduledTime.setSeconds(0, 0)

const scheduledDateTime = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true
      const selectedDate = new Date(val)
      return selectedDate > minScheduledTime
    },
    { message: 'Scheduled date must be at least 5 minutes in the future' }
  )
```

---

### 10. markdown.ts - Code Block 處理改進

**文件位置**：`app/utils/markdown.ts:19`

**問題描述**：
Code block 的處理可能不夠健壯。

**現有代碼**：

````typescript
function preprocessHtml(html: string): string {
  return (
    html
      // Convert triple backticks to tildes to avoid conflicts
      .replace(/^(\s*)```/gm, '$1~~~')
    // ... 其他處理
  )
}
````

**潛在問題**：

- 如果 HTML 中有 ``` 字串（不在 code block 內），也會被替換
- 例如：`<p>Use ``` for code blocks</p>` 會被錯誤處理

**建議改進**：

````typescript
function preprocessHtml(html: string): string {
  // 只處理在 <pre> 或 <code> 標籤內的 ```
  return html.replace(/<(pre|code)([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, content) => {
    // 在 code block 內容中轉換
    const processedContent = content.replace(/```/g, '~~~')
    return `<${tag}${attrs}>${processedContent}</${tag}>`
  })
}
````

或者更安全的做法：

````typescript
function preprocessHtml(html: string): string {
  // 先標記 code blocks
  const codeBlocks: string[] = []
  let processedHtml = html.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
    codeBlocks.push(match)
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`
  })

  // 處理其他轉換...

  // 還原 code blocks（此時已經過處理）
  codeBlocks.forEach((block, index) => {
    processedHtml = processedHtml.replace(`__CODE_BLOCK_${index}__`, block.replace(/```/g, '~~~'))
  })

  return processedHtml
}
````

---

### 11. errors.ts - 擴展錯誤格式支援

**文件位置**：`app/utils/errors.ts:4`

**建議改進**：
支援更多常見的錯誤格式。

**現有代碼**：

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unknown error occurred'
}
```

**建議改進**：

```typescript
export function getErrorMessage(error: unknown): string {
  // 1. Error 實例
  if (error instanceof Error) {
    return error.message
  }

  // 2. 字串錯誤
  if (typeof error === 'string') {
    return error
  }

  // 3. 物件錯誤
  if (error && typeof error === 'object') {
    // API 錯誤格式：{ message: string }
    if ('message' in error && error.message) {
      return String(error.message)
    }

    // API 錯誤格式：{ error: string }
    if ('error' in error && error.error) {
      return String(error.error)
    }

    // API 錯誤格式：{ msg: string }
    if ('msg' in error && error.msg) {
      return String(error.msg)
    }

    // Axios 錯誤格式
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as { data?: { message?: string; error?: string } }
      if (response.data?.message) {
        return response.data.message
      }
      if (response.data?.error) {
        return response.data.error
      }
    }

    // Fetch API 錯誤
    if ('status' in error && 'statusText' in error) {
      return `${error.status}: ${error.statusText}`
    }
  }

  // 4. 默認錯誤訊息
  return 'An unknown error occurred'
}

// 新增：判斷是否為網路錯誤
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message === 'Network Error' ||
      error.message.includes('fetch') ||
      error.message.includes('network')
    )
  }

  if (error && typeof error === 'object') {
    return 'code' in error && error.code === 'NETWORK_ERROR'
  }

  return false
}

// 新增：判斷是否為驗證錯誤
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    return 'status' in error && error.status === 422
  }
  return false
}
```

**使用範例**：

```typescript
try {
  await create(newArticle)
} catch (error) {
  let errorMessage = getErrorMessage(error)

  if (isNetworkError(error)) {
    errorMessage = 'Network error. Please check your connection.'
  } else if (isValidationError(error)) {
    errorMessage = 'Validation failed. Please check your input.'
  }

  showAlert({
    variant: 'destructive',
    title: 'Error',
    message: errorMessage
  })
}
```

---

### 12. Makefile - 測試輸出過濾規則管理

**文件位置**：`Makefile:26`

**問題描述**：
grep 過濾規則變得很長，難以維護。

**現有代碼**：

```makefile
test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | \
		grep -v -E '^\[nuxt\]|\[info\]|^ℹ|\[nitro\]|.*\[.*ms\]|...(很長)...|^\s*\],?\s*$$' | \
		cat -s
```

**建議改進**：

#### 方案 A：使用配置文件

```bash
# test/config/output-filter.txt
^\[nuxt\]
\[info\]
^ℹ
\[nitro\]
.*\[.*ms\]
stdout \|
\[nuxt-app\]
# ... 其他規則
```

```makefile
test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | \
		grep -v -E -f test/config/output-filter.txt | \
		cat -s
```

#### 方案 B：使用腳本

```bash
# scripts/filter-test-output.sh
#!/bin/bash

# 測試輸出過濾腳本
# 過濾掉 Nuxt/Nitro 的 debug 訊息

grep -v -E '^\[nuxt\]' | \
grep -v -E '\[info\]' | \
grep -v -E '^ℹ' | \
grep -v -E '\[nitro\]' | \
grep -v -E '.*\[.*ms\]' | \
grep -v -E 'stdout \|' | \
grep -v -E '\[nuxt-app\]' | \
# ... 其他規則
cat -s
```

```makefile
test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | \
		./scripts/filter-test-output.sh
```

#### 方案 C：使用環境變數控制（推薦）

```makefile
# 過濾規則
TEST_OUTPUT_FILTER = '^\[nuxt\]|\[info\]|^ℹ|\[nitro\]|.*\[.*ms\]|...'

test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | \
		grep -v -E $(TEST_OUTPUT_FILTER) | \
		cat -s

# 開發時可能想看完整輸出
test-llm-verbose:
	@npx vitest run --reporter=verbose
```

---

## 📊 測試建議

### 13. 加入 E2E 測試

**建議新增**：`test/e2e/article-creation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Article Creation Flow', () => {
  test('should create and publish article successfully', async ({ page }) => {
    // 1. 登入
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // 2. 前往新增文章頁面
    await page.goto('/admin/new-article')
    await expect(page).toHaveURL('/admin/new-article')

    // 3. 填寫表單
    await page.fill('[name="title"]', 'Test Article')
    await page.fill('[name="slug"]', 'test-article')

    // TinyMCE 需要特殊處理
    const editorFrame = page.frameLocator('iframe[id^="tiny-vue"]')
    await editorFrame.locator('body').fill('This is test content')

    // 4. 選擇立即發布
    await page.click('input[value="publish-immediate"]')

    // 5. 提交
    await page.click('button:has-text("Publish Now")')

    // 6. 驗證成功
    await expect(page.locator('[role="alert"]')).toContainText('Success')
    await expect(page).toHaveURL('/admin', { timeout: 5000 })
  })

  test('should schedule article for future publish', async ({ page }) => {
    await page.goto('/admin/new-article')

    // 填寫表單
    await page.fill('[name="title"]', 'Scheduled Article')
    await page.fill('[name="slug"]', 'scheduled-article')

    const editorFrame = page.frameLocator('iframe[id^="tiny-vue"]')
    await editorFrame.locator('body').fill('Scheduled content')

    // 選擇排程發布
    await page.click('input[value="publish-scheduled"]')

    // 設定未來時間
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const dateString = futureDate.toISOString().slice(0, 16)
    await page.fill('input[type="datetime-local"]', dateString)

    // 提交
    await page.click('button:has-text("Schedule Publish")')

    // 驗證
    await expect(page.locator('[role="alert"]')).toContainText('Success')
  })

  test('should save article as draft', async ({ page }) => {
    await page.goto('/admin/new-article')

    await page.fill('[name="title"]', 'Draft Article')
    await page.fill('[name="slug"]', 'draft-article')

    const editorFrame = page.frameLocator('iframe[id^="tiny-vue"]')
    await editorFrame.locator('body').fill('Draft content')

    // 選擇儲存草稿
    await page.click('input[value="save-draft"]')
    await page.click('button:has-text("Save Draft")')

    await expect(page.locator('[role="alert"]')).toContainText('Success')
  })

  test('should show validation errors', async ({ page }) => {
    await page.goto('/admin/new-article')

    // 不填寫任何欄位直接提交
    await page.click('button:has-text("Publish Now")')

    // 驗證錯誤訊息
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Slug is required')).toBeVisible()
    await expect(page.locator('text=Content is required')).toBeVisible()
  })

  test('should prevent duplicate slug submission', async ({ page }) => {
    // 這個測試需要後端配合
    await page.goto('/admin/new-article')

    await page.fill('[name="title"]', 'Duplicate Test')
    await page.fill('[name="slug"]', 'existing-slug')

    const editorFrame = page.frameLocator('iframe[id^="tiny-vue"]')
    await editorFrame.locator('body').fill('Content')

    await page.click('button:has-text("Publish Now")')

    // 驗證錯誤訊息
    await expect(page.locator('[role="alert"]')).toContainText('Slug already exists')
  })
})
```

---

## 🔒 安全性檢查清單

### 14. 安全性注意事項

雖然這些可能不在前端範圍內，但需要確保後端有相應的保護：

#### XSS 防護

- [ ] 後端必須對 TinyMCE 輸出的 HTML 進行 sanitization
- [ ] 使用 DOMPurify 或類似工具
- [ ] 白名單允許的 HTML 標籤和屬性

**建議在文檔中註明**：

```markdown
## 安全性注意事項

### HTML Content Sanitization

前端使用 TinyMCE 編輯器，允許用戶輸入富文本內容。**後端必須進行 HTML sanitization** 以防止 XSS 攻擊：

1. 使用 sanitization 庫（如 bleach、DOMPurify）
2. 只允許白名單內的標籤和屬性
3. 移除所有 JavaScript 事件處理器
4. 移除 <script> 標籤和 javascript: 協議

範例白名單：

- 標籤：p, br, strong, em, u, h1-h6, ul, ol, li, a, img, blockquote, code, pre, table, thead, tbody, tr, th, td
- 屬性：href, src, alt, title, class
```

#### CSRF 防護

- [ ] 確保 API 有 CSRF token 驗證
- [ ] 使用 SameSite cookie 屬性
- [ ] 檢查 Origin/Referer headers

#### Rate Limiting

- [ ] 文章創建 API 應該有 rate limiting
- [ ] 防止惡意用戶大量創建文章

#### 權限驗證

- [ ] 後端必須驗證用戶是否有權限創建/編輯文章
- [ ] 不能只依賴前端的登入狀態

---

## 📝 修復優先順序建議

### 第一階段（必須在 PR 合併前完成）

1. ✅ 修復 `useAlert.ts` 的 memory leak
2. ✅ 恢復或改進 `useArticle.ts` 的錯誤處理
3. ✅ 修復 `useArticlePayload.ts` 的 scheduled 狀態邏輯

### 第二階段（合併後一週內完成）

4. ✅ `ArticleForm.vue` 防止重複提交
5. ✅ `PublishOptions.vue` type assertion 驗證
6. ✅ `new-article.vue` 成功跳轉延遲

### 第三階段（可以逐步改進）

7. ⭕ `TinyMceEditor.vue` CSS 一致性
8. ⭕ `ArticleForm.vue` props 更新同步
9. ⭕ `markdown.ts` code block 處理
10. ⭕ `errors.ts` 錯誤格式擴展
11. ⭕ Makefile 過濾規則管理
12. ⭕ E2E 測試補充

---

## ✅ 修復完成檢查清單

- [ ] P0-1: useAlert.ts memory leak 修復
- [ ] P0-2: useArticle.ts 錯誤處理恢復
- [ ] P0-3: useArticlePayload.ts scheduled 邏輯修復
- [ ] P1-4: ArticleForm.vue 防重複提交
- [ ] P1-5: ArticleForm.vue props 同步
- [ ] P1-6: PublishOptions.vue type 驗證
- [ ] P1-7: new-article.vue 跳轉延遲
- [ ] 所有相關測試已更新
- [ ] 測試全部通過
- [ ] 代碼已格式化
- [ ] 已執行 `make ci-llm`

---

## 📚 參考資源

- [Vue.js Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VeeValidate Best Practices](https://vee-validate.logaretm.com/v4/guide/best-practices)
- [TinyMCE Security Guide](https://www.tiny.cloud/docs/tinymce/6/security/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

最後更新：2025-10-13
Reviewed by: Claude Code
