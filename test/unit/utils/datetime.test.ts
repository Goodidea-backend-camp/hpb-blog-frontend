import { describe, it, expect } from 'vitest'
import { convertLocalToUTC, isValidPublishDateTime } from '@/utils/datetime'

describe('datetime utilities', () => {
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
        const futureNewYear = new Date()
        futureNewYear.setFullYear(futureNewYear.getFullYear() + 1)
        futureNewYear.setMonth(0, 1)
        futureNewYear.setHours(0, 0, 0, 0)

        const newYear = futureNewYear.toISOString().slice(0, 19)
        const result = convertLocalToUTC(newYear)

        const resultDate = new Date(result)
        expect(resultDate.getTime()).toBe(new Date(newYear).getTime())
      })

      it('should handle leap year date (Feb 29)', () => {
        // Use 2028 which is a future leap year
        const leapDay = '2028-02-29T12:00:00'
        const result = convertLocalToUTC(leapDay)

        const resultDate = new Date(result)
        expect(resultDate.getMonth()).toBe(1) // February (0-indexed)
        expect(resultDate.getDate()).toBe(29)
      })

      it('should handle end of year', () => {
        const futureYear = new Date()
        futureYear.setFullYear(futureYear.getFullYear() + 1)
        futureYear.setMonth(11, 31)
        futureYear.setHours(23, 59, 59, 0)

        const endOfYear = futureYear.toISOString().slice(0, 19)
        const result = convertLocalToUTC(endOfYear)

        const resultDate = new Date(result)
        expect(resultDate.getTime()).toBe(new Date(endOfYear).getTime())
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

  describe('isValidPublishDateTime', () => {
    // Helper function to format date as local ISO string (YYYY-MM-DDTHH:mm:ss)
    const toLocalISOString = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }

    describe('valid future dates', () => {
      it('should return true for datetime 1 second in the future', () => {
        const future = new Date()
        future.setSeconds(future.getSeconds() + 1)
        const futureStr = toLocalISOString(future)
        expect(isValidPublishDateTime(futureStr)).toBe(true)
      })

      it('should return true for datetime 1 minute in the future', () => {
        const future = new Date()
        future.setMinutes(future.getMinutes() + 1)
        const futureStr = toLocalISOString(future)
        expect(isValidPublishDateTime(futureStr)).toBe(true)
      })

      it('should return true for datetime 1 day in the future', () => {
        const future = new Date()
        future.setDate(future.getDate() + 1)
        const futureStr = toLocalISOString(future)
        expect(isValidPublishDateTime(futureStr)).toBe(true)
      })

      it('should return true for datetime 1 year in the future', () => {
        const future = new Date()
        future.setFullYear(future.getFullYear() + 1)
        const futureStr = toLocalISOString(future)
        expect(isValidPublishDateTime(futureStr)).toBe(true)
      })

      it('should return true for datetime near 2100', () => {
        expect(isValidPublishDateTime('2099-12-31T23:59:59')).toBe(true)
      })

      it('should return true for datetime at 2100 boundary', () => {
        expect(isValidPublishDateTime('2100-12-31T23:59:59')).toBe(true)
      })
    })

    describe('invalid dates - past or present', () => {
      it('should return false for datetime 1 second in the past', () => {
        const past = new Date()
        past.setSeconds(past.getSeconds() - 1)
        const pastStr = toLocalISOString(past)
        expect(isValidPublishDateTime(pastStr)).toBe(false)
      })

      it('should return false for datetime 1 day in the past', () => {
        const past = new Date()
        past.setDate(past.getDate() - 1)
        const pastStr = toLocalISOString(past)
        expect(isValidPublishDateTime(pastStr)).toBe(false)
      })

      it('should return false for datetime 1 year in the past', () => {
        const past = new Date()
        past.setFullYear(past.getFullYear() - 1)
        const pastStr = toLocalISOString(past)
        expect(isValidPublishDateTime(pastStr)).toBe(false)
      })

      it('should return false for current time (must be strictly in future)', () => {
        // This test might be flaky due to execution time, but demonstrates the intent
        const now = new Date()
        const nowStr = toLocalISOString(now)
        // Add a small delay to ensure 'now' is actually in the past when checked
        const result = isValidPublishDateTime(nowStr)
        expect(result).toBe(false)
      })

      it('should return false for very old date', () => {
        expect(isValidPublishDateTime('1900-01-01T00:00:00')).toBe(false)
      })

      it('should return false for year 1970', () => {
        expect(isValidPublishDateTime('1970-01-01T00:00:00')).toBe(false)
      })

      it('should return false for year 2020', () => {
        expect(isValidPublishDateTime('2020-06-15T12:00:00')).toBe(false)
      })
    })

    describe('invalid dates - beyond max year', () => {
      it('should return false for year after 2100', () => {
        expect(isValidPublishDateTime('2101-01-01T00:00:00')).toBe(false)
      })

      it('should return false for very future date', () => {
        expect(isValidPublishDateTime('2200-01-01T00:00:00')).toBe(false)
      })

      it('should return false for year 3000', () => {
        expect(isValidPublishDateTime('3000-01-01T00:00:00')).toBe(false)
      })
    })

    describe('invalid dates - malformed', () => {
      it('should return false for invalid datetime string', () => {
        expect(isValidPublishDateTime('invalid-date')).toBe(false)
      })

      it('should return false for empty string', () => {
        expect(isValidPublishDateTime('')).toBe(false)
      })

      it('should return false for malformed datetime', () => {
        expect(isValidPublishDateTime('2024-13-45T99:99:99')).toBe(false)
      })

      it('should return false for non-existent date', () => {
        expect(isValidPublishDateTime('2024-02-30T12:00:00')).toBe(false)
      })

      it('should return false for invalid month', () => {
        expect(isValidPublishDateTime('2050-13-01T12:00:00')).toBe(false)
      })

      it('should return false for invalid day', () => {
        expect(isValidPublishDateTime('2050-01-32T12:00:00')).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle future leap year correctly', () => {
        expect(isValidPublishDateTime('2028-02-29T12:00:00')).toBe(true) // 2028 is leap year
      })

      it('should return false for past leap year', () => {
        expect(isValidPublishDateTime('2024-02-29T12:00:00')).toBe(false) // 2024 is past
      })

      it('should return false for non-leap year Feb 29', () => {
        expect(isValidPublishDateTime('2027-02-29T12:00:00')).toBe(false) // 2027 is not leap year
      })

      it('should handle different datetime formats for future dates', () => {
        const future = new Date()
        future.setDate(future.getDate() + 10)

        const fullStr = toLocalISOString(future)
        const compact = fullStr.slice(0, 16) // YYYY-MM-DDTHH:mm
        const withSeconds = fullStr.slice(0, 19) // YYYY-MM-DDTHH:mm:ss
        const withMs = fullStr + '.123' // YYYY-MM-DDTHH:mm:ss.SSS

        expect(isValidPublishDateTime(compact)).toBe(true)
        expect(isValidPublishDateTime(withSeconds)).toBe(true)
        expect(isValidPublishDateTime(withMs)).toBe(true)
      })

      it('should handle timezone-less ISO format', () => {
        const future = new Date()
        future.setHours(future.getHours() + 1)
        const futureStr = toLocalISOString(future)
        expect(isValidPublishDateTime(futureStr)).toBe(true)
      })
    })
  })
})
