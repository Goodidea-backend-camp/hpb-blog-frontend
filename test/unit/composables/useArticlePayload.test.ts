import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildNewArticlePayload } from '@/composables/useArticlePayload'
import type { ArticleFormValues } from '@/types/form'

describe('useArticlePayload', () => {
  // Mock current time for consistent testing
  const mockDate = new Date('2024-01-15T10:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  describe('buildNewArticlePayload', () => {
    const baseFormValues: ArticleFormValues = {
      title: 'Test Article',
      slug: 'test-article',
      content: '<h1>Hello World</h1><p>This is <strong>bold</strong> text.</p>',
      publishMode: 'immediate',
      scheduledDateTime: undefined
    }

    describe('HTML to Markdown conversion', () => {
      it('should convert HTML content to Markdown format', () => {
        const result = buildNewArticlePayload(baseFormValues, 'save-draft')

        // Verify content is converted to Markdown
        expect(result.content).toContain('# Hello World')
        expect(result.content).toContain('**bold**')
        expect(result.content).not.toContain('<h1>')
        expect(result.content).not.toContain('<p>')
        expect(result.content).not.toContain('<strong>')
      })

      it('should handle complex HTML structures', () => {
        const complexFormValues: ArticleFormValues = {
          ...baseFormValues,
          content: `
            <h2>Section</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <p>Check out <a href="https://example.com">this link</a>.</p>
          `
        }

        const result = buildNewArticlePayload(complexFormValues, 'save-draft')

        expect(result.content).toContain('## Section')
        expect(result.content).toContain('- Item 1')
        expect(result.content).toContain('- Item 2')
        expect(result.content).toContain('[this link](https://example.com)')
      })
    })

    describe('draft mode', () => {
      it('should set published_at to null when saving as draft', () => {
        const result = buildNewArticlePayload(baseFormValues, 'save-draft')

        expect(result.published_at).toBeNull()
      })

      it('should include all required fields for draft', () => {
        const result = buildNewArticlePayload(baseFormValues, 'save-draft')

        expect(result.title).toBe('Test Article')
        expect(result.slug).toBe('test-article')
        expect(result.content).toBeTruthy()
        expect(result.published_at).toBeNull()
      })
    })

    describe('immediate publish mode', () => {
      it('should set published_at to current time when publishing immediately', () => {
        const result = buildNewArticlePayload(baseFormValues, 'publish-immediate')

        expect(result.published_at).toBe(mockDate.toISOString())
        expect(result.published_at).toBe('2024-01-15T10:00:00.000Z')
      })

      it('should include all required fields for immediate publish', () => {
        const result = buildNewArticlePayload(baseFormValues, 'publish-immediate')

        expect(result.title).toBe('Test Article')
        expect(result.slug).toBe('test-article')
        expect(result.content).toBeTruthy()
        expect(result.published_at).toBeTruthy()
      })
    })

    describe('scheduled publish mode', () => {
      it('should set published_at to scheduled time when publishing with schedule', () => {
        const scheduledTime = '2024-02-01T15:30:00.000Z'
        const scheduledFormValues: ArticleFormValues = {
          ...baseFormValues,
          publishMode: 'schedule',
          scheduledDateTime: scheduledTime
        }

        const result = buildNewArticlePayload(scheduledFormValues, 'publish-scheduled')

        expect(result.published_at).toBe(new Date(scheduledTime).toISOString())
        expect(result.published_at).toBe('2024-02-01T15:30:00.000Z')
      })

      it('should ignore scheduled time when saving as draft', () => {
        const scheduledFormValues: ArticleFormValues = {
          ...baseFormValues,
          publishMode: 'schedule',
          scheduledDateTime: '2024-02-01T15:30:00.000Z'
        }

        const result = buildNewArticlePayload(scheduledFormValues, 'save-draft')

        expect(result.published_at).toBeNull()
      })

      it('should throw error when scheduledDateTime is missing for publish-scheduled', () => {
        const scheduledFormValues: ArticleFormValues = {
          ...baseFormValues,
          publishMode: 'schedule',
          scheduledDateTime: undefined
        }

        expect(() => {
          buildNewArticlePayload(scheduledFormValues, 'publish-scheduled')
        }).toThrow('scheduledDateTime is required for publish-scheduled action')
      })
    })

    describe('edge cases', () => {
      it('should handle empty HTML content', () => {
        const emptyContentValues: ArticleFormValues = {
          ...baseFormValues,
          content: ''
        }

        const result = buildNewArticlePayload(emptyContentValues, 'save-draft')

        expect(result.content).toBe('')
      })

      it('should handle plain text content (no HTML tags)', () => {
        const plainTextValues: ArticleFormValues = {
          ...baseFormValues,
          content: 'Plain text content'
        }

        const result = buildNewArticlePayload(plainTextValues, 'save-draft')

        expect(result.content).toBe('Plain text content')
      })
    })
  })
})
