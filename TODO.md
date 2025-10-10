# HPB Blog Frontend - 重構任務清單

## 📋 專案目標

將新增文章功能重構為更模組化、可測試、可維護的架構。

## 🎯 核心需求

- **Content 格式**: 後端存儲 **Markdown** 格式
- **編輯器體驗**: 使用者輸入/貼上 Markdown 時,畫面即時顯示 HTML 效果
- **提交轉換**: 送給後端前,將 HTML content 轉換為 Markdown

## 📊 執行優先順序

### ⏱️ 預估時間

- **階段 1 (Markdown 工具)**: 1-2 天
- **階段 2 (Editor 重構)**: 1 天
- **階段 3 (架構重組)**: 2-3 天
- **階段 4 (Notification)**: 0.5-1 天
- **階段 5 (測試)**: 2-3 天
- **總計**: 6.5-10 天

---

## 階段 1: Markdown 轉換基礎建設 (P0)

### 1. 安裝 turndown 套件

```bash
npm install turndown
npm install -D @types/turndown
```

### 2-4. 建立 `app/utils/markdown.ts`

實作三個核心函數:

```typescript
// HTML → Markdown (提交時用)
export function htmlToMarkdown(html: string): string

// Markdown → HTML (編輯文章時用)
export function markdownToHtml(markdown: string): string

// Markdown 語法偵測 (paste event 用)
export function detectMarkdown(text: string): boolean
```

**依賴套件**:

- `turndown` - HTML → Markdown
- `marked` - Markdown → HTML (已安裝)

---

## 階段 2: Editor 重構 (P0)

### 5. 重構 `TinyMceEditor.vue` - 使用新的 markdown utils

**修改內容**:

- 在 `paste` event 中使用 `detectMarkdown()` 和 `markdownToHtml()`
- 移除內聯的 markdown 偵測邏輯

### 6. 檢視並移除不必要的 plugins

**建議保留的 plugins** (6-8 個):

- `lists` - 清單功能
- `link` - 連結
- `code` - 程式碼區塊
- `table` - 表格
- `help` - 說明
- `wordcount` - 字數統計
- `textpattern` - Markdown shortcuts
- `fullscreen` - 全螢幕 (可選)

**建議移除**:

- `charmap`, `anchor`, `insertdatetime`, `media`, `preview` 等不常用的

---

## 階段 3: 架構重組 (P1)

### 7-8. 整理 Type 定義

#### 7. 建立 `app/types/form.ts`

```typescript
export interface ArticleFormValues {
  title: string
  slug: string
  content: string
  publishMode: 'immediate' | 'schedule'
  scheduledDateTime?: string
}
```

#### 8. 移動 `ArticleFormValues` 到 `types/form.ts`

更新所有引用:

- `composables/useArticleForm.ts`
- `components/article/ArticleForm.vue`
- `pages/admin/new-article.vue`

---

### 9. 建立 `app/composables/schemas/articleValidation.ts`

從 `useArticleForm.ts` 移動 zod schema:

```typescript
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const articleFormSchema = toTypedSchema(
  z.object({
    // ... 現有的 validation 邏輯
  })
)
```

---

### 10-12. 建立 `app/composables/transformers/articlePayload.ts`

#### 10. 移動 payload builders

從 `useArticleForm.ts` 移動:

- `buildNewArticlePayload()`
- `buildUpdateArticlePayload()`

#### 11. 加入 HTML→Markdown 轉換 (關鍵!)

```typescript
import { htmlToMarkdown } from '@/utils/markdown'
import type { NewArticle, UpdateArticle } from '@/types/api'
import type { ArticleFormValues } from '@/types/form'

export function buildNewArticlePayload(values: ArticleFormValues, isDraft: boolean): NewArticle {
  // 轉換 HTML content 為 Markdown
  const markdownContent = htmlToMarkdown(values.content)

  let publishedAt: string | null = null
  if (!isDraft) {
    publishedAt =
      values.publishMode === 'immediate'
        ? new Date().toISOString()
        : new Date(values.scheduledDateTime!).toISOString()
  }

  return {
    title: values.title,
    slug: values.slug,
    content: markdownContent, // ← Markdown 格式
    published_at: publishedAt
  }
}
```

#### 12. 統一 draft/publish payload 建構邏輯

重構 `buildNewArticlePayload` 和 `buildUpdateArticlePayload`,確保:

- 兩者都正確轉換 content 為 Markdown
- Draft 和 Publish 只差在 `published_at` 的值
- 邏輯清晰易懂

---

### 13. 重構 `app/composables/useArticleForm.ts`

**目標**: 作為整合入口,不再包含實作細節

```typescript
// 只 re-export 需要的功能
export { articleFormSchema } from './schemas/articleValidation'
export { buildNewArticlePayload, buildUpdateArticlePayload } from './transformers/articlePayload'
export type { ArticleFormValues } from '@/types/form'
```

**可選**: 重新命名為更精確的名稱 (如 `useArticleFormHelpers`)

---

## 階段 4: Notification 抽離 (P2)

### 14. 建立 `app/composables/useNotification.ts`

```typescript
import { ref } from 'vue'

interface Notification {
  show: boolean
  variant: 'default' | 'destructive'
  title: string
  message: string
}

export function useNotification() {
  const notification = ref<Notification>({
    show: false,
    variant: 'default',
    title: '',
    message: ''
  })

  const showSuccess = (title: string, message: string) => {
    notification.value = { show: true, variant: 'default', title, message }
    setTimeout(() => {
      notification.value.show = false
    }, 5000)
  }

  const showError = (title: string, message: string) => {
    notification.value = { show: true, variant: 'destructive', title, message }
    setTimeout(() => {
      notification.value.show = false
    }, 5000)
  }

  const hide = () => {
    notification.value.show = false
  }

  return {
    notification,
    showSuccess,
    showError,
    hide
  }
}
```

### 15. 重構 `app/pages/admin/new-article.vue`

使用新的 `useNotification`:

```typescript
const { notification, showSuccess, showError } = useNotification()

const handleSaveAsDraft = async (values: ArticleFormValues) => {
  const article = buildNewArticlePayload(values, true)
  const result = await create(article)

  if (result) {
    showSuccess('Success', 'Draft saved successfully')
    setTimeout(() => router.push('/admin'), 1500)
  } else if (createError.value) {
    showError('Error', createError.value.message)
  }
}
```

---

## 階段 5: 測試覆蓋 (P3)

### 16. 安裝 Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

建立 `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  use: {
    baseURL: 'http://localhost:3000'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true
  }
})
```

---

### 17-20. 單元測試 (Vitest)

#### 17. `test/unit/utils/markdown.test.ts`

測試重點:

- `htmlToMarkdown()` 正確轉換各種 HTML 標籤
- `markdownToHtml()` 正確轉換 Markdown 語法
- `detectMarkdown()` 正確偵測 Markdown 語法

#### 18. `test/unit/composables/transformers/articlePayload.test.ts`

測試重點:

- **驗證 content 被轉換為 Markdown** (最重要!)
- Draft 的 `published_at` 為 `null`
- Immediate publish 的 `published_at` 接近當前時間
- Schedule publish 的 `published_at` 為指定時間

#### 19. `test/unit/composables/schemas/articleValidation.test.ts`

測試重點:

- 必填欄位驗證
- Schedule 模式下 `scheduledDateTime` 必填

#### 20. `test/unit/composables/useNotification.test.ts`

測試重點:

- `showSuccess` 和 `showError` 正確設定狀態
- 5 秒後自動隱藏

---

### 21-23. 元件測試 (Vitest + @nuxt/test-utils)

#### 21. `test/nuxt/components/TinyMceEditor.test.ts`

測試重點:

- 基本渲染
- **Markdown paste 功能** (模擬貼上事件)

#### 22. `test/nuxt/components/PublishOptions.test.ts`

測試重點:

- Radio 切換邏輯
- Schedule 模式顯示/隱藏 datetime input

#### 23. `test/nuxt/components/ArticleForm.test.ts`

測試重點:

- 表單驗證觸發
- 提交事件正確發出

---

### 24-26. E2E 測試 (Playwright)

#### 24. `test/e2e/save-draft.spec.ts`

```typescript
test('儲存草稿流程', async ({ page }) => {
  // 1. 前往新增文章頁面
  // 2. 填寫表單
  // 3. 點擊 "Save as Draft"
  // 4. 攔截 API request
  // 5. 驗證 request body:
  //    - content 是 Markdown 格式
  //    - published_at 為 null
})
```

#### 25. `test/e2e/publish-immediately.spec.ts`

```typescript
test('立即發布流程', async ({ page }) => {
  // 1. 前往新增文章頁面
  // 2. 填寫表單
  // 3. 選擇 "Publish immediately"
  // 4. 點擊 "Publish"
  // 5. 驗證 request body:
  //    - content 是 Markdown 格式
  //    - published_at 有值且接近當前時間
})
```

#### 26. `test/e2e/publish-scheduled.spec.ts`

```typescript
test('排程發布流程', async ({ page }) => {
  // 1. 前往新增文章頁面
  // 2. 填寫表單
  // 3. 選擇 "Schedule for"
  // 4. 輸入未來時間
  // 5. 點擊 "Publish"
  // 6. 驗證 request body:
  //    - content 是 Markdown 格式
  //    - published_at 為指定的未來時間
})
```

---

## ✅ 驗收標準

完成後,系統應該能:

1. **編輯器體驗**: 使用者打 Markdown 語法,畫面即時顯示 HTML 效果
2. **貼上 Markdown**: 自動偵測並轉換成 HTML 顯示
3. **提交草稿/發布**: 送給後端的 `content` 欄位是 **Markdown 格式**
4. **所有測試通過**: 單元測試、元件測試、E2E 測試全部通過
5. **代碼結構清晰**: 職責分離,易於維護和擴充

---

## 🔮 未來優化 (暫不處理)

- PublishOptions UX 改善 (與團隊討論後再決定)
- 編輯文章功能 (需要 Markdown → HTML 轉換)
- 圖片上傳功能
- localStorage 草稿自動保存

---

## 📝 Notes

- PublishOptions UX 暫時維持現狀,待與團隊討論後再調整
- Playwright 已確認作為 E2E 測試工具
- TinyMCE 的 `textpattern` 和 `paste` event 功能互補,不是重複:
  - `textpattern`: 即時 shortcuts (打字時轉換)
  - `paste`: 偵測整塊 Markdown 並轉換
