<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useForm } from 'vee-validate'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import TinyMceEditor from './TinyMceEditor.vue'
import PublishOptions from './PublishOptions.vue'
import { articleFormSchema } from '@/composables/useArticleValidation'
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
  submit: [articleFormValues: ArticleFormValues]
}>()

// Form setup
const articleForm = useForm({
  validationSchema: articleFormSchema,
  initialValues: {
    title: '',
    slug: '',
    content: '',
    publishSetting: 'publish-immediate',
    scheduledDateTime: ''
  }
})

watchEffect(() => {
  // Only reset the form if it hasn't been edited by the user and initialValues is not the default empty object
  if (
    props.initialValues &&
    Object.keys(props.initialValues).length > 0 &&
    !articleForm.meta.value.dirty
  ) {
    articleForm.resetForm({
      values: {
        title: props.initialValues.title || '',
        slug: props.initialValues.slug || '',
        content: props.initialValues.content || '',
        publishSetting: props.initialValues.publishSetting || 'publish-immediate',
        scheduledDateTime: props.initialValues.scheduledDateTime || ''
      }
    })
  }
})

// Computed
const isScheduledPublish = computed(() => articleForm.values.publishSetting === 'publish-scheduled')

const submitButtonText = computed(() => {
  switch (articleForm.values.publishSetting) {
    case 'publish-immediate':
      return 'Publish Now'
    case 'publish-scheduled':
      return 'Schedule Publish'
    case 'save-draft':
      return 'Save Draft'
    default:
      return 'Submit'
  }
})

const handleSubmit = articleForm.handleSubmit((articleFormValues) => {
  // Prevent duplicate submission during loading
  if (props.loading) {
    return
  }
  emit('submit', articleFormValues)
})
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <fieldset
      :disabled="loading"
      class="space-y-6"
      :class="{ 'pointer-events-none opacity-60': loading }"
    >
      <!-- Title -->
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>Title *</FormLabel>
          <FormControl>
            <Input v-bind="componentField" placeholder="Enter article title" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Slug -->
      <FormField v-slot="{ componentField }" name="slug">
        <FormItem>
          <FormLabel>Slug *</FormLabel>
          <FormControl>
            <Input v-bind="componentField" placeholder="enter-article-slug" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Content -->
      <FormField v-slot="{ value, handleChange }" name="content">
        <FormItem>
          <FormLabel>Content *</FormLabel>
          <FormControl>
            <TinyMceEditor :model-value="value" @update:model-value="handleChange" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Publish Settings -->
      <FormField v-slot="{ value, handleChange }" name="publishSetting">
        <FormItem>
          <FormLabel>Publish Settings</FormLabel>
          <FormControl>
            <PublishOptions
              :publish-setting="value"
              :scheduled-date-time="articleForm.values.scheduledDateTime"
              :error="isScheduledPublish ? articleForm.errors.value.scheduledDateTime : undefined"
              @update:publish-setting="handleChange"
              @update:scheduled-date-time="
                (val) => articleForm.setFieldValue('scheduledDateTime', val)
              "
            />
          </FormControl>
        </FormItem>
      </FormField>
    </fieldset>

    <!-- Action Button -->
    <div class="flex gap-4 pt-4">
      <Button type="submit" class="cursor-pointer" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ submitButtonText }}
      </Button>
    </div>
  </form>
</template>
