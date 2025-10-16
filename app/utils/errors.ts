// Error class definitions

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
    public code?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Error helper functions

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}
