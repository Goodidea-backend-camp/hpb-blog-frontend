import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { NewArticle, UpdateArticle } from '@/types/api'

// Form values type
export interface ArticleFormValues {
  title: string
  slug: string
  content: string
  publishMode: 'immediate' | 'schedule'
  scheduledDateTime?: string
}

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
export function buildNewArticlePayload(values: ArticleFormValues, isDraft: boolean): NewArticle {
  let publishedAt: string | null = null

  if (!isDraft) {
    if (values.publishMode === 'immediate') {
      publishedAt = new Date().toISOString()
    } else {
      publishedAt = new Date(values.scheduledDateTime!).toISOString()
    }
  }

  return {
    title: values.title,
    slug: values.slug,
    content: values.content,
    published_at: publishedAt
  }
}

// Build article payload for update
export function buildUpdateArticlePayload(
  values: Partial<ArticleFormValues>,
  isDraft: boolean
): UpdateArticle {
  const payload: UpdateArticle = {}

  if (values.title !== undefined) payload.title = values.title
  if (values.slug !== undefined) payload.slug = values.slug
  if (values.content !== undefined) payload.content = values.content

  if (!isDraft && values.publishMode) {
    if (values.publishMode === 'immediate') {
      payload.published_at = new Date().toISOString()
    } else if (values.scheduledDateTime) {
      payload.published_at = new Date(values.scheduledDateTime).toISOString()
    }
  } else if (isDraft) {
    payload.published_at = null
  }

  return payload
}
