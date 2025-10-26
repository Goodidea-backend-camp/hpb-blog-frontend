<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { definePageMeta, navigateTo } from '#imports'
import { Plus } from 'lucide-vue-next'
import { useArticle } from '@/composables/useArticle'
import ArticleDataTable from '@/components/article-list/ArticleDataTable.vue'
import { columns } from '@/components/article-list/columns'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'admin'
})

const { articles, list, loading, error } = useArticle()

// Sort articles by created_at DESC
const sortedArticles = computed(() => {
  return [...articles.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const handleRetry = async () => {
  await list()
}

const handleWrite = () => {
  navigateTo('/admin/new-article')
}

onMounted(async () => {
  await list()
})
</script>

<template>
  <div>
    <div data-testid="admin-main-content" class="rounded-xl">
      <div class="mb-6 flex items-center gap-4">
        <h1 class="text-3xl font-bold">Articles</h1>
        <Button @click="handleWrite">
          <Plus class="size-4" />
          Write
        </Button>
      </div>
      <ArticleDataTable
        :columns="columns"
        :data="sortedArticles"
        :loading="loading"
        :error="error"
        @retry="handleRetry"
      />
    </div>
  </div>
</template>
