<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-vue-next'

// Import TinyMCE core first
import 'tinymce/tinymce'

// Import TinyMCE theme and icons
import 'tinymce/themes/silver'
import 'tinymce/icons/default'

// Import TinyMCE skin
import 'tinymce/skins/ui/oxide/skin.css'

// Import essential plugins
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'

import Editor from '@tinymce/tinymce-vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useArticle } from '@/composables/useArticle'
import type { NewArticle } from '@/types/api'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading, error: apiError } = useArticle()

// Zod validation schema
const formSchema = toTypedSchema(
  z
    .object({
      title: z.string().min(1, 'Title is required').trim(),
      slug: z.string().min(1, 'Slug is required').trim(),
      content: z.string().min(1, 'Content is required').trim(),
      publishMode: z.enum(['immediate', 'schedule']),
      scheduledDateTime: z.string().optional()
    })
    .refine(
      (data) => {
        if (data.publishMode === 'schedule') {
          return !!data.scheduledDateTime && data.scheduledDateTime.length > 0
        }
        return true
      },
      {
        message: 'Scheduled date and time is required',
        path: ['scheduledDateTime']
      }
    )
)

// Form setup
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    slug: '',
    content: '',
    publishMode: 'immediate' as const,
    scheduledDateTime: ''
  }
})

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
    'help',
    'wordcount'
  ],
  toolbar:
    'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  content_css: false,
  skin: false
}

// Track publishMode for conditional rendering
const currentPublishMode = ref<'immediate' | 'schedule'>('immediate')

// Computed
const isScheduleMode = computed(() => currentPublishMode.value === 'schedule')

// Submit handlers
const handleSaveAsDraft = form.handleSubmit(async (values) => {
  const article: NewArticle = {
    title: values.title,
    slug: values.slug,
    content: values.content,
    published_at: null
  }

  const result = await create(article)

  if (result) {
    alert('Draft saved')
    router.push('/admin')
  } else if (apiError.value) {
    alert(`Error: ${apiError.value.message}`)
  }
})

const handlePublish = form.handleSubmit(async (values) => {
  let publishedAt: string

  if (values.publishMode === 'immediate') {
    publishedAt = new Date().toISOString()
  } else {
    publishedAt = new Date(values.scheduledDateTime!).toISOString()
  }

  const article: NewArticle = {
    title: values.title,
    slug: values.slug,
    content: values.content,
    published_at: publishedAt
  }

  const result = await create(article)

  if (result) {
    alert('Article published')
    router.push('/admin')
  } else if (apiError.value) {
    alert(`Error: ${apiError.value.message}`)
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">New Article</h1>
      <p class="text-muted-foreground mt-2">Create a new blog article</p>
    </div>

    <!-- Form -->
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
            <Editor
              :model-value="value"
              :init="tinymceConfig"
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
            <RadioGroup
              :model-value="value"
              :disabled="loading"
              @update:model-value="
                (val) => {
                  handleChange(val)
                  currentPublishMode = val as 'immediate' | 'schedule'
                }
              "
            >
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="immediate" value="immediate" />
                <Label for="immediate" class="cursor-pointer font-normal">
                  Publish immediately
                </Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="schedule" value="schedule" />
                <Label for="schedule" class="cursor-pointer font-normal">Schedule for:</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Scheduled DateTime Input -->
      <FormField v-if="isScheduleMode" v-slot="{ componentField }" name="scheduledDateTime">
        <FormItem class="ml-6">
          <FormControl>
            <Input v-bind="componentField" type="datetime-local" :disabled="loading" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-4">
        <Button variant="outline" type="button" :disabled="loading" @click="handleSaveAsDraft">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Save as Draft
        </Button>

        <Button type="button" :disabled="loading" @click="handlePublish">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Publish
        </Button>
      </div>
    </form>
  </div>
</template>
