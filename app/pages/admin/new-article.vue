<script setup lang="ts">
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import ArticleForm from '@/components/article/ArticleForm.vue'
import { useArticle } from '@/composables/useArticle'
import { buildNewArticlePayload } from '@/composables/useArticleForm'
import type { ArticleFormValues } from '@/composables/useArticleForm'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { create, loading, error: apiError } = useArticle()

// Submit handlers
const handleSaveDraft = async (values: ArticleFormValues) => {
  const article = buildNewArticlePayload(values, true)
  const result = await create(article)

  if (result) {
    alert('Draft saved')
    router.push('/admin')
  } else if (apiError.value) {
    alert(`Error: ${apiError.value.message}`)
  }
}

const handlePublish = async (values: ArticleFormValues) => {
  const article = buildNewArticlePayload(values, false)
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

    <ArticleForm :loading="loading" @save-draft="handleSaveDraft" @publish="handlePublish" />
  </div>
</template>
