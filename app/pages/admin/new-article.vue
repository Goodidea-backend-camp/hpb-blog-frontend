<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import ArticleForm from '@/components/article/ArticleForm.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useArticle } from '@/composables/useArticle'
import { buildNewArticlePayload } from '@/composables/useArticlePayload'
import type { ArticleFormValues } from '@/types/form'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading, error: createError } = useArticle()

// Notification state
const notification = ref<{
  show: boolean
  variant: 'default' | 'destructive'
  title: string
  message: string
}>({
  show: false,
  variant: 'default',
  title: '',
  message: ''
})

const showNotification = (variant: 'default' | 'destructive', title: string, message: string) => {
  notification.value = { show: true, variant, title, message }
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// Submit handlers
const handleSaveDraft = async (articleFormValues: ArticleFormValues) => {
  const payload = buildNewArticlePayload(articleFormValues)
  const result = await create(payload)

  if (result) {
    showNotification('default', 'Success', 'Draft saved successfully')
    setTimeout(() => router.push('/admin'), 1500)
  } else if (createError.value) {
    showNotification('destructive', 'Error', createError.value.message)
  }
}

const handlePublish = async (articleFormValues: ArticleFormValues) => {
  const payload = buildNewArticlePayload(articleFormValues)
  const result = await create(payload)

  if (result) {
    const message =
      articleFormValues.publishSetting === 'publish-immediate'
        ? 'Article published successfully'
        : 'Article scheduled successfully'
    showNotification('default', 'Success', message)
    setTimeout(() => router.push('/admin'), 1500)
  } else if (createError.value) {
    showNotification('destructive', 'Error', createError.value.message)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">New Article</h1>
      <p class="text-muted-foreground mt-2">Create a new blog article</p>
    </div>

    <Alert v-if="notification.show" :variant="notification.variant" class="mb-6">
      <AlertTitle>{{ notification.title }}</AlertTitle>
      <AlertDescription>{{ notification.message }}</AlertDescription>
    </Alert>

    <ArticleForm :loading="loading" @save-draft="handleSaveDraft" @publish="handlePublish" />
  </div>
</template>
