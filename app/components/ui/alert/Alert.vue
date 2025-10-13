<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AlertVariants } from '.'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { alertVariants } from '.'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    variant?: AlertVariants['variant']
    dismissible?: boolean
  }>(),
  {
    dismissible: true
  }
)

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div data-slot="alert" :class="cn(alertVariants({ variant }), props.class)" role="alert">
    <slot />
    <button
      v-if="dismissible"
      type="button"
      class="hover:bg-muted focus:ring-ring absolute top-3 right-3 rounded-md p-1 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
      aria-label="Close alert"
      @click="emit('close')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
