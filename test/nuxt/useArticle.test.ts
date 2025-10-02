import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useArticle } from '@/composables/useArticle'
import {
  createMockArticle,
  createMockArticlesList,
  createMockNewArticle,
  createMockUpdateArticle,
  createMockApiError
} from '../unit/api-mock-data'

// Mock useApiClient
vi.mock('@/composables/useApiClient', () => ({
  useApiClient: vi.fn()
}))

describe('useArticle', () => {
  let mockApiClient: {
    request: ReturnType<typeof vi.fn>
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock API client methods
    mockApiClient = {
      request: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }

    // Setup mock
    const { useApiClient } = await import('@/composables/useApiClient')
    vi.mocked(useApiClient).mockReturnValue(
      mockApiClient as unknown as ReturnType<typeof useApiClient>
    )
  })

  describe('list', () => {
    it('should fetch articles with query params', async () => {
      const mockArticles = createMockArticlesList(3)
      const mockParams = { page: 1, limit: 10 }

      mockApiClient.get.mockResolvedValue(mockArticles)

      const { list, articles, loading, error } = useArticle()

      expect(loading.value).toBe(false)

      const promise = list(mockParams)
      expect(loading.value).toBe(true)

      const result = await promise

      expect(mockApiClient.get).toHaveBeenCalledWith('/articles', mockParams)
      expect(articles.value).toEqual(mockArticles)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result).toEqual(mockArticles)
    })

    it('should fetch articles without query params', async () => {
      const mockArticles = createMockArticlesList(5)

      mockApiClient.get.mockResolvedValue(mockArticles)

      const { list, articles } = useArticle()

      await list()

      expect(mockApiClient.get).toHaveBeenCalledWith('/articles', undefined)
      expect(articles.value).toEqual(mockArticles)
    })

    it('should handle list errors', async () => {
      const mockError = createMockApiError(500, 'Server error')

      mockApiClient.get.mockRejectedValue(mockError)

      const { list, articles, loading, error } = useArticle()

      await expect(list()).rejects.toEqual(mockError)

      expect(articles.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toEqual(mockError)
    })
  })

  describe('get', () => {
    it('should fetch article by slug', async () => {
      const mockArticle = createMockArticle()
      const slug = 'test-article'

      mockApiClient.get.mockResolvedValue(mockArticle)

      const { get, currentArticle, loading, error } = useArticle()

      const result = await get(slug)

      expect(mockApiClient.get).toHaveBeenCalledWith('/articles/test-article')
      expect(currentArticle.value).toEqual(mockArticle)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result).toEqual(mockArticle)
    })

    it('should handle get errors', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'

      mockApiClient.get.mockRejectedValue(mockError)

      const { get, currentArticle, error } = useArticle()

      await expect(get(slug)).rejects.toEqual(mockError)

      expect(currentArticle.value).toBe(null)
      expect(error.value).toEqual(mockError)
    })
  })

  describe('create', () => {
    it('should create new article', async () => {
      const mockNewArticle = createMockNewArticle()
      const mockCreatedArticle = createMockArticle()

      mockApiClient.post.mockResolvedValue(mockCreatedArticle)

      const { create, articles, loading, error } = useArticle()

      const result = await create(mockNewArticle)

      expect(mockApiClient.post).toHaveBeenCalledWith('/articles', mockNewArticle)
      expect(articles.value[0]).toEqual(mockCreatedArticle)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result).toEqual(mockCreatedArticle)
    })

    it('should prepend new article to existing list', async () => {
      const existingArticles = createMockArticlesList(2)
      const mockNewArticle = createMockNewArticle()
      const mockCreatedArticle = createMockArticle({ id: 999 })

      mockApiClient.post.mockResolvedValue(mockCreatedArticle)

      const { create, articles } = useArticle()

      // Set existing articles
      articles.value = existingArticles

      await create(mockNewArticle)

      expect(articles.value[0]).toEqual(mockCreatedArticle)
      expect(articles.value.length).toBe(3)
    })

    it('should handle create errors', async () => {
      const mockError = createMockApiError(400, 'Bad request')
      const mockNewArticle = createMockNewArticle()

      mockApiClient.post.mockRejectedValue(mockError)

      const { create, error } = useArticle()

      await expect(create(mockNewArticle)).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)
    })
  })

  describe('update', () => {
    it('should update article', async () => {
      const slug = 'test-article'
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle({ slug })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, loading, error } = useArticle()

      const result = await update(slug, mockUpdateData)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/articles/${slug}`, mockUpdateData)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result).toEqual(mockUpdatedArticle)
    })

    it('should update article in list', async () => {
      const slug = 'test-article'
      const existingArticles = createMockArticlesList(3)
      existingArticles[1] = createMockArticle({ slug, title: 'Old Title' })

      const mockUpdateData = createMockUpdateArticle({ title: 'New Title' })
      const mockUpdatedArticle = createMockArticle({ slug, title: 'New Title' })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, articles } = useArticle()
      articles.value = existingArticles

      await update(slug, mockUpdateData)

      expect(articles.value[1]?.title).toBe('New Title')
    })

    it('should update currentArticle if slugs match', async () => {
      const slug = 'test-article'
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle({ slug })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, currentArticle } = useArticle()
      currentArticle.value = createMockArticle({ slug, title: 'Old Title' })

      await update(slug, mockUpdateData)

      expect(currentArticle.value).toEqual(mockUpdatedArticle)
    })

    it('should handle update errors', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'
      const mockUpdateData = createMockUpdateArticle()

      mockApiClient.put.mockRejectedValue(mockError)

      const { update, error } = useArticle()

      await expect(update(slug, mockUpdateData)).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)
    })
  })

  describe('remove', () => {
    it('should delete article', async () => {
      const slug = 'test-article'

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, loading, error } = useArticle()

      await remove(slug)

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/articles/${slug}`)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should remove article from list', async () => {
      const slug = 'test-article'
      const existingArticles = createMockArticlesList(3)
      existingArticles[1] = createMockArticle({ slug })

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, articles } = useArticle()
      articles.value = existingArticles

      await remove(slug)

      expect(articles.value.length).toBe(2)
      expect(articles.value.find((a) => a.slug === slug)).toBeUndefined()
    })

    it('should clear currentArticle if slugs match', async () => {
      const slug = 'test-article'

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, currentArticle } = useArticle()
      currentArticle.value = createMockArticle({ slug })

      await remove(slug)

      expect(currentArticle.value).toBe(null)
    })

    it('should handle delete errors', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'

      mockApiClient.delete.mockRejectedValue(mockError)

      const { remove, error } = useArticle()

      await expect(remove(slug)).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)
    })
  })
})
