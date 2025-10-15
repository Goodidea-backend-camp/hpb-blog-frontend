<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'
import { toast } from 'vue-sonner'
import ArticleForm from '@/components/article/ArticleForm.vue'
import { useArticle } from '@/composables/useArticle'
import { buildNewArticlePayload } from '@/composables/useArticlePayload'
import type { ArticleFormValues } from '@/types/form'

definePageMeta({
  layout: 'admin'
})

const { create, loading } = useArticle()

// Submit handler
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  try {
    const payload = buildNewArticlePayload(articleFormValues)
    const _newArticle = await create(payload)

    const message = getSuccessMessage(articleFormValues.publishSetting)
    toast.success(message)

    // TODO: Once the edit page is ready, redirect to /admin/edit/{_newArticle.slug}
    await navigateTo('/admin')
  } catch {
    toast.error('An unexpected error occurred. Please try again.')
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

    <ArticleForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>
