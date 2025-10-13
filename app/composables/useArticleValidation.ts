import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

/**
 * Zod validation schema for article form
 *
 * Validates:
 * - title: Required, non-empty string
 * - slug: Required, non-empty string
 * - content: Required, non-empty string
 * - publishSetting: Must be 'save-draft', 'publish-immediate', or 'publish-scheduled'
 * - scheduledDateTime: Required when publishSetting is 'publish-scheduled'
 */
export const articleFormSchema = toTypedSchema(
  z
    .object({
      title: z.string().trim().min(1, 'Title is required'),
      slug: z.string().trim().min(1, 'Slug is required'),
      content: z.string().trim().min(1, 'Content is required'),
      publishSetting: z.enum(['save-draft', 'publish-immediate', 'publish-scheduled']),
      scheduledDateTime: z.string().optional()
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
)
