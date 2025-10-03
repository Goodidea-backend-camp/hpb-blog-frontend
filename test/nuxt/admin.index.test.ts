import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminIndexPage from '@/pages/admin/index.vue'

describe('Admin Index Page', () => {
  it('should render the main content area of the admin panel', async () => {
    const component = await mountSuspended(AdminIndexPage)
    const mainContent = component.find('[data-testid="admin-main-content"]')
    expect(mainContent.exists()).toBe(true)
  })
})
