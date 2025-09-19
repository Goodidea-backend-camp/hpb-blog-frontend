<script setup lang="ts">
import type { Component } from 'vue'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

const props = defineProps<{
  title: string
  subtitle: string
  icon: Component
}>()

function handleClick() {
  navigateTo('/admin', { replace: true })
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" class="cursor-pointer" @click="handleClick">
        <div
          class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
        >
          <component :is="props.icon" class="size-4" />
        </div>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">{{ props.title }}</span>
          <span class="text-muted-foreground truncate text-xs">{{ props.subtitle }}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
