<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import Editor from '@tinymce/tinymce-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useArticle } from '@/composables/useArticle'
import type { NewArticle } from '@/types/api'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading, error: apiError } = useArticle()

// Form data
const title = ref('')
const slug = ref('')
const content = ref('')
const publishMode = ref<'immediate' | 'schedule'>('immediate')
const scheduledDateTime = ref('')

// Validation errors
const validationErrors = ref<string[]>([])

// TinyMCE configuration
const tinymceConfig = {
  height: 500,
  menubar: true,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'code',
    'help',
    'wordcount'
  ],
  toolbar:
    'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
}

// Computed
const isScheduleMode = computed(() => publishMode.value === 'schedule')

// Validation
const validateForm = (): boolean => {
  validationErrors.value = []

  if (!title.value.trim()) {
    validationErrors.value.push('Title is required')
  }

  if (!slug.value.trim()) {
    validationErrors.value.push('Slug is required')
  }

  if (!content.value.trim()) {
    validationErrors.value.push('Content is required')
  }

  if (publishMode.value === 'schedule' && !scheduledDateTime.value) {
    validationErrors.value.push('Scheduled date and time is required')
  }

  return validationErrors.value.length === 0
}

// Submit handlers
const handleSaveAsDraft = async () => {
  if (!validateForm()) return

  const article: NewArticle = {
    title: title.value,
    slug: slug.value,
    content: content.value,
    published_at: null
  }

  const result = await create(article)

  if (result) {
    alert('Draft saved')
    router.push('/admin')
  } else if (apiError.value) {
    alert(`Error: ${apiError.value.message}`)
  }
}

const handlePublish = async () => {
  if (!validateForm()) return

  let publishedAt: string

  if (publishMode.value === 'immediate') {
    publishedAt = new Date().toISOString()
  } else {
    publishedAt = new Date(scheduledDateTime.value).toISOString()
  }

  const article: NewArticle = {
    title: title.value,
    slug: slug.value,
    content: content.value,
    published_at: publishedAt
  }

  const result = await create(article)

  if (result) {
    alert('Article published')
    router.push('/admin')
  } else if (apiError.value) {
    alert(`Error: ${apiError.value.message}`)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">New Article</h1>
      <p class="text-muted-foreground mt-2">Create a new blog article</p>
    </div>

    <!-- Validation Errors -->
    <Alert v-if="validationErrors.length > 0" variant="destructive" class="mb-6">
      <AlertTitle>Validation Error</AlertTitle>
      <AlertDescription>
        <ul class="list-disc pl-4">
          <li v-for="(err, index) in validationErrors" :key="index">{{ err }}</li>
        </ul>
      </AlertDescription>
    </Alert>

    <!-- Form -->
    <div class="space-y-6">
      <!-- Title -->
      <div class="space-y-2">
        <Label for="title">Title *</Label>
        <Input id="title" v-model="title" placeholder="Enter article title" :disabled="loading" />
      </div>

      <!-- Slug -->
      <div class="space-y-2">
        <Label for="slug">Slug *</Label>
        <Input id="slug" v-model="slug" placeholder="enter-article-slug" :disabled="loading" />
      </div>

      <!-- Content -->
      <div class="space-y-2">
        <Label for="content">Content *</Label>
        <Editor id="content" v-model="content" :init="tinymceConfig" :disabled="loading" />
      </div>

      <!-- Publish Options -->
      <div class="space-y-4">
        <Label>Publish Options</Label>
        <RadioGroup v-model="publishMode" :disabled="loading">
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="immediate" value="immediate" />
            <Label for="immediate" class="cursor-pointer font-normal"> Publish immediately </Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="schedule" value="schedule" />
            <Label for="schedule" class="cursor-pointer font-normal">Schedule for:</Label>
          </div>
        </RadioGroup>

        <!-- Scheduled DateTime Input -->
        <div v-if="isScheduleMode" class="ml-6">
          <Input
            id="scheduled-datetime"
            v-model="scheduledDateTime"
            type="datetime-local"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-4">
        <Button variant="outline" :disabled="loading" @click="handleSaveAsDraft">
          <span v-if="loading" class="mr-2">
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          Save as Draft
        </Button>

        <Button :disabled="loading" @click="handlePublish">
          <span v-if="loading" class="mr-2">
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          Publish
        </Button>
      </div>
    </div>
  </div>
</template>
