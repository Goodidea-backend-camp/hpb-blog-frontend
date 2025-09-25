import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSidebar from '@/components/AppSidebar.vue'

describe('AppSidebar', () => {
  it('should correctly pass props and render static text content', () => {
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
