import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminLayout from '@/layouts/admin.vue'
import { h } from 'vue'

describe('AdminLayout', () => {
  it('應該正確渲染基本結構，包括 AppSidebar 和 main 內容區塊', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        stubs: {
          AppSidebar: { template: '<aside data-testid="app-sidebar">AppSidebar</aside>' },
          SidebarProvider: { template: '<div class="sidebar-provider"><slot /></div>' },
          SidebarInset: { template: '<div class="sidebar-inset"><slot /></div>' },
          SidebarTrigger: { template: '<button class="sidebar-trigger">Toggle</button>' },
          Separator: { template: '<div class="separator"></div>' },
          Breadcrumb: { template: '<nav class="breadcrumb"><slot /></nav>' },
          BreadcrumbList: { template: '<ol class="breadcrumb-list"><slot /></ol>' },
          BreadcrumbItem: { template: '<li class="breadcrumb-item"><slot /></li>' },
          BreadcrumbLink: { template: '<a class="breadcrumb-link"><slot /></a>' },
          BreadcrumbSeparator: { template: '<li class="breadcrumb-separator"></li>' }
        }
      },
      slots: {
        default: h('div', { class: 'slot-content' }, 'Test Content')
      }
    })

    expect(wrapper.find('.sidebar-provider').exists()).toBe(true)
    expect(wrapper.find('[data-testid="app-sidebar"]').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('.slot-content').text()).toBe('Test Content')
  })

  it('應該包含響應式 Breadcrumb 元素和正確的 CSS 類別', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        stubs: {
          AppSidebar: true,
          SidebarProvider: { template: '<div><slot /></div>' },
          SidebarInset: { template: '<div><slot /></div>' },
          SidebarTrigger: { template: '<button></button>' },
          Separator: { template: '<div></div>' },
          Breadcrumb: { template: '<nav><slot /></nav>' },
          BreadcrumbList: { template: '<ol><slot /></ol>' },
          BreadcrumbItem: {
            template: '<li :class="$attrs.class"><slot /></li>',
            inheritAttrs: false
          },
          BreadcrumbLink: { template: '<a><slot /></a>' },
          BreadcrumbSeparator: {
            template: '<li :class="$attrs.class"></li>',
            inheritAttrs: false
          }
        }
      }
    })

    const hiddenBreadcrumbItem = wrapper.find('.hidden.md\\:block')
    expect(hiddenBreadcrumbItem.exists()).toBe(true)
    expect(hiddenBreadcrumbItem.classes()).toContain('hidden')
    expect(hiddenBreadcrumbItem.classes()).toContain('md:block')

    const hiddenSeparator = wrapper
      .findAll('li')
      .find((li) => li.classes().includes('hidden') && li.classes().includes('md:block'))
    expect(hiddenSeparator?.exists()).toBe(true)
  })
})
