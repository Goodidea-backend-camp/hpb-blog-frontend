import { describe, it, expect } from 'vitest'
import { isApiError, getErrorMessage, ApiError } from '@/utils/errors'

describe('error utilities', () => {
  describe('isApiError', () => {
    it('should return true for ApiError instances', () => {
      const apiError = new ApiError('Test error', 400)
      expect(isApiError(apiError)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Test error')
      expect(isApiError(error)).toBe(false)
    })

    it('should return false for non-error objects', () => {
      expect(isApiError({})).toBe(false)
      expect(isApiError(null)).toBe(false)
      expect(isApiError(undefined)).toBe(false)
      expect(isApiError('error string')).toBe(false)
      expect(isApiError(123)).toBe(false)
    })
  })

  describe('getErrorMessage', () => {
    it('should extract message from ApiError', () => {
      const apiError = new ApiError('API error message', 400)
      expect(getErrorMessage(apiError)).toBe('API error message')
    })

    it('should extract message from regular Error', () => {
      const error = new Error('Regular error message')
      expect(getErrorMessage(error)).toBe('Regular error message')
    })

    it('should return string directly if error is a string', () => {
      expect(getErrorMessage('String error')).toBe('String error')
    })

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
      expect(getErrorMessage({})).toBe('An unexpected error occurred')
      expect(getErrorMessage(123)).toBe('An unexpected error occurred')
    })

    it('should handle ApiError with all properties', () => {
      const apiError = new ApiError('Detailed error', 404, { detail: 'Not found' }, 1001)
      expect(getErrorMessage(apiError)).toBe('Detailed error')
    })
  })
})
