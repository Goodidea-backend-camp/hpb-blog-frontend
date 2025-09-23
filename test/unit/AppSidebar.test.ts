import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSidebar from '@/components/AppSidebar.vue'

describe('AppSidebar', () => {
  it('應該成功渲染所有子元件，包括 SidebarBrand, NavMain, 和 NavUser', () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          Sidebar: { template: '<aside class="sidebar"><slot /></aside>' },
          SidebarHeader: { template: '<div class="sidebar-header"><slot /></div>' },
          SidebarContent: { template: '<div class="sidebar-content"><slot /></div>' },
          SidebarFooter: { template: '<div class="sidebar-footer"><slot /></div>' },
          SidebarRail: { template: '<div class="sidebar-rail"></div>' },
          SidebarBrand: true,
          NavMain: true,
          NavUser: true
        }
      }
    })

    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('.sidebar-header').exists()).toBe(true)
    expect(wrapper.find('.sidebar-content').exists()).toBe(true)
    expect(wrapper.find('.sidebar-footer').exists()).toBe(true)
    expect(wrapper.find('.sidebar-rail').exists()).toBe(true)
  })

  it('應該正確傳遞 Props 並渲染靜態文字內容', () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          Sidebar: { template: '<aside><slot /></aside>' },
          SidebarHeader: { template: '<div><slot /></div>' },
          SidebarContent: { template: '<div><slot /></div>' },
          SidebarFooter: { template: '<div><slot /></div>' },
          SidebarRail: { template: '<div></div>' },
          SidebarBrand: {
            props: ['title', 'subtitle', 'icon'],
            template: '<div data-testid="sidebar-brand">{{ title }} - {{ subtitle }}</div>'
          },
          NavMain: {
            props: ['items'],
            template: '<nav data-testid="nav-main">{{ items?.[0]?.title || "No items" }}</nav>'
          },
          NavUser: {
            props: ['user'],
            template: '<div data-testid="nav-user">{{ user?.name || "No user" }}</div>'
          }
        }
      }
    })

    const sidebarBrand = wrapper.find('[data-testid="sidebar-brand"]')
    expect(sidebarBrand.text()).toContain('Happy Partner Blog - Admin Panel')

    const navMain = wrapper.find('[data-testid="nav-main"]')
    expect(navMain.text()).toBe('Posts')

    const navUser = wrapper.find('[data-testid="nav-user"]')
    expect(navUser.text()).toBe('Username')
  })
})
