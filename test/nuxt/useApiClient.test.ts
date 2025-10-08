import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { ApiError } from '@/utils/errors'
import { useApiClient } from '@/composables/useApiClient'
import {
  createMockApiError,
  createMockApiErrorWithStatus,
  createIncompleteError
} from '../unit/api-mock-data'

// Mock $fetch globally
const mockFetch = vi.fn()

// Mock the global $fetch function that Nuxt auto-imports
Object.defineProperty(globalThis, '$fetch', {
  value: mockFetch,
  writable: true,
  configurable: true
})

// Mock useJwtToken
vi.mock('@/composables/useJwtToken', () => ({
  useJwtToken: vi.fn()
}))

describe('useApiClient', () => {
  let mockFetchFn: MockedFunction<typeof mockFetch>
  let mockTokenRef: { value: string | null }

  beforeEach(async () => {
    mockFetchFn = mockFetch as MockedFunction<typeof mockFetch>
    vi.clearAllMocks()

    // Create a mock token ref
    mockTokenRef = { value: null }

    // Mock useJwtToken to return our mock token ref
    const { useJwtToken } = await import('@/composables/useJwtToken')
    vi.mocked(useJwtToken).mockReturnValue({
      token: mockTokenRef as ReturnType<typeof useJwtToken>['token'],
      get: () => mockTokenRef.value,
      set: (val: string) => {
        mockTokenRef.value = val
      },
      remove: () => {
        mockTokenRef.value = null
      }
    })
  })

  describe('request method', () => {
    it('should make a GET request with correct parameters', async () => {
      const mockResponse = { data: 'test' }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.get('/test', { param: 'value' })

      expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: undefined,
        query: { param: 'value' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should make a POST request with body', async () => {
      const mockResponse = { success: true }
      const requestBody = { title: 'Test' }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.post('/test', requestBody)

      expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody,
        query: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include Authorization header when token is available', async () => {
      const mockResponse = { data: 'test' }
      mockFetchFn.mockResolvedValue(mockResponse)

      // Set token value
      mockTokenRef.value = 'test-token'

      const apiClient = useApiClient()
      await apiClient.get('/test')

      expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: undefined,
        query: undefined
      })
    })

    describe('token edge cases', () => {
      it('should not include Authorization header when token is empty string', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        // Set token to empty string
        mockTokenRef.value = ''

        const apiClient = useApiClient()
        await apiClient.get('/test')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })

      it('should not include Authorization header when token is undefined', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        // Set token to undefined
        mockTokenRef.value = undefined as unknown as null

        const apiClient = useApiClient()
        await apiClient.get('/test')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })
    })

    it('should handle $fetch errors and throw ApiError', async () => {
      const mockError = createMockApiError(404, 'Not found')
      mockFetchFn.mockRejectedValue(mockError)

      const apiClient = useApiClient()
      await expect(apiClient.get('/test')).rejects.toThrow(ApiError)

      try {
        await apiClient.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(404)
        expect((error as ApiError).message).toBe('Not found')
        expect((error as ApiError).code).toBe(404)
        expect((error as ApiError).response).toEqual({ code: 404, message: 'Not found' })
      }
    })

    it('should handle unknown errors with default values', async () => {
      const mockError = { unknown: 'error' }
      mockFetchFn.mockRejectedValue(mockError)

      const apiClient = useApiClient()
      await expect(apiClient.get('/test')).rejects.toThrow(ApiError)

      try {
        await apiClient.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(500)
        expect((error as ApiError).message).toBe('An unknown error occurred')
        expect((error as ApiError).code).toBeUndefined()
      }
    })

    describe('HTTP status codes', () => {
      it('should handle 400 Bad Request errors', async () => {
        const mockError = createMockApiErrorWithStatus(400, 'Title and content are required.')
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/articles', {})
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(400)
          expect((error as ApiError).message).toBe('Title and content are required.')
          expect((error as ApiError).code).toBe(400)
          expect((error as ApiError).response).toEqual({
            code: 400,
            message: 'Title and content are required.'
          })
        }
      })

      it('should handle 401 Unauthorized errors', async () => {
        const mockError = createMockApiErrorWithStatus(401, 'Invalid username or password.')
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/auth/login', { username: 'test', password: 'wrong' })
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(401)
          expect((error as ApiError).message).toBe('Invalid username or password.')
          expect((error as ApiError).code).toBe(401)
          expect((error as ApiError).response).toEqual({
            code: 401,
            message: 'Invalid username or password.'
          })
        }
      })

      it('should handle 403 Forbidden errors', async () => {
        const mockError = createMockApiErrorWithStatus(
          403,
          'You are not authorized to create articles.'
        )
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/articles', { title: 'Test' })
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(403)
          expect((error as ApiError).message).toBe('You are not authorized to create articles.')
          expect((error as ApiError).code).toBe(403)
          expect((error as ApiError).response).toEqual({
            code: 403,
            message: 'You are not authorized to create articles.'
          })
        }
      })

      it('should handle 409 Conflict errors', async () => {
        const mockError = createMockApiErrorWithStatus(409, 'A post with this slug already exists.')
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/articles', { title: 'Test', slug: 'existing-slug' })
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(409)
          expect((error as ApiError).message).toBe('A post with this slug already exists.')
          expect((error as ApiError).code).toBe(409)
          expect((error as ApiError).response).toEqual({
            code: 409,
            message: 'A post with this slug already exists.'
          })
        }
      })

      it('should handle 422 Unprocessable Entity errors', async () => {
        const mockError = createMockApiErrorWithStatus(
          422,
          'Request syntax correct but contains semantic errors.'
        )
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/articles', { title: 'Test', content: 'Content' })
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(422)
          expect((error as ApiError).message).toBe(
            'Request syntax correct but contains semantic errors.'
          )
          expect((error as ApiError).code).toBe(422)
          expect((error as ApiError).response).toEqual({
            code: 422,
            message: 'Request syntax correct but contains semantic errors.'
          })
        }
      })

      it('should handle 500 Internal Server errors with message', async () => {
        const mockError = createMockApiErrorWithStatus(
          500,
          'Failed to create article due to a server issue.'
        )
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.post('/articles', { title: 'Test' })
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(500)
          expect((error as ApiError).message).toBe(
            'Failed to create article due to a server issue.'
          )
          expect((error as ApiError).code).toBe(500)
          expect((error as ApiError).response).toEqual({
            code: 500,
            message: 'Failed to create article due to a server issue.'
          })
        }
      })
    })

    describe('error structure edge cases', () => {
      it('should default to 500 when statusCode is missing', async () => {
        const mockError = createIncompleteError({
          data: { code: 400, message: 'Error without status code' }
        })
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.get('/test')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(500)
          expect((error as ApiError).message).toBe('Error without status code')
          expect((error as ApiError).code).toBe(400)
          expect((error as ApiError).response).toEqual({
            code: 400,
            message: 'Error without status code'
          })
        }
      })

      it('should default message when data is missing', async () => {
        const mockError = createIncompleteError({
          statusCode: 404
        })
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.get('/test')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(404)
          expect((error as ApiError).message).toBe('An unknown error occurred')
          expect((error as ApiError).code).toBeUndefined()
          expect((error as ApiError).response).toBeUndefined()
        }
      })

      it('should default message when data.message is missing', async () => {
        // Note: This tests a defensive case where backend violates the Swagger spec
        // (code and message are both required per spec, but we handle missing message)
        const mockError = createIncompleteError({
          statusCode: 400,
          data: { code: 400 }
        })
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.get('/test')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(400)
          expect((error as ApiError).message).toBe('An unknown error occurred')
          expect((error as ApiError).code).toBe(400)
          expect((error as ApiError).response).toEqual({ code: 400 })
        }
      })

      it('should preserve empty string message', async () => {
        const mockError = createIncompleteError({
          statusCode: 400,
          data: { code: 400, message: '' }
        })
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.get('/test')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(400)
          expect((error as ApiError).message).toBe('')
          expect((error as ApiError).code).toBe(400)
          expect((error as ApiError).response).toEqual({ code: 400, message: '' })
        }
      })

      it('should preserve complete error response with extra fields', async () => {
        const mockError = createIncompleteError({
          statusCode: 400,
          data: {
            code: 400,
            message: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password too short' }
            ],
            timestamp: '2023-01-01T00:00:00Z'
          }
        })
        mockFetchFn.mockRejectedValue(mockError)

        const apiClient = useApiClient()

        try {
          await apiClient.get('/test')
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError)
          expect((error as ApiError).statusCode).toBe(400)
          expect((error as ApiError).message).toBe('Validation failed')
          expect((error as ApiError).code).toBe(400)
          expect((error as ApiError).response).toEqual({
            code: 400,
            message: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password too short' }
            ],
            timestamp: '2023-01-01T00:00:00Z'
          })
        }
      })
    })

    describe('query parameters edge cases', () => {
      it('should handle empty query object', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/test', {})

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: {}
        })
      })

      it('should handle query with multiple parameters', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { page: 1, limit: 10, sort: 'desc' })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { page: 1, limit: 10, sort: 'desc' }
        })
      })

      it('should handle query with special characters', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { search: 'test&foo=bar' })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { search: 'test&foo=bar' }
        })
      })

      it('should handle query with numeric values', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { page: 1, limit: 10 })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { page: 1, limit: 10 }
        })
      })

      it('should handle query with boolean values', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { published: true, draft: false })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { published: true, draft: false }
        })
      })

      it('should handle query with null values', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { filter: null })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { filter: null }
        })
      })

      it('should handle query with undefined values', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles', { filter: undefined })

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: { filter: undefined }
        })
      })
    })

    describe('body edge cases', () => {
      it('should handle null body in POST', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.post('/test', null)

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: null,
          query: undefined
        })
      })

      it('should handle undefined body in POST', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.post('/test', undefined)

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })

      it('should handle empty object body', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.post('/test', {})

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {},
          query: undefined
        })
      })

      it('should handle nested object body', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const nestedBody = {
          user: {
            name: 'test',
            profile: {
              email: 'test@example.com',
              age: 25
            }
          }
        }

        const apiClient = useApiClient()
        await apiClient.post('/test', nestedBody)

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: nestedBody,
          query: undefined
        })
      })

      it('should handle array body', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const arrayBody = [1, 2, 3, 4, 5]

        const apiClient = useApiClient()
        await apiClient.post('/test', arrayBody)

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: arrayBody,
          query: undefined
        })
      })

      it('should handle string body', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const stringBody = 'raw string data'

        const apiClient = useApiClient()
        await apiClient.post('/test', stringBody)

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: stringBody,
          query: undefined
        })
      })
    })

    describe('endpoint format variations', () => {
      it('should handle endpoint without leading slash', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('test')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })

      it('should handle endpoint with multiple path segments', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/articles/my-slug/comments')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/articles/my-slug/comments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })

      it('should handle root endpoint', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/')

        expect(mockFetchFn).toHaveBeenCalledWith('/api', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })

      it('should handle endpoint with trailing slash', async () => {
        const mockResponse = { data: 'test' }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        await apiClient.get('/test/')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
      })
    })
  })

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockFetchFn.mockResolvedValue({ success: true })
    })

    it('should call GET method correctly', async () => {
      const mockResponse = { data: 'test' }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.get('/test', { param: 'value' })

      expect(result).toEqual(mockResponse)
    })

    it('should call POST method correctly', async () => {
      const mockResponse = { success: true }
      const body = { data: 'test' }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.post('/test', body)

      expect(result).toEqual(mockResponse)
    })

    it('should call PUT method correctly', async () => {
      const mockResponse = { updated: true }
      const body = { data: 'updated' }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.put('/test', body)

      expect(result).toEqual(mockResponse)
    })

    it('should call DELETE method correctly', async () => {
      const mockResponse = { deleted: true }
      mockFetchFn.mockResolvedValue(mockResponse)

      const apiClient = useApiClient()
      const result = await apiClient.delete('/test')

      expect(result).toEqual(mockResponse)
    })

    describe('method and body combinations', () => {
      it('should allow POST without body', async () => {
        const mockResponse = { success: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        const result = await apiClient.post('/test')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
        expect(result).toEqual(mockResponse)
      })

      it('should allow PUT without body', async () => {
        const mockResponse = { updated: true }
        mockFetchFn.mockResolvedValue(mockResponse)

        const apiClient = useApiClient()
        const result = await apiClient.put('/test')

        expect(mockFetchFn).toHaveBeenCalledWith('/api/test', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: undefined,
          query: undefined
        })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('reactive token integration', () => {
    it('should use updated token value in subsequent requests', async () => {
      mockFetchFn.mockResolvedValue({ success: true })

      const apiClient = useApiClient()

      // First request without token
      await apiClient.get('/test1')
      expect(mockFetchFn).toHaveBeenLastCalledWith(
        '/api/test1',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )

      // Set token
      mockTokenRef.value = 'new-token'

      // Second request should include token
      await apiClient.get('/test2')
      expect(mockFetchFn).toHaveBeenLastCalledWith(
        '/api/test2',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer new-token'
          }
        })
      )

      // Remove token
      mockTokenRef.value = null

      // Third request should not include token
      await apiClient.get('/test3')
      expect(mockFetchFn).toHaveBeenLastCalledWith(
        '/api/test3',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )
    })
  })
})
