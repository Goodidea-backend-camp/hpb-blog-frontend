<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { ArticleAction } from '@/types/form'

interface Props {
  publishSetting: ArticleAction
  scheduledDateTime?: string
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:publishSetting': [value: ArticleAction]
  'update:scheduledDateTime': [value: string]
}>()

const isScheduledMode = computed(() => props.publishSetting === 'publish-scheduled')
</script>

<template>
  <div class="space-y-4">
    <RadioGroup
      :model-value="publishSetting"
      :disabled="disabled"
      class="flex-col gap-3"
      @update:model-value="(val) => emit('update:publishSetting', val as ArticleAction)"
    >
      <div class="flex items-center gap-2">
        <RadioGroupItem id="publish-immediate" value="publish-immediate" />
        <Label for="publish-immediate" class="cursor-pointer"> Publish immediately </Label>
      </div>

      <div class="flex items-center gap-2">
        <RadioGroupItem id="publish-scheduled" value="publish-scheduled" />
        <Label for="publish-scheduled" class="cursor-pointer"> Schedule publish </Label>
      </div>

      <div v-if="isScheduledMode" class="space-y-2">
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

      <div class="flex items-center gap-2">
        <RadioGroupItem id="save-draft" value="save-draft" />
        <Label for="save-draft" class="cursor-pointer"> Save as draft (don't publish yet) </Label>
      </div>
    </RadioGroup>
  </div>
</template>
