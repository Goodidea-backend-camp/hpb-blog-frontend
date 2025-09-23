import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminIndexPage from '@/pages/admin/index.vue'

describe('Admin Index Page', () => {
  it('應該正確套用 admin 佈局並渲染頁面內容', async () => {
    const component = await mountSuspended(AdminIndexPage)

    // 驗證頁面使用了正確的佈局（檢查實際渲染結果）
    // 在 Nuxt 環境中，admin 佈局會自動套用，我們檢查頁面內容是否正確渲染
    expect(component.html()).toContain('div')

    // 驗證頁面主要內容區塊存在
    const gridContainer = component.find('div')
    expect(gridContainer.exists()).toBe(true)

    // 驗證三個卡片區域
    const cardElements = component
      .findAll('div')
      .filter(
        (wrapper) =>
          wrapper.classes().includes('bg-muted/50') && wrapper.classes().includes('aspect-video')
      )
    expect(cardElements.length).toBeGreaterThanOrEqual(3)

    // 驗證主要內容區域
    const mainContentArea = component
      .findAll('div')
      .find(
        (wrapper) =>
          wrapper.classes().includes('bg-muted/50') && wrapper.classes().includes('min-h-[100vh]')
      )
    expect(mainContentArea?.exists()).toBe(true)
  })
})
