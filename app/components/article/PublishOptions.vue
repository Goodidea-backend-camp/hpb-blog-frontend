<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  publishMode: 'immediate' | 'schedule'
  scheduledDateTime?: string
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:publishMode': [value: 'immediate' | 'schedule']
  'update:scheduledDateTime': [value: string]
}>()

const isScheduleMode = computed(() => props.publishMode === 'schedule')
</script>

<template>
  <div class="space-y-4">
    <RadioGroup
      :model-value="publishMode"
      :disabled="disabled"
      @update:model-value="(val) => emit('update:publishMode', val as 'immediate' | 'schedule')"
    >
      <div class="flex items-center space-x-2">
        <RadioGroupItem id="immediate" value="immediate" />
        <Label for="immediate" class="cursor-pointer font-normal"> Publish immediately </Label>
      </div>
      <div class="flex items-center space-x-2">
        <RadioGroupItem id="schedule" value="schedule" />
        <Label for="schedule" class="cursor-pointer font-normal">Schedule for:</Label>
      </div>
    </RadioGroup>

    <div v-if="isScheduleMode" class="ml-6 space-y-2">
      <Input
        :model-value="scheduledDateTime"
        type="datetime-local"
        :disabled="disabled"
        @update:model-value="
          (val: string | number) => emit('update:scheduledDateTime', String(val))
        "
      />
      <p v-if="error" class="text-destructive text-sm font-medium">
        {{ error }}
      </p>
    </div>
  </div>
</template>
