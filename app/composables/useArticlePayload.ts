import { htmlToMarkdown } from '@/utils/markdown'
import type { NewArticle } from '@/types/api'
import type { ArticleFormValues } from '@/types/form'

/**
 * Build article payload for creating a new article
 *
 * Converts HTML content to Markdown before sending to backend.
 * Handles both draft and publish scenarios with appropriate published_at value.
 *
 * @param articleFormValues - Form values from the article form
 * @param isDraft - Whether this is a draft (true) or publish (false)
 * @returns NewArticle payload ready for API submission
 */
export function buildNewArticlePayload(
  articleFormValues: ArticleFormValues,
  isDraft: boolean
): NewArticle {
  const markdownContent = htmlToMarkdown(articleFormValues.content)

  // Determine published_at value based on draft status and publish mode
  let publishedAt: string | null = null

  if (!isDraft) {
    if (articleFormValues.publishMode === 'immediate') {
      publishedAt = new Date().toISOString()
    } else {
      publishedAt = new Date(articleFormValues.scheduledDateTime!).toISOString()
    }
  }

  return {
    title: articleFormValues.title,
    slug: articleFormValues.slug,
    content: markdownContent,
    published_at: publishedAt
  }
}
