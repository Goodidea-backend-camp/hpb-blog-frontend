# HPB Blog - 新增文章功能實作計畫

## 目標

實作新增文章功能,包含完整的表單介面和發布機制。

## 路由結構

- `/admin` - 文章總覽列表(首頁)
- `/admin/new-article` - 新增文章

## 實作步驟

### 1. 安裝必要套件

```bash
npm install @tinymce/tinymce-vue@^6
npm install tinymce@^6
```

### 2. 安裝缺少的 shadcn/vue 元件

```bash
npx shadcn-vue@latest add label
npx shadcn-vue@latest add radio-group
```

### 3. 建立新增文章頁面 `new-article.vue`

**位置:** `app/pages/admin/new-article.vue`

**表單欄位:**

- Title (必填)
- Slug (必填)
- Content (TinyMCE 編輯器)
- Publish DateTime (DateTimePicker)

**按鈕:**

- Save as Draft
- Publish

### 4. 按鈕邏輯

**Save as Draft:**

- 設定 `published_at = null`
- 呼叫 `useArticle().create()`
- 提示「Draft saved」
- 成功後導向 `/admin`

**Publish:**

- Immediate 模式: `published_at = new Date().toISOString()`
- Schedule 模式: `published_at = selectedDateTime.toISOString()`
- 提示「Article published」
- 成功後導向 `/admin`

### 5. Publish DateTime 欄位設計

**Radio + DateTimePicker:**

```
⦿ Publish immediately
○ Schedule for: [datetime-local input]
```

**邏輯:**

- 預設選擇「Publish immediately」
- 使用原生 `<input type="datetime-local">` (MVP 方案)
- Publish 按鈕依據選項設定 `published_at`
- Save as Draft 按鈕強制設定 `published_at = null`

### 6. TinyMCE 設定

- 基本編輯器設定(toolbar, plugins)
- 未來可考慮圖片上傳功能

## 技術細節

### 已有資源

✅ `useArticle` composable - API 呼叫層
✅ shadcn/vue 基礎元件 (Button, Input, Separator)
✅ Admin layout
✅ TypeScript 型別定義 (NewArticle)
✅ `/admin/**` 已設定 `ssr: false` (客戶端渲染)

### 需要新增

- TinyMCE 套件與 Vue 整合
- Label, RadioGroup 元件
- 新增文章頁面

## 表單欄位對應

根據 `app/types/api.ts`:

**NewArticle:**

- `title: string` (必填)
- `content: string` (必填)
- `slug: string` (必填)
- `published_at?: string | null` (必填)

## 預期成果

完整的新增文章功能,使用者可以:

1. 點擊「New Article」建立新文章
2. 填寫 Title, Slug, Content
3. 選擇立即發布或預約發布
4. 儲存為草稿
5. 成功後返回文章列表

## 未來優化項目(不在此 MVP 範圍)

- 編輯文章功能
- localStorage 草稿自動保存
- 更美觀的 DateTimePicker (如 @vuepic/vue-datepicker)
- 圖片上傳功能
- Markdown 編輯器選項
- 文章預覽功能
