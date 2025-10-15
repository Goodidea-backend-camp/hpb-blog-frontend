import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { isValidDateTime } from '~/utils/datetime'
import { VALID_YEAR_MIN, VALID_YEAR_MAX } from '@/constants/datetime'

/**
 * Zod validation schema for article form
 *
 * Validates:
 * - title: Required, non-empty string
 * - slug: Required, non-empty string
 * - content: Required, non-empty string
 * - publishSetting: Must be 'save-draft', 'publish-immediate', or 'publish-scheduled'
 * - scheduledDateTime: Required when publishSetting is 'publish-scheduled'
 *                      Must be a valid date with year between ${VALID_YEAR_MIN} and ${VALID_YEAR_MAX}
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
        } else if (!isValidDateTime(data.scheduledDateTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Please enter a valid date between ${VALID_YEAR_MIN} and ${VALID_YEAR_MAX}`,
            path: ['scheduledDateTime']
          })
        }
      }
    })
)
