# 建立部落格後台編輯介面 Layout 計劃

## 1. 安裝和配置 shadcn/ui for Vue

- 安裝 @shadcn/vue 和相關依賴 (lucide-vue-next, class-variance-authority, clsx, tailwind-merge)
- 初始化 shadcn/ui 配置
- 配置 components.json 和必要的 Tailwind CSS 設定

## 2. 建立 Admin 路由結構

- 創建 `pages/admin/` 目錄結構 (Nuxt.js 4 支援 pages 和 app 並存)
- 建立 `pages/admin/index.vue` 作為後台首頁
- 設置 `/admin` 路由的基本架構

## 3. 建立 Admin Layout

- 創建 `layouts/admin.vue` 專用於後台管理介面
- 使用 shadcn/ui 組件建立側邊欄導航
- 建立頂部導航欄 (包含用戶資訊、登出等)
- 設計響應式布局 (支援手機和桌面)

## 4. 建立基本 Admin 組件

- 安裝必要的 shadcn/ui 組件 (Button, Card, Navigation Menu, Avatar)
- 建立可重用的 admin UI 組件

## 5. 測試設置

- 編寫 admin layout 的單元測試
- 測試路由導航功能
- 測試響應式設計
- 建立 E2E 測試確保 admin 頁面正常運作

## 6. 代碼品質檢查

- 運行 `make format` 和 `make lint`
- 確保所有測試通過
- TypeScript 類型檢查
