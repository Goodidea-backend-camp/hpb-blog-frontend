<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import TinyMceEditor from './TinyMceEditor.vue'
import PublishOptions from './PublishOptions.vue'
import { articleFormSchema } from '@/composables/useArticleForm'
import type { ArticleFormValues } from '@/types/form'

interface Props {
  initialValues?: Partial<ArticleFormValues>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  loading: false
})

const emit = defineEmits<{
  saveDraft: [articleFormValues: ArticleFormValues]
  publish: [articleFormValues: ArticleFormValues]
}>()

// Form setup
const articleForm = useForm({
  validationSchema: articleFormSchema,
  initialValues: {
    title: props.initialValues?.title || '',
    slug: props.initialValues?.slug || '',
    content: props.initialValues?.content || '',
    publishMode: (props.initialValues?.publishMode || 'immediate') as 'immediate' | 'schedule',
    scheduledDateTime: props.initialValues?.scheduledDateTime || ''
  }
})

// Computed
const isScheduleMode = computed(() => articleForm.values.publishMode === 'schedule')

// Submit handlers
const handleSaveDraft = articleForm.handleSubmit((articleFormValues) => {
  emit('saveDraft', articleFormValues)
})

const handlePublish = articleForm.handleSubmit((articleFormValues) => {
  emit('publish', articleFormValues)
})
</script>

<template>
  <form class="space-y-6">
    <!-- Title -->
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>Title *</FormLabel>
        <FormControl>
          <Input v-bind="componentField" placeholder="Enter article title" :disabled="loading" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Slug -->
    <FormField v-slot="{ componentField }" name="slug">
      <FormItem>
        <FormLabel>Slug *</FormLabel>
        <FormControl>
          <Input v-bind="componentField" placeholder="enter-article-slug" :disabled="loading" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Content -->
    <FormField v-slot="{ value, handleChange }" name="content">
      <FormItem>
        <FormLabel>Content *</FormLabel>
        <FormControl>
          <TinyMceEditor
            :model-value="value"
            :disabled="loading"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Publish Options -->
    <FormField v-slot="{ value, handleChange }" name="publishMode">
      <FormItem>
        <FormLabel>Publish Options</FormLabel>
        <FormControl>
          <PublishOptions
            :publish-mode="value"
            :scheduled-date-time="articleForm.values.scheduledDateTime"
            :disabled="loading"
            :error="isScheduleMode ? articleForm.errors.value.scheduledDateTime : undefined"
            @update:publish-mode="handleChange"
            @update:scheduled-date-time="
              (val) => articleForm.setFieldValue('scheduledDateTime', val)
            "
          />
        </FormControl>
      </FormItem>
    </FormField>

    <!-- Action Buttons -->
    <div class="flex gap-4 pt-4">
      <Button variant="outline" type="button" :disabled="loading" @click="handleSaveDraft">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        Save Draft
      </Button>

      <Button type="button" :disabled="loading" @click="handlePublish">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        Publish
      </Button>
    </div>
  </form>
</template>
