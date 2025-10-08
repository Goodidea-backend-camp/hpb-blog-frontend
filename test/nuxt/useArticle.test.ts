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
    it('should fetch all articles', async () => {
      const mockArticles = createMockArticlesList(3)

      mockApiClient.get.mockResolvedValue(mockArticles)

      const { list, articles, loading, error } = useArticle()

      expect(loading.value).toBe(false)

      const promise = list()
      expect(loading.value).toBe(true)

      const result = await promise

      expect(mockApiClient.get).toHaveBeenCalledWith('/articles')
      expect(articles.value).toEqual(mockArticles)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result).toEqual(mockArticles)
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

    it('should set loading to true during get and false after completion', async () => {
      const mockArticle = createMockArticle()
      const slug = 'test-article'

      mockApiClient.get.mockResolvedValue(mockArticle)

      const { get, loading } = useArticle()

      expect(loading.value).toBe(false)

      const promise = get(slug)
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })

    it('should set loading to false even on error', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'

      mockApiClient.get.mockRejectedValue(mockError)

      const { get, loading } = useArticle()

      expect(loading.value).toBe(false)

      await expect(get(slug)).rejects.toEqual(mockError)

      expect(loading.value).toBe(false)
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

    it('should set loading to true during create and false after completion', async () => {
      const mockNewArticle = createMockNewArticle()
      const mockCreatedArticle = createMockArticle()

      mockApiClient.post.mockResolvedValue(mockCreatedArticle)

      const { create, loading } = useArticle()

      expect(loading.value).toBe(false)

      const promise = create(mockNewArticle)
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })

    it('should set loading to false even on error', async () => {
      const mockError = createMockApiError(400, 'Bad request')
      const mockNewArticle = createMockNewArticle()

      mockApiClient.post.mockRejectedValue(mockError)

      const { create, loading } = useArticle()

      expect(loading.value).toBe(false)

      await expect(create(mockNewArticle)).rejects.toEqual(mockError)

      expect(loading.value).toBe(false)
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

    it('should not update articles list on create failure', async () => {
      const existingArticles = createMockArticlesList(2)
      const mockNewArticle = createMockNewArticle()
      const mockError = createMockApiError(400, 'Bad request')

      mockApiClient.post.mockRejectedValue(mockError)

      const { create, articles } = useArticle()
      articles.value = [...existingArticles]

      await expect(create(mockNewArticle)).rejects.toEqual(mockError)

      expect(articles.value).toEqual(existingArticles)
      expect(articles.value.length).toBe(2)
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

    it('should set loading to true during update and false after completion', async () => {
      const slug = 'test-article'
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle({ slug })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, loading } = useArticle()

      expect(loading.value).toBe(false)

      const promise = update(slug, mockUpdateData)
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })

    it('should set loading to false even on error', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'
      const mockUpdateData = createMockUpdateArticle()

      mockApiClient.put.mockRejectedValue(mockError)

      const { update, loading } = useArticle()

      expect(loading.value).toBe(false)

      await expect(update(slug, mockUpdateData)).rejects.toEqual(mockError)

      expect(loading.value).toBe(false)
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

    it('should not update articles list on update failure', async () => {
      const slug = 'test-article'
      const existingArticles = createMockArticlesList(3)
      existingArticles[1] = createMockArticle({ slug, title: 'Old Title' })

      const mockUpdateData = createMockUpdateArticle({ title: 'New Title' })
      const mockError = createMockApiError(404, 'Not found')

      mockApiClient.put.mockRejectedValue(mockError)

      const { update, articles } = useArticle()
      articles.value = [...existingArticles]

      await expect(update(slug, mockUpdateData)).rejects.toEqual(mockError)

      expect(articles.value[1]?.title).toBe('Old Title')
      expect(articles.value.length).toBe(3)
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

    it('should not update article in list if slug not found', async () => {
      const slug = 'non-existent'
      const existingArticles = createMockArticlesList(2)
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle({ slug })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, articles } = useArticle()
      articles.value = [...existingArticles]

      await update(slug, mockUpdateData)

      // List should remain unchanged
      expect(articles.value).toEqual(existingArticles)
      expect(articles.value.length).toBe(2)
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

    it('should set loading to true during remove and false after completion', async () => {
      const slug = 'test-article'

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, loading } = useArticle()

      expect(loading.value).toBe(false)

      const promise = remove(slug)
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })

    it('should set loading to false even on error', async () => {
      const mockError = createMockApiError(404, 'Not found')
      const slug = 'non-existent'

      mockApiClient.delete.mockRejectedValue(mockError)

      const { remove, loading } = useArticle()

      expect(loading.value).toBe(false)

      await expect(remove(slug)).rejects.toEqual(mockError)

      expect(loading.value).toBe(false)
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

    it('should not clear currentArticle if slugs do not match', async () => {
      const slug = 'test-article'
      const differentArticle = createMockArticle({ slug: 'different-article' })

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, currentArticle } = useArticle()
      currentArticle.value = differentArticle

      await remove(slug)

      expect(currentArticle.value).toEqual(differentArticle)
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

  describe('error clearing', () => {
    it('should clear previous error on successful list', async () => {
      const mockArticles = createMockArticlesList(2)
      const mockError = createMockApiError(500, 'Server error')

      mockApiClient.get.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockArticles)

      const { list, error } = useArticle()

      // First call fails
      await expect(list()).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)

      // Second call succeeds and clears error
      await list()
      expect(error.value).toBe(null)
    })

    it('should clear previous error on successful get', async () => {
      const mockArticle = createMockArticle()
      const mockError = createMockApiError(404, 'Not found')

      mockApiClient.get.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockArticle)

      const { get, error } = useArticle()

      // First call fails
      await expect(get('non-existent')).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)

      // Second call succeeds and clears error
      await get('test-article')
      expect(error.value).toBe(null)
    })

    it('should clear previous error on successful create', async () => {
      const mockNewArticle = createMockNewArticle()
      const mockCreatedArticle = createMockArticle()
      const mockError = createMockApiError(400, 'Bad request')

      mockApiClient.post.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockCreatedArticle)

      const { create, error } = useArticle()

      // First call fails
      await expect(create(mockNewArticle)).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)

      // Second call succeeds and clears error
      await create(mockNewArticle)
      expect(error.value).toBe(null)
    })

    it('should clear previous error on successful update', async () => {
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle()
      const mockError = createMockApiError(404, 'Not found')

      mockApiClient.put.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockUpdatedArticle)

      const { update, error } = useArticle()

      // First call fails
      await expect(update('non-existent', mockUpdateData)).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)

      // Second call succeeds and clears error
      await update('test-article', mockUpdateData)
      expect(error.value).toBe(null)
    })

    it('should clear previous error on successful remove', async () => {
      const mockError = createMockApiError(404, 'Not found')

      mockApiClient.delete.mockRejectedValueOnce(mockError).mockResolvedValueOnce(undefined)

      const { remove, error } = useArticle()

      // First call fails
      await expect(remove('non-existent')).rejects.toEqual(mockError)
      expect(error.value).toEqual(mockError)

      // Second call succeeds and clears error
      await remove('test-article')
      expect(error.value).toBe(null)
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent list calls', async () => {
      const mockArticles1 = createMockArticlesList(2)
      const mockArticles2 = createMockArticlesList(3)

      mockApiClient.get.mockResolvedValueOnce(mockArticles1).mockResolvedValueOnce(mockArticles2)

      const { list, articles } = useArticle()

      const [result1, result2] = await Promise.all([list(), list()])

      // Last resolved call should win
      expect(articles.value).toEqual(mockArticles2)
      expect(result1).toEqual(mockArticles1)
      expect(result2).toEqual(mockArticles2)
    })

    it('should handle concurrent get calls for different slugs', async () => {
      const mockArticle1 = createMockArticle({ slug: 'article-1' })
      const mockArticle2 = createMockArticle({ slug: 'article-2' })

      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('article-1')) return Promise.resolve(mockArticle1)
        if (url.includes('article-2')) return Promise.resolve(mockArticle2)
        return Promise.reject(new Error('Not found'))
      })

      const { get, currentArticle } = useArticle()

      const [result1, result2] = await Promise.all([get('article-1'), get('article-2')])

      // Last resolved call should win
      expect(currentArticle.value).toEqual(mockArticle2)
      expect(result1).toEqual(mockArticle1)
      expect(result2).toEqual(mockArticle2)
    })
  })

  describe('empty list operations', () => {
    it('should handle update when articles list is empty', async () => {
      const slug = 'test-article'
      const mockUpdateData = createMockUpdateArticle()
      const mockUpdatedArticle = createMockArticle({ slug })

      mockApiClient.put.mockResolvedValue(mockUpdatedArticle)

      const { update, articles } = useArticle()

      // articles.value is [] by default
      expect(articles.value).toEqual([])

      await update(slug, mockUpdateData)

      // List should remain empty since article wasn't in it
      expect(articles.value).toEqual([])
    })

    it('should handle remove when articles list is empty', async () => {
      const slug = 'test-article'

      mockApiClient.delete.mockResolvedValue(undefined)

      const { remove, articles } = useArticle()

      // articles.value is [] by default
      expect(articles.value).toEqual([])

      await remove(slug)

      // List should remain empty
      expect(articles.value).toEqual([])
    })

    it('should add to empty list on create', async () => {
      const mockNewArticle = createMockNewArticle()
      const mockCreatedArticle = createMockArticle()

      mockApiClient.post.mockResolvedValue(mockCreatedArticle)

      const { create, articles } = useArticle()

      // articles.value is [] by default
      expect(articles.value).toEqual([])

      await create(mockNewArticle)

      // New article should be added to empty list
      expect(articles.value).toEqual([mockCreatedArticle])
    })
  })
})
