import { ref } from 'vue'
import type { Article, NewArticle, UpdateArticle } from '@/types/api'
import { useApiClient } from './useApiClient'

export function useArticle() {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Get API client with automatic token injection
  const apiClient = useApiClient()

  async function list(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.get<Article[]>('/articles', params)
      articles.value = result
      return result
    } catch (e) {
      error.value = e as Error
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
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(article: NewArticle) {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.post<Article>('/articles', article)
      // 自動更新文章列表
      articles.value = [result, ...articles.value]
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(slug: string, article: UpdateArticle) {
    loading.value = true
    error.value = null

    try {
      const result = await apiClient.put<Article>(`/articles/${slug}`, article)
      // 更新列表中的文章
      const index = articles.value.findIndex((a) => a.slug === slug)
      if (index !== -1) {
        articles.value[index] = result
      }
      // 更新當前文章
      if (currentArticle.value?.slug === slug) {
        currentArticle.value = result
      }
      return result
    } catch (e) {
      error.value = e as Error
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
      // 從列表中移除
      articles.value = articles.value.filter((a) => a.slug !== slug)
      // 清除當前文章
      if (currentArticle.value?.slug === slug) {
        currentArticle.value = null
      }
    } catch (e) {
      error.value = e as Error
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
