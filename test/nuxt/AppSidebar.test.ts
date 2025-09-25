import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppSidebar from '@/components/AppSidebar.vue'

// Mock entire UI modules to avoid context injection issues
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: { template: '<div class="sidebar"><slot /></div>' },
  SidebarHeader: { template: '<div class="sidebar-header"><slot /></div>' },
  SidebarContent: { template: '<div class="sidebar-content"><slot /></div>' },
  SidebarFooter: { template: '<div class="sidebar-footer"><slot /></div>' },
  SidebarRail: { template: '<div class="sidebar-rail"></div>' }
}))

vi.mock('@/components/NavMain.vue', () => ({
  default: {
    props: ['items'],
    template: '<nav class="nav-main">{{ items?.[0]?.title || "No items" }}</nav>'
  }
}))

vi.mock('@/components/NavUser.vue', () => ({
  default: {
    props: ['user'],
    template: '<div class="nav-user">{{ user?.name || "No user" }}</div>'
  }
}))

vi.mock('@/components/SidebarBrand.vue', () => ({
  default: {
    props: ['title', 'subtitle', 'icon'],
    template: '<div class="sidebar-brand">{{ title }} - {{ subtitle }}</div>'
  }
}))

describe('AppSidebar', () => {
  it('should correctly pass props and render static text content', async () => {
    const component = await mountSuspended(AppSidebar)

    // Test the component renders correctly with mocked children
    expect(component.html()).toContain('Happy Partner Blog - Admin Panel')
    expect(component.html()).toContain('Articles')
    expect(component.html()).toContain('Username')
  })
})
