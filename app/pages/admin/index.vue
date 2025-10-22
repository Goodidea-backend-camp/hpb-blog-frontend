<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { definePageMeta } from '#imports'
import { useArticle } from '@/composables/useArticle'
import ArticleDataTable from '@/components/article-list/ArticleDataTable.vue'
import { columns } from '@/components/article-list/columns'

definePageMeta({
  layout: 'admin'
})

const { articles, list, loading } = useArticle()

// Sort articles by created_at DESC
const sortedArticles = computed(() => {
  return [...articles.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

onMounted(async () => {
  await list()
})
</script>

<template>
  <div>
    <div data-testid="admin-main-content" class="rounded-xl">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Articles</h1>
      </div>
      <ArticleDataTable :columns="columns" :data="sortedArticles" :loading="loading" />
    </div>
  </div>
</template>
