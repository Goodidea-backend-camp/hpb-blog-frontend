import { ApiError } from '@/utils/errors'
import { useJwtToken } from './useJwtToken'

/**
 * API Client composable with automatic JWT token injection
 * Uses reactive token from useJwtToken for up-to-date authentication
 */
export function useApiClient() {
  const { token } = useJwtToken()
  const baseURL = '/api'

  // 通用請求方法
  async function request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: unknown
      query?: Record<string, unknown>
    } = {}
  ): Promise<T> {
    const url = `${baseURL}${endpoint}`

    // 設定預設 headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // 自動加入 JWT token - 從響應式 ref 讀取最新值
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      const response = await $fetch<T>(url, {
        method: options.method || 'GET',
        headers,
        body: options.body as Record<string, unknown> | BodyInit | null | undefined,
        query: options.query
      })

      return response
    } catch (error: unknown) {
      // 簡化錯誤處理：$fetch 統一錯誤格式
      const errorObj = error as {
        statusCode?: number
        status?: number
        data?: { message?: string }
        message?: string
      }
      const statusCode = errorObj.statusCode || errorObj.status || 500
      const message = errorObj.data?.message || errorObj.message || '發生未知錯誤'
      const responseData = errorObj.data

      throw new ApiError(message, statusCode, responseData)
    }
  }

  // GET 請求
  async function get<T>(endpoint: string, query?: Record<string, unknown>): Promise<T> {
    return request<T>(endpoint, {
      method: 'GET',
      query
    })
  }

  // POST 請求
  async function post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body
    })
  }

  // PUT 請求
  async function put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body
    })
  }

  // DELETE 請求
  async function deleteRequest<T>(endpoint: string): Promise<T> {
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
