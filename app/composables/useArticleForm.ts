import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { NewArticle, UpdateArticle } from '@/types/api'
import type { ArticleFormValues } from '@/types/form'

// Zod validation schema
export const articleFormSchema = toTypedSchema(
  z
    .object({
      title: z.string().min(1, 'Title is required').trim(),
      slug: z.string().min(1, 'Slug is required').trim(),
      content: z.string().min(1, 'Content is required').trim(),
      publishMode: z.enum(['immediate', 'schedule']),
      scheduledDateTime: z.string().optional()
    })
    .refine(
      (data) => {
        if (data.publishMode === 'schedule') {
          return !!data.scheduledDateTime && data.scheduledDateTime.length > 0
        }
        return true
      },
      {
        message: 'Scheduled date and time is required',
        path: ['scheduledDateTime']
      }
    )
)

// Build article payload for create
export function buildNewArticlePayload(
  articleFormValues: ArticleFormValues,
  isDraft: boolean
): NewArticle {
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
    content: articleFormValues.content,
    published_at: publishedAt
  }
}

// Build article payload for update
export function buildUpdateArticlePayload(
  articleFormValues: Partial<ArticleFormValues>,
  isDraft: boolean
): UpdateArticle {
  const payload: UpdateArticle = {}

  if (articleFormValues.title !== undefined) payload.title = articleFormValues.title
  if (articleFormValues.slug !== undefined) payload.slug = articleFormValues.slug
  if (articleFormValues.content !== undefined) payload.content = articleFormValues.content

  if (!isDraft && articleFormValues.publishMode) {
    if (articleFormValues.publishMode === 'immediate') {
      payload.published_at = new Date().toISOString()
    } else if (articleFormValues.scheduledDateTime) {
      payload.published_at = new Date(articleFormValues.scheduledDateTime).toISOString()
    }
  } else if (isDraft) {
    payload.published_at = null
  }

  return payload
}
