<script setup lang="ts">
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import ArticleForm from '@/components/article/ArticleForm.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useArticle } from '@/composables/useArticle'
import { useAlert } from '@/composables/useAlert'
import { buildNewArticlePayload } from '@/composables/useArticlePayload'
import { NAVIGATION_DELAY_AFTER_SUCCESS } from '@/constants/alert'
import type { ArticleFormValues } from '@/types/form'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading, error: createError } = useArticle()
const { alert, showAlert, hideAlert } = useAlert()

// Submit handler
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  // Clear any existing alert before starting new operation
  hideAlert()

  try {
    const payload = buildNewArticlePayload(articleFormValues)
    const result = await create(payload)

    if (result) {
      const message = getSuccessMessage(articleFormValues.publishSetting)
      showAlert({ variant: 'default', title: 'Success', message })
      setTimeout(() => router.push('/admin'), NAVIGATION_DELAY_AFTER_SUCCESS)
    }
  } catch {
    // createError.value is already set by useArticle
    if (createError.value) {
      showAlert({
        variant: 'destructive',
        title: 'Error',
        message: createError.value.message,
        duration: Infinity // Never auto-hide error messages
      })
    }
  }
}

const getSuccessMessage = (publishSetting: ArticleFormValues['publishSetting']) => {
  switch (publishSetting) {
    case 'publish-immediate':
      return 'Article published successfully'
    case 'publish-scheduled':
      return 'Article scheduled successfully'
    case 'save-draft':
      return 'Draft saved successfully'
    default:
      return 'Article saved successfully'
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">New Article</h1>
      <p class="text-muted-foreground mt-2">Create a new blog article</p>
    </div>

    <Alert v-if="alert.show" :variant="alert.variant" class="mb-6" @close="hideAlert">
      <AlertTitle>{{ alert.title }}</AlertTitle>
      <AlertDescription>{{ alert.message }}</AlertDescription>
    </Alert>

    <ArticleForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>
