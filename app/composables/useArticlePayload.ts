import { htmlToMarkdown } from '@/utils/markdown'
import type { NewArticle } from '@/types/api'
import type { ArticleFormValues, ArticleAction } from '@/types/form'

/**
 * Build article payload for creating a new article
 *
 * Converts HTML content to Markdown before sending to backend.
 * Handles draft, immediate publish, and scheduled publish scenarios.
 *
 * @param articleFormValues - Form values from the article form
 * @param action - Action type: 'save-draft', 'publish-immediate', or 'publish-scheduled'
 * @returns NewArticle payload ready for API submission
 */
export function buildNewArticlePayload(
  articleFormValues: ArticleFormValues,
  action: ArticleAction
): NewArticle {
  const markdownContent = htmlToMarkdown(articleFormValues.content)
  const publishedAt = getPublishedAt(action, articleFormValues.scheduledDateTime)

  return {
    title: articleFormValues.title,
    slug: articleFormValues.slug,
    content: markdownContent,
    published_at: publishedAt
  }
}

/**
 * Determine published_at timestamp based on action type
 *
 * @param action - The action type
 * @param scheduledDateTime - The scheduled date/time (required for 'publish-scheduled')
 * @returns ISO string timestamp or null for drafts
 */
function getPublishedAt(action: ArticleAction, scheduledDateTime?: string): string | null {
  switch (action) {
    case 'save-draft':
      return null
    case 'publish-immediate':
      return new Date().toISOString()
    case 'publish-scheduled':
      if (!scheduledDateTime) {
        throw new Error('scheduledDateTime is required for publish-scheduled action')
      }
      return new Date(scheduledDateTime).toISOString()
  }
}
