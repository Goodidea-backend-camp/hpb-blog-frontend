import { eventHandler } from 'h3'
import type { Article } from '@/types/api'

/**
 * Development-only mock handler for GET /api/articles
 *
 * This handler provides mock article data for development purposes.
 * It returns 3 mock articles matching the swagger.yml schema.
 *
 * This handler is only active in development mode via nitro.devHandlers.
 * It will not be included in production builds.
 */
export default eventHandler((): Article[] => {
  return [
    {
      id: 1,
      author: {
        id: 1,
        username: 'john_doe'
      },
      title: '我的第一篇部落格文章',
      slug: 'my-first-blog-post',
      content:
        '# 歡迎\n\n這是 **Markdown** 內容。這是一篇已發布的文章。\n\n## 段落標題\n\n這裡有更多內容...',
      published_at: '2023-10-27T10:00:00Z',
      created_at: '2023-10-27T09:00:00Z',
      updated_at: '2023-10-27T09:30:00Z'
    },
    {
      id: 2,
      author: {
        id: 2,
        username: 'jane_smith'
      },
      title: 'Nuxt 3 開發指南',
      slug: 'nuxt-3-development-guide',
      content:
        '# Nuxt 3 開發指南\n\n這是一篇關於 Nuxt 3 開發的文章。\n\n## 特色功能\n\n- 自動導入\n- 檔案式路由\n- Server API 路由\n\n這篇文章尚未發布（published_at 為 null）。',
      published_at: null,
      created_at: '2023-11-15T14:30:00Z',
      updated_at: '2023-11-16T08:15:00Z'
    },
    {
      id: 3,
      author: {
        id: 1,
        username: 'john_doe'
      },
      title: 'TypeScript 最佳實踐',
      slug: 'typescript-best-practices',
      content:
        '# TypeScript 最佳實踐\n\n學習如何寫出更好的 TypeScript 程式碼。\n\n## 型別安全\n\n使用嚴格模式來確保型別安全...\n\n這是另一篇已發布的文章。',
      published_at: '2023-12-01T12:00:00Z',
      created_at: '2023-11-30T10:00:00Z',
      updated_at: '2023-12-01T11:45:00Z'
    }
  ]
})
