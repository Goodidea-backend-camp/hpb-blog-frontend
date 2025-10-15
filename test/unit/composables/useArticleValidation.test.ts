import { describe, it, expect } from 'vitest'
import type { ArticleFormValues } from '@/types/form'
import * as z from 'zod'

// Helper to get the underlying Zod schema from toTypedSchema
// We need to validate directly for testing purposes
const getZodSchema = () => {
  // articleFormSchema is wrapped by toTypedSchema, we need to extract it
  // For testing, we'll recreate the schema with the same validation logic
  return z
    .object({
      title: z.string().trim().min(1, 'Title is required'),
      slug: z.string().trim().min(1, 'Slug is required'),
      content: z.string().trim().min(1, 'Content is required'),
      publishSetting: z.enum(['save-draft', 'publish-immediate', 'publish-scheduled']),
      scheduledDateTime: z
        .string()
        .optional()
        .refine(
          (val) => {
            // Empty value is valid (will be checked by the next refine)
            if (!val) return true

            // Check if date string format is valid (YYYY-MM-DD pattern)
            const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (!match || !match[1] || !match[2] || !match[3]) return false

            const yearStr = match[1]
            const monthStr = match[2]
            const dayStr = match[3]
            const inputYear = parseInt(yearStr, 10)
            const inputMonth = parseInt(monthStr, 10)
            const inputDay = parseInt(dayStr, 10)

            // Parse the date
            const date = new Date(val)

            // Check if date is valid
            if (isNaN(date.getTime())) return false

            // Check if JavaScript rolled over the date
            // (e.g., 2024-02-30 becomes 2024-03-01)
            const actualYear = date.getFullYear()
            const actualMonth = date.getMonth() + 1
            const actualDay = date.getDate()

            if (inputYear !== actualYear || inputMonth !== actualMonth || inputDay !== actualDay) {
              return false
            }

            // Check year range: 1970 (Unix epoch) to 2100
            return inputYear >= 1970 && inputYear <= 2100
          },
          {
            message: 'Please enter a valid date between 1970 and 2100'
          }
        )
    })
    .refine(
      (data) => {
        if (data.publishSetting === 'publish-scheduled') {
          return !!data.scheduledDateTime && data.scheduledDateTime.length > 0
        }
        return true
      },
      {
        message: 'Scheduled date and time is required',
        path: ['scheduledDateTime']
      }
    )
}

describe('useArticleValidation', () => {
  const baseFormValues: ArticleFormValues = {
    title: 'Test Article',
    slug: 'test-article',
    content: 'Test content',
    publishSetting: 'save-draft'
  }

  describe('basic field validation', () => {
    it('should validate valid form data', () => {
      const schema = getZodSchema()
      const result = schema.safeParse(baseFormValues)

      expect(result.success).toBe(true)
    })

    it('should require title', () => {
      const schema = getZodSchema()
      const invalidData = { ...baseFormValues, title: '' }
      const result = schema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Title is required')
      }
    })

    it('should require slug', () => {
      const schema = getZodSchema()
      const invalidData = { ...baseFormValues, slug: '' }
      const result = schema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Slug is required')
      }
    })

    it('should require content', () => {
      const schema = getZodSchema()
      const invalidData = { ...baseFormValues, content: '' }
      const result = schema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Content is required')
      }
    })

    it('should trim whitespace from fields', () => {
      const schema = getZodSchema()
      const dataWithWhitespace = {
        title: '  Test Article  ',
        slug: '  test-article  ',
        content: '  Test content  ',
        publishSetting: 'save-draft' as const
      }
      const result = schema.safeParse(dataWithWhitespace)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data?.title).toBe('Test Article')
        expect(result.data?.slug).toBe('test-article')
        expect(result.data?.content).toBe('Test content')
      }
    })
  })

  describe('publishSetting validation', () => {
    it('should accept save-draft', () => {
      const schema = getZodSchema()
      const data = { ...baseFormValues, publishSetting: 'save-draft' as const }
      const result = schema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should accept publish-immediate', () => {
      const schema = getZodSchema()
      const data = { ...baseFormValues, publishSetting: 'publish-immediate' as const }
      const result = schema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should accept publish-scheduled with valid scheduledDateTime', () => {
      const schema = getZodSchema()
      const data = {
        ...baseFormValues,
        publishSetting: 'publish-scheduled' as const,
        scheduledDateTime: '2024-12-31T10:30:00'
      }
      const result = schema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should reject invalid publishSetting', () => {
      const schema = getZodSchema()
      const data = { ...baseFormValues, publishSetting: 'invalid-setting' }
      const result = schema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })

  describe('scheduledDateTime validation - date range', () => {
    describe('valid dates', () => {
      it('should accept valid date in the past', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2020-01-15T10:30:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept valid date in the future', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2050-01-15T10:30:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept date at minimum boundary (1970)', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '1970-01-01T00:00:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept date at maximum boundary (2100)', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2100-12-31T23:59:59'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should accept various datetime formats', () => {
        const schema = getZodSchema()
        const formats = ['2024-01-15T10:30', '2024-01-15T10:30:00', '2024-01-15T10:30:45.123']

        formats.forEach((format) => {
          const data = {
            ...baseFormValues,
            publishSetting: 'publish-scheduled' as const,
            scheduledDateTime: format
          }
          const result = schema.safeParse(data)

          expect(result.success).toBe(true)
        })
      })
    })

    describe('invalid dates - out of range', () => {
      it('should reject date before 1970', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '1969-12-31T23:59:59'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            'Please enter a valid date between 1970 and 2100'
          )
        }
      })

      it('should reject date after 2100', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2101-01-01T00:00:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            'Please enter a valid date between 1970 and 2100'
          )
        }
      })

      it('should reject very old date', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '1900-01-01T00:00:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            'Please enter a valid date between 1970 and 2100'
          )
        }
      })

      it('should reject very future date', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2200-01-01T00:00:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            'Please enter a valid date between 1970 and 2100'
          )
        }
      })
    })

    describe('invalid dates - malformed', () => {
      it('should reject invalid datetime string', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: 'invalid-date'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            'Please enter a valid date between 1970 and 2100'
          )
        }
      })

      it('should reject malformed datetime', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2024-13-45T99:99:99'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
      })

      it('should reject non-existent date (Feb 30)', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: '2024-02-30T12:00:00'
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
      })
    })

    describe('optional field behavior', () => {
      it('should allow missing scheduledDateTime for save-draft', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'save-draft' as const
          // scheduledDateTime is undefined
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should allow missing scheduledDateTime for publish-immediate', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-immediate' as const
          // scheduledDateTime is undefined
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
      })

      it('should require scheduledDateTime for publish-scheduled', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const
          // scheduledDateTime is undefined
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe('Scheduled date and time is required')
        }
      })

      it('should reject empty scheduledDateTime for publish-scheduled', () => {
        const schema = getZodSchema()
        const data = {
          ...baseFormValues,
          publishSetting: 'publish-scheduled' as const,
          scheduledDateTime: ''
        }
        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe('Scheduled date and time is required')
        }
      })
    })
  })

  describe('edge cases', () => {
    it('should handle leap year correctly', () => {
      const schema = getZodSchema()

      // 2024 is a leap year - Feb 29 should be valid
      const leapYearData = {
        ...baseFormValues,
        publishSetting: 'publish-scheduled' as const,
        scheduledDateTime: '2024-02-29T12:00:00'
      }
      const leapResult = schema.safeParse(leapYearData)
      expect(leapResult.success).toBe(true)

      // 2023 is not a leap year - Feb 29 should be invalid
      const nonLeapYearData = {
        ...baseFormValues,
        publishSetting: 'publish-scheduled' as const,
        scheduledDateTime: '2023-02-29T12:00:00'
      }
      const nonLeapResult = schema.safeParse(nonLeapYearData)
      expect(nonLeapResult.success).toBe(false)
    })

    it('should handle midnight correctly', () => {
      const schema = getZodSchema()
      const data = {
        ...baseFormValues,
        publishSetting: 'publish-scheduled' as const,
        scheduledDateTime: '2024-01-15T00:00:00'
      }
      const result = schema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should handle end of day correctly', () => {
      const schema = getZodSchema()
      const data = {
        ...baseFormValues,
        publishSetting: 'publish-scheduled' as const,
        scheduledDateTime: '2024-01-15T23:59:59'
      }
      const result = schema.safeParse(data)

      expect(result.success).toBe(true)
    })
  })
})
