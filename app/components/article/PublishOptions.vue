<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ARTICLE_ACTIONS, type ArticleAction } from '@/types/form'
import { toast } from 'vue-sonner'

interface Props {
  publishSetting: ArticleAction
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:publishSetting': [value: ArticleAction]
}>()

const isScheduledPublish = computed(() => props.publishSetting === 'publish-scheduled')

const isValidArticleAction = (val: string): val is ArticleAction => {
  return (ARTICLE_ACTIONS as readonly string[]).includes(val)
}

const handlePublishSettingUpdate = (val: string) => {
  if (isValidArticleAction(val)) {
    emit('update:publishSetting', val)
  } else {
    toast.error(`Invalid article action: ${val}`)
  }
}
</script>

<template>
  <div class="space-y-4">
    <RadioGroup
      :model-value="publishSetting"
      :disabled="disabled"
      class="flex-col gap-3"
      @update:model-value="handlePublishSettingUpdate"
    >
      <div class="flex items-center gap-2">
        <RadioGroupItem id="publish-immediate" value="publish-immediate" />
        <Label for="publish-immediate" class="cursor-pointer"> Publish immediately </Label>
      </div>

      <div class="flex items-center gap-2">
        <RadioGroupItem id="publish-scheduled" value="publish-scheduled" />
        <Label for="publish-scheduled" class="cursor-pointer"> Schedule publish </Label>
      </div>

      <div v-if="isScheduledPublish" class="space-y-2">
        <slot name="scheduled-date-time" />
      </div>

      <div class="flex items-center gap-2">
        <RadioGroupItem id="save-draft" value="save-draft" />
        <Label for="save-draft" class="cursor-pointer"> Save as draft </Label>
      </div>
    </RadioGroup>
  </div>
</template>
