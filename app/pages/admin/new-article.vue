<script setup lang="ts">
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import { toast } from 'vue-sonner'
import ArticleForm from '@/components/article/ArticleForm.vue'
import { useArticle } from '@/composables/useArticle'
import { buildNewArticlePayload } from '@/composables/useArticlePayload'
import { NAVIGATION_DELAY_AFTER_SUCCESS } from '@/constants/alert'
import type { ArticleFormValues } from '@/types/form'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading } = useArticle()

// Submit handler
const handleSubmit = async (articleFormValues: ArticleFormValues) => {
  const payload = buildNewArticlePayload(articleFormValues)
  await create(payload)

  // Success: show toast and redirect to /admin (redirect to /admin/edit/{slug} in future)
  const message = getSuccessMessage(articleFormValues.publishSetting)
  toast.success(message)
  setTimeout(() => router.push('/admin'), NAVIGATION_DELAY_AFTER_SUCCESS)
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
