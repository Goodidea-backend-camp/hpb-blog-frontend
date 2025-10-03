import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { Smile } from 'lucide-vue-next'
import SidebarBrand from '@/components/SidebarBrand.vue'

// Mock router composables
vi.mock('#app/composables/router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app/composables/router')>()
  return {
    ...actual,
    navigateTo: vi.fn(),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn()
    })),
    useRoute: vi.fn(() => ({
      path: '/',
      params: {},
      query: {}
    }))
  }
})

// Mock UI components to avoid context injection issues
vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: { template: '<div class="sidebar-menu"><slot /></div>' },
  SidebarMenuItem: { template: '<div class="sidebar-menu-item"><slot /></div>' },
  SidebarMenuButton: {
    props: ['size', 'class'],
    template: '<button class="sidebar-menu-button" @click="$emit(\'click\')"><slot /></button>'
  }
}))

describe('SidebarBrand', () => {
  it('should render with correct props', async () => {
    const component = await mountSuspended(SidebarBrand, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        icon: Smile,
        url: '/test-url'
      }
    })

    expect(component.html()).toContain('Test Title')
    expect(component.html()).toContain('Test Subtitle')
  })

  it('should call navigateTo with correct url when clicked', async () => {
    const { navigateTo } = await import('#app/composables/router')
    vi.mocked(navigateTo).mockClear()

    const component = await mountSuspended(SidebarBrand, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        icon: Smile,
        url: '/admin'
      }
    })

    // Find and click the button
    const button = component.find('.sidebar-menu-button')
    await button.trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('/admin', { replace: true })
  })

  it('should call navigateTo with custom url', async () => {
    const { navigateTo } = await import('#app/composables/router')
    vi.mocked(navigateTo).mockClear()

    const component = await mountSuspended(SidebarBrand, {
      props: {
        title: 'Custom Brand',
        subtitle: 'Custom Panel',
        icon: Smile,
        url: '/custom-path'
      }
    })

    const button = component.find('.sidebar-menu-button')
    await button.trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('/custom-path', { replace: true })
  })
})
