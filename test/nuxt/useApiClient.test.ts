import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { ApiError } from '@/utils/errors'
import { useApiClient } from '@/composables/useApiClient'
import { createMockApiError } from '../unit/api-mock-data'

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
        expect((error as ApiError).response).toEqual({ message: 'Not found' })
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
        expect((error as ApiError).message).toBe('發生未知錯誤')
      }
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
