import { ApiError } from '@/utils/errors'
import { useJwtToken } from './useJwtToken'
import { joinURL } from 'ufo'

/**
 * API Client composable with automatic JWT token injection
 * Uses reactive token from useJwtToken for up-to-date authentication
 */
export function useApiClient() {
  const { token } = useJwtToken()
  const baseURL = '/api'

  // Generic request method
  async function request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: unknown
      query?: Record<string, unknown>
    } = {}
  ) {
    const url = joinURL(baseURL, endpoint)

    // Set default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Inject JWT token from reactive ref
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(url, {
        method: options.method || 'GET',
        headers,
        body: options.body as Record<string, unknown> | BodyInit | null | undefined,
        query: options.query
      })
    } catch (error: unknown) {
      // Transform $fetch error into ApiError based on backend API spec
      const errorObj = error as {
        statusCode?: number
        data?: { code?: number; message?: string }
      }
      const statusCode = errorObj.statusCode ?? 500
      const message = errorObj.data?.message ?? 'An unknown error occurred'
      const code = errorObj.data?.code

      throw new ApiError(message, statusCode, errorObj.data, code)
    }
  }

  // GET request
  async function get<T>(endpoint: string, query?: Record<string, unknown>) {
    return request<T>(endpoint, {
      method: 'GET',
      query
    })
  }

  // POST request
  async function post<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, {
      method: 'POST',
      body
    })
  }

  // PUT request
  async function put<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, {
      method: 'PUT',
      body
    })
  }

  // DELETE request
  async function deleteRequest<T>(endpoint: string) {
    return request<T>(endpoint, {
      method: 'DELETE'
    })
  }

  return {
    request,
    get,
    post,
    put,
    delete: deleteRequest
  }
}
