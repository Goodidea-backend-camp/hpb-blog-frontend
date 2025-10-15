import { describe, it, expect } from 'vitest'
import { getUserTimezone, convertLocalToUTC, isValidDateTime } from '@/utils/datetime'

describe('datetime utilities', () => {
  describe('getUserTimezone', () => {
    it('should return a valid IANA timezone identifier', () => {
      const timezone = getUserTimezone()

      // Should be a non-empty string
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')

      // Common format: Continent/City or UTC
      // Examples: 'Asia/Taipei', 'America/New_York', 'Europe/London', 'UTC'
      expect(timezone.length).toBeGreaterThan(0)
    })

    it('should return consistent timezone across multiple calls', () => {
      const tz1 = getUserTimezone()
      const tz2 = getUserTimezone()

      expect(tz1).toBe(tz2)
    })
  })

  describe('convertLocalToUTC', () => {
    // Mock system timezone for consistent testing
    // We'll test with different timezones by mocking Date behavior

    describe('basic conversion', () => {
      it('should convert local datetime string to UTC ISO format', () => {
        const localDateTime = '2024-01-15T10:30:00'
        const result = convertLocalToUTC(localDateTime)

        // Result should be a valid UTC ISO string
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

        // Should be parseable as a Date
        const parsedDate = new Date(result)
        expect(parsedDate.toISOString()).toBe(result)
      })

      it('should handle datetime string without seconds', () => {
        const localDateTime = '2024-01-15T10:30'
        const result = convertLocalToUTC(localDateTime)

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })

      it('should preserve the date and time values when converting', () => {
        const localDateTime = '2024-01-15T10:30:45'
        const result = convertLocalToUTC(localDateTime)

        const originalDate = new Date(localDateTime)
        const resultDate = new Date(result)

        // Both should represent the same moment in time
        expect(originalDate.getTime()).toBe(resultDate.getTime())
      })
    })

    describe('timezone offset handling', () => {
      it('should handle midnight edge case', () => {
        const midnight = '2024-01-15T00:00:00'
        const result = convertLocalToUTC(midnight)

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

        const date = new Date(result)
        expect(date.getTime()).toBe(new Date(midnight).getTime())
      })

      it('should handle end of day edge case', () => {
        const endOfDay = '2024-01-15T23:59:59'
        const result = convertLocalToUTC(endOfDay)

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

        const date = new Date(result)
        expect(date.getTime()).toBe(new Date(endOfDay).getTime())
      })
    })

    describe('edge cases and boundaries', () => {
      it('should handle year boundaries (New Year)', () => {
        const newYear = '2024-01-01T00:00:00'
        const result = convertLocalToUTC(newYear)

        const resultDate = new Date(result)
        expect(resultDate.getTime()).toBe(new Date(newYear).getTime())
      })

      it('should handle leap year date (Feb 29)', () => {
        const leapDay = '2024-02-29T12:00:00'
        const result = convertLocalToUTC(leapDay)

        const resultDate = new Date(result)
        expect(resultDate.getMonth()).toBe(1) // February (0-indexed)
        expect(resultDate.getDate()).toBe(29)
      })

      it('should handle end of year', () => {
        const endOfYear = '2024-12-31T23:59:59'
        const result = convertLocalToUTC(endOfYear)

        const resultDate = new Date(result)
        expect(resultDate.getTime()).toBe(new Date(endOfYear).getTime())
      })

      it('should handle minimum valid year (1970)', () => {
        const minYear = '1970-01-01T00:00:00'
        const result = convertLocalToUTC(minYear)

        const resultDate = new Date(result)
        expect(resultDate.getFullYear()).toBe(1970)
      })

      it('should handle maximum valid year (2100)', () => {
        const maxYear = '2100-12-31T23:59:59'
        const result = convertLocalToUTC(maxYear)

        const resultDate = new Date(result)
        expect(resultDate.getFullYear()).toBe(2100)
      })
    })

    describe('invalid input handling', () => {
      it('should throw error for invalid datetime string', () => {
        expect(() => convertLocalToUTC('invalid-date')).toThrow('Invalid datetime string')
      })

      it('should throw error for empty string', () => {
        expect(() => convertLocalToUTC('')).toThrow('Invalid datetime string')
      })

      it('should throw error for malformed datetime', () => {
        expect(() => convertLocalToUTC('2024-13-45T99:99:99')).toThrow('Invalid datetime string')
      })

      it('should throw error for non-existent date', () => {
        // February 30 doesn't exist
        expect(() => convertLocalToUTC('2024-02-30T12:00:00')).toThrow('Invalid datetime string')
      })
    })

    describe('different datetime formats', () => {
      it('should handle ISO format with milliseconds', () => {
        const withMs = '2024-01-15T10:30:45.123'
        const result = convertLocalToUTC(withMs)

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })

      it('should handle compact format (YYYY-MM-DDTHH:mm)', () => {
        const compact = '2024-01-15T10:30'
        const result = convertLocalToUTC(compact)

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })
    })
  })

  describe('isValidDateTime', () => {
    describe('valid dates', () => {
      it('should return true for valid datetime in range', () => {
        expect(isValidDateTime('2024-01-15T10:30:00')).toBe(true)
      })

      it('should return true for datetime at minimum boundary (1970)', () => {
        expect(isValidDateTime('1970-01-01T00:00:00')).toBe(true)
      })

      it('should return true for datetime at maximum boundary (2100)', () => {
        expect(isValidDateTime('2100-12-31T23:59:59')).toBe(true)
      })

      it('should return true for datetime in middle of range', () => {
        expect(isValidDateTime('2050-06-15T12:00:00')).toBe(true)
      })

      it('should return true for current year', () => {
        const now = new Date()
        const currentYear = now.getFullYear()
        expect(isValidDateTime(`${currentYear}-01-15T10:30:00`)).toBe(true)
      })
    })

    describe('invalid dates - out of range', () => {
      it('should return false for year before 1970', () => {
        expect(isValidDateTime('1969-12-31T23:59:59')).toBe(false)
      })

      it('should return false for year after 2100', () => {
        expect(isValidDateTime('2101-01-01T00:00:00')).toBe(false)
      })

      it('should return false for very old date', () => {
        expect(isValidDateTime('1900-01-01T00:00:00')).toBe(false)
      })

      it('should return false for very future date', () => {
        expect(isValidDateTime('2200-01-01T00:00:00')).toBe(false)
      })
    })

    describe('invalid dates - malformed', () => {
      it('should return false for invalid datetime string', () => {
        expect(isValidDateTime('invalid-date')).toBe(false)
      })

      it('should return false for empty string', () => {
        expect(isValidDateTime('')).toBe(false)
      })

      it('should return false for malformed datetime', () => {
        expect(isValidDateTime('2024-13-45T99:99:99')).toBe(false)
      })

      it('should return false for non-existent date', () => {
        expect(isValidDateTime('2024-02-30T12:00:00')).toBe(false)
      })

      it('should return false for invalid month', () => {
        expect(isValidDateTime('2024-13-01T12:00:00')).toBe(false)
      })

      it('should return false for invalid day', () => {
        expect(isValidDateTime('2024-01-32T12:00:00')).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle leap year correctly', () => {
        expect(isValidDateTime('2024-02-29T12:00:00')).toBe(true) // 2024 is leap year
        expect(isValidDateTime('2023-02-29T12:00:00')).toBe(false) // 2023 is not
      })

      it('should handle different datetime formats', () => {
        expect(isValidDateTime('2024-01-15T10:30')).toBe(true)
        expect(isValidDateTime('2024-01-15T10:30:45')).toBe(true)
        expect(isValidDateTime('2024-01-15T10:30:45.123')).toBe(true)
      })

      it('should handle boundary seconds', () => {
        expect(isValidDateTime('2024-01-15T10:30:00')).toBe(true)
        expect(isValidDateTime('2024-01-15T10:30:59')).toBe(true)
      })
    })
  })
})
