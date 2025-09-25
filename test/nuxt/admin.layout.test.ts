import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminLayout from '@/layouts/admin.vue'

// Mock entire UI modules to avoid context injection issues
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: { template: '<div class="sidebar-provider"><slot /></div>' },
  SidebarInset: { template: '<div class="sidebar-inset"><slot /></div>' },
  SidebarTrigger: { template: '<button class="sidebar-trigger">Toggle</button>' }
}))

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: { template: '<nav class="breadcrumb"><slot /></nav>' },
  BreadcrumbList: { template: '<ol class="breadcrumb-list"><slot /></ol>' },
  BreadcrumbItem: { template: '<li class="breadcrumb-item"><slot /></li>' },
  BreadcrumbLink: { template: '<a class="breadcrumb-link"><slot /></a>' },
  BreadcrumbSeparator: { template: '<li class="breadcrumb-separator"></li>' }
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: { template: '<div class="separator"></div>' }
}))

vi.mock('@/components/AppSidebar.vue', () => ({
  default: { template: '<aside class="app-sidebar">AppSidebar</aside>' }
}))

describe('AdminLayout', () => {
  it('should correctly render basic structure including AppSidebar and main content block', async () => {
    const component = await mountSuspended(AdminLayout, {
      slots: {
        default: () => '<div class="slot-content">Test Content</div>'
      }
    })

    // Test the basic layout structure
    expect(component.find('.sidebar-provider').exists()).toBe(true)
    expect(component.find('.app-sidebar').exists()).toBe(true)
    expect(component.find('main').exists()).toBe(true)
    expect(component.html()).toContain('Test Content')
  })

  it('should contain responsive Breadcrumb elements', async () => {
    const component = await mountSuspended(AdminLayout)

    // Test breadcrumb navigation structure
    expect(component.find('.breadcrumb').exists()).toBe(true)
    expect(component.html()).toContain('Happy Partner Blog')
    expect(component.html()).toContain('Admin Panel')
  })
})
