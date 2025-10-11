import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

/**
 * Zod validation schema for article form
 *
 * Validates:
 * - title: Required, non-empty string
 * - slug: Required, non-empty string
 * - content: Required, non-empty string
 * - publishMode: Must be 'immediate' or 'schedule'
 * - scheduledDateTime: Required when publishMode is 'schedule'
 */
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
