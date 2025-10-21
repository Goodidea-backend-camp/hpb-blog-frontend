import { htmlToMarkdown } from '@/utils/markdown'
import { convertLocalToUTC } from '@/utils/datetime'
import type { NewArticle } from '@/types/api'
import type { ArticleFormValues, ArticleAction } from '@/types/form'

export function buildNewArticlePayload(articleFormValues: ArticleFormValues): NewArticle {
  const markdownContent = htmlToMarkdown(articleFormValues.content)
  const publishedAt = getPublishedAt(
    articleFormValues.publishSetting,
    articleFormValues.scheduledDateTime
  )

  return {
    title: articleFormValues.title,
    slug: articleFormValues.slug,
    content: markdownContent,
    published_at: publishedAt
  }
}

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
      return convertLocalToUTC(scheduledDateTime)
  }
}
