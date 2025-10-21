import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { isValidPublishDateTime } from '~/utils/datetime'

/**
 * Zod validation schema for article form
 *
 * Validates:
 * - title: Required, non-empty string
 * - slug: Required, non-empty string
 * - content: Required, non-empty string
 * - publishSetting: Must be 'save-draft', 'publish-immediate', or 'publish-scheduled'
 * - scheduledDateTime: Required when publishSetting is 'publish-scheduled'
 *                      Must be future date and time and less than ${VALID_YEAR_MAX}
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
    .superRefine((data, ctx) => {
      if (data.publishSetting === 'publish-scheduled') {
        if (!data.scheduledDateTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Scheduled date and time is required',
            path: ['scheduledDateTime']
          })
        } else if (!isValidPublishDateTime(data.scheduledDateTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Scheduled publish time must be in the future',
            path: ['scheduledDateTime']
          })
        }
      }
    })
)
