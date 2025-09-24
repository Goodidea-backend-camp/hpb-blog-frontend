<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import { FileText, Smile } from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import SidebarBrand from '@/components/SidebarBrand.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
})

const data = {
  brand: {
    title: 'Happy Partner Blog',
    subtitle: 'Admin Panel',
    icon: Smile
  },
  user: {
    name: 'Username'
  },
  navMain: [
    {
      title: 'Articles',
      url: '#',
      icon: FileText,
      isActive: true,
      items: [
        {
          title: 'Article list',
          url: '#'
        },
        {
          title: 'New article',
          url: '#'
        }
      ]
    }
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarBrand
        :title="data.brand.title"
        :subtitle="data.brand.subtitle"
        :icon="data.brand.icon"
      />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
