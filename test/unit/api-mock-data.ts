import type {
  LoginUser,
  AuthorInfo,
  Article,
  NewArticle,
  UpdateArticle,
  LoginRequest,
  LoginResponse
} from '@/types/api'
import { ApiError } from '@/utils/errors'

export const createMockUser = (overrides: Partial<LoginUser> = {}): LoginUser => ({
  username: 'testuser',
  ...overrides
})

export const createMockAuthorInfo = (overrides: Partial<AuthorInfo> = {}): AuthorInfo => ({
  id: 1,
  username: 'author',
  ...overrides
})

export const createMockArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 1,
  author: createMockAuthorInfo(),
  title: 'Test Article',
  slug: 'test-article',
  content: 'This is test content',
  published_at: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockNewArticle = (overrides: Partial<NewArticle> = {}): NewArticle => ({
  title: 'New Test Article',
  content: 'New test content',
  slug: 'new-test-article',
  published_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockUpdateArticle = (overrides: Partial<UpdateArticle> = {}): UpdateArticle => ({
  title: 'Updated Test Article',
  content: 'Updated test content',
  ...overrides
})

export const createMockLoginRequest = (overrides: Partial<LoginRequest> = {}): LoginRequest => ({
  username: 'testuser',
  password: 'testpassword',
  ...overrides
})

export const createMockLoginResponse = (overrides: Partial<LoginResponse> = {}): LoginResponse => ({
  token: 'mock-jwt-token',
  user: createMockUser(),
  ...overrides
})

/**
 * Create mock $fetch error (for mocking fetch errors in useApiClient tests)
 * Returns the error format that $fetch throws
 */
export const createMockApiError = (
  statusCode: number = 500,
  message: string = 'Internal Server Error'
) => ({
  statusCode,
  status: statusCode,
  data: { code: statusCode, message },
  message,
  name: 'FetchError'
})

/**
 * Create actual ApiError instance (for testing error state in composables)
 * Use this when you need a real ApiError object, not a $fetch error mock
 */
export const createApiErrorInstance = (
  statusCode: number = 500,
  message: string = 'Internal Server Error'
): ApiError => {
  return new ApiError(message, statusCode, { code: statusCode, message }, statusCode)
}

/**
 * Create mock API error with predefined messages for common status codes
 */
export const createMockApiErrorWithStatus = (
  statusCode: 400 | 401 | 403 | 404 | 409 | 422 | 500,
  message?: string
) => {
  const defaultMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error'
  }

  return createMockApiError(statusCode, message || defaultMessages[statusCode])
}

/**
 * Create incomplete error structure for edge case testing
 */
export const createIncompleteError = (parts: {
  statusCode?: number
  data?: { code?: number; message?: string; [key: string]: unknown } | null
}) => parts

export const createMockArticlesList = (count: number = 3): Article[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockArticle({
      id: index + 1,
      title: `Test Article ${index + 1}`,
      slug: `test-article-${index + 1}`
    })
  )
}
