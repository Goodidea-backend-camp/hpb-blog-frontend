import { useState } from '#app'
import type { Article, NewArticle, UpdateArticle } from '@/types/api'
import { useApiClient } from './useApiClient'

export function useArticle() {
  const articles = useState<Article[]>('articles', () => [])
  const currentArticle = useState<Article | null>('currentArticle', () => null)
  const loading = useState<boolean>('articles:loading', () => false)

  // Get API client with automatic token injection
  const apiClient = useApiClient()

  async function list() {
    loading.value = true

    try {
      const result = await apiClient.get<Article[]>('/articles')
      articles.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  async function get(slug: string) {
    loading.value = true

    try {
      const result = await apiClient.get<Article>(`/articles/${slug}`)
      currentArticle.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  async function create(newArticle: NewArticle) {
    loading.value = true

    try {
      const result = await apiClient.post<Article>('/articles', newArticle)
      // Automatically update articles list
      articles.value = [result, ...articles.value]
      return result
    } finally {
      loading.value = false
    }
  }

  async function update(slug: string, updatedArticle: UpdateArticle) {
    loading.value = true

    try {
      const result = await apiClient.put<Article>(`/articles/${slug}`, updatedArticle)
      // Update article in list
      const index = articles.value.findIndex((a) => a.slug === slug)
      if (index !== -1) {
        articles.value[index] = result
      }
      // Update current article
      if (currentArticle.value?.slug === slug) {
        currentArticle.value = result
      }
      return result
    } finally {
      loading.value = false
    }
  }

  async function remove(slug: string) {
    loading.value = true

    try {
      await apiClient.delete(`/articles/${slug}`)
      // Remove from list
      articles.value = articles.value.filter((a) => a.slug !== slug)
      // Clear current article
      if (currentArticle.value?.slug === slug) {
        currentArticle.value = null
      }
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    currentArticle,
    loading,
    list,
    get,
    create,
    update,
    remove
  }
}
