import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminIndexPage from '@/pages/admin/index.vue'

describe('Admin Index Page', () => {
  it('應該渲染儀表板的主要區塊，包括統計卡片和內容區域', async () => {
    const component = await mountSuspended(AdminIndexPage)

    // 驗證三個統計卡片被渲染
    const cards = component.findAll('[data-testid="admin-stats-card"]')
    expect(cards.length).toBe(3)

    // 驗證主要內容區域被渲染
    const mainContent = component.find('[data-testid="admin-main-content"]')
    expect(mainContent.exists()).toBe(true)
  })
})
