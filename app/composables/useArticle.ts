import { useState } from '#app'
import type { Article, NewArticle, UpdateArticle } from '@/types/api'
import { useApiClient } from './useApiClient'
import { toast } from 'vue-sonner'
import type { ApiError } from '@/utils/errors'

export function useArticle() {
  const articles = useState<Article[]>('articles', () => [])
  const currentArticle = useState<Article | null>('currentArticle', () => null)
  const loading = useState<boolean>('articles:loading', () => false)
  const error = useState<ApiError | null>('articles:error', () => null)

  // Get API client with automatic token injection
  const apiClient = useApiClient()

  async function list() {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.get<Article[]>('/articles')
      articles.value = result
      return result
    } catch (e) {
      const apiError = e as ApiError
      error.value = apiError
      toast.error('Failed to load articles', {
        description: apiError.message
      })
      throw e
    } finally {
      loading.value = false
    }
  }

  async function get(slug: string) {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.get<Article>(`/articles/${slug}`)
      currentArticle.value = result
      return result
    } catch (e) {
      const apiError = e as ApiError
      error.value = apiError
      toast.error('Failed to load article', {
        description: apiError.message
      })
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(newArticle: NewArticle) {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.post<Article>('/articles', newArticle)
      // Automatically update articles list
      articles.value = [result, ...articles.value]
      return result
    } catch (e) {
      const apiError = e as ApiError
      error.value = apiError
      toast.error('Failed to create article', {
        description: apiError.message
      })
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(slug: string, updatedArticle: UpdateArticle) {
    loading.value = true
    error.value = null

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
    } catch (e) {
      const apiError = e as ApiError
      error.value = apiError
      toast.error('Failed to update article', {
        description: apiError.message
      })
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(slug: string) {
    loading.value = true
    error.value = null

    try {
      await apiClient.delete(`/articles/${slug}`)
      // Remove from list
      articles.value = articles.value.filter((a) => a.slug !== slug)
      // Clear current article
      if (currentArticle.value?.slug === slug) {
        currentArticle.value = null
      }
    } catch (e) {
      const apiError = e as ApiError
      error.value = apiError
      toast.error('Failed to delete article', {
        description: apiError.message
      })
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    currentArticle,
    loading,
    error,
    list,
    get,
    create,
    update,
    remove
  }
}
