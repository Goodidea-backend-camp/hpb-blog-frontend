# Fix Issues

本文件記錄需要修正和改進的問題。

## 🔴 高優先級 (Critical)

### Issue #1: 雙重錯誤通知問題

**位置:** `app/pages/admin/new-article.vue` 和 `app/composables/useArticle.ts`

**問題描述:**

- `useArticle` 的 `handleError` 已經顯示 toast error
- `new-article.vue` 的 `handleSubmit` catch block 又顯示一次 toast
- 使用者會看到兩次錯誤通知

**目前程式碼:**

```typescript
// useArticle.ts
const handleError = (e: unknown, message: string): never => {
  const apiError = e as ApiError
  error.value = apiError
  toast.error(message, { description: apiError.message })
  throw e // 仍拋出錯誤
}

// new-article.vue
try {
  await create(payload)
} catch {
  toast.error('An unexpected error occurred. Please try again.') // 第二次顯示
}
```

**解決方案 (二選一):**

**方案 A: 移除 composable 中的 toast**

```typescript
// useArticle.ts - 移除 toast,只設定 error state
const handleError = (e: unknown): never => {
  const apiError = e as ApiError
  error.value = apiError
  throw e
}

// new-article.vue - 統一在此處理 toast
try {
  await create(payload)
} catch (e) {
  const message = getErrorMessage(e)
  toast.error('Failed to create article', { description: message })
}
```

**方案 B: 移除頁面中的 catch (推薦)**

```typescript
// new-article.vue - 移除 try-catch,讓 composable 處理所有錯誤
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  const payload = buildNewArticlePayload(articleFormValues)
  const _newArticle = await create(payload)

  const message = getSuccessMessage(articleFormValues.publishSetting)
  toast.success(message)

  await navigateTo('/admin')
}
```

**建議:** 採用方案 B,因為錯誤處理邏輯統一在 composable 層,頁面層只需處理成功情境。

---

## 🟡 中優先級 (Should Fix)

### Issue #2: ArticleForm watchEffect 邏輯可能導致非預期行為

**位置:** `app/components/article/ArticleForm.vue:38-56`

**問題描述:**

- 使用 `watchEffect` 監聽 `initialValues` 變化
- 條件 `!articleForm.meta.value.dirty` 在使用者編輯後會阻止重置
- 這可能不是最清晰的設計,且難以追蹤何時會觸發

**目前程式碼:**

```typescript
watchEffect(() => {
  if (
    props.initialValues &&
    Object.keys(props.initialValues).length > 0 &&
    !articleForm.meta.value.dirty
  ) {
    articleForm.resetForm({
      values: {
        /* ... */
      }
    })
  }
})
```

**解決方案:**

```typescript
// 使用 watch 明確指定監聽目標
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues && Object.keys(newValues).length > 0) {
      articleForm.resetForm({
        values: {
          title: newValues.title || '',
          slug: newValues.slug || '',
          content: newValues.content || '',
          publishSetting: newValues.publishSetting || 'publish-immediate',
          scheduledDateTime: newValues.scheduledDateTime || ''
        }
      })
    }
  },
  { immediate: true, deep: true }
)
```

**注意:** 如果需要避免覆蓋使用者編輯,應在父元件控制 `initialValues` 的傳遞時機,而非在此元件內判斷。

---

### Issue #3: useArticle 使用不安全的型別斷言

**位置:** `app/composables/useArticle.ts:17-23`

**問題描述:**

- 使用 `as ApiError` 直接斷言,可能不安全
- 已有 `isApiError` 型別守衛在 `utils/errors.ts`,但未使用

**目前程式碼:**

```typescript
const handleError = (e: unknown, message: string): never => {
  const apiError = e as ApiError // 不安全的斷言
  error.value = apiError
  toast.error(message, { description: apiError.message })
  throw e
}
```

**解決方案:**

```typescript
import { isApiError, getErrorMessage } from '@/utils/errors'

const handleError = (e: unknown, message: string): never => {
  if (isApiError(e)) {
    error.value = e
    toast.error(message, { description: e.message })
  } else {
    const fallbackError = new ApiError(getErrorMessage(e))
    error.value = fallbackError
    toast.error(message, { description: fallbackError.message })
  }
  throw e
}
```

---

### Issue #4: TinyMCE 靜態 import 增加 bundle size

**位置:** `app/components/article/TinyMceEditor.vue:1-18`

**問題描述:**

- 所有 TinyMCE 模組都使用靜態 import
- 這會將整個 TinyMCE 打包進 bundle,增加初始載入時間
- 在 admin 頁面已關閉 SSR,可考慮使用動態載入

**目前程式碼:**

```typescript
import 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/plugins/lists'
// ... 更多靜態 imports
```

**解決方案選項:**

**方案 A: 使用 CDN (推薦)**

```typescript
// 移除所有 tinymce imports
// 在 nuxt.config.ts 中添加:
app: {
  head: {
    script: [{ src: 'https://cdn.tiny.cloud/1/YOUR-API-KEY/tinymce/5/tinymce.min.js', defer: true }]
  }
}
```

**方案 B: 動態 import (次選)**

```typescript
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const Editor = defineAsyncComponent(async () => {
  await import('tinymce/tinymce')
  await import('tinymce/themes/silver')
  // ... 其他 imports
  return (await import('@tinymce/tinymce-vue')).default
})
</script>
```

**權衡考量:**

- CDN: 減少 bundle size,但依賴外部服務
- 動態 import: 保留離線能力,但初次載入較慢

---

## 🟢 低優先級 (Nice to Have)

### Issue #5: PublishOptions 錯誤處理可以改進

**位置:** `app/components/article/PublishOptions.vue:27-32`

**問題描述:**

- 使用 `console.error` 處理無效的 action
- 在生產環境可能不夠完善

**目前程式碼:**

```typescript
const handlePublishSettingUpdate = (val: string) => {
  if (isValidArticleAction(val)) {
    emit('update:publishSetting', val)
  } else {
    console.error(`Invalid article action: ${val}`) // 只有 console
  }
}
```

**解決方案:**

```typescript
const handlePublishSettingUpdate = (val: string) => {
  if (isValidArticleAction(val)) {
    emit('update:publishSetting', val)
  } else {
    console.error(`Invalid article action: ${val}`)
    // 可選: 使用 error tracking service (如 Sentry)
    // captureException(new Error(`Invalid article action: ${val}`))
  }
}
```

---

### Issue #6: ArticleForm fieldset 樣式可能重複

**位置:** `app/components/article/ArticleForm.vue:86`

**問題描述:**

- 同時使用 `disabled` 屬性和 `pointer-events-none` class
- 可能造成重複效果

**目前程式碼:**

```vue
<fieldset
  :disabled="loading"
  class="space-y-6"
  :class="{ 'pointer-events-none opacity-60': loading }"
></fieldset>
```

**解決方案:**

```vue
<!-- 選項 1: 只使用 disabled (推薦) -->
<fieldset :disabled="loading" class="space-y-6" :class="{ 'opacity-60': loading }"></fieldset>
```

---

### Issue #7: getUserTimezone 函式未使用

**位置:** `app/utils/datetime.ts:5-7`

**問題描述:**

- `getUserTimezone()` 函式已定義但未使用
- 可能是未來功能的預留,或是 dead code

**建議:**

- 如果未來不需要,移除此函式
- 如果需要,在適當的地方使用它 (如 UI 顯示時區資訊)

---
