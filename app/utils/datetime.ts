import { isValid, parseISO } from 'date-fns'
import { VALID_YEAR_MAX } from '@/constants/datetime'

export function convertLocalToUTC(localDateTimeString: string): string {
  const date = parseISO(localDateTimeString)
  if (!isValid(date)) {
    throw new Error(`Invalid datetime string: ${localDateTimeString}`)
  }
  return date.toISOString()
}

export function isValidPublishDateTime(dateTimeString: string): boolean {
  const date = parseISO(dateTimeString)

  if (!isValid(date)) {
    return false
  }

  const now = new Date()
  const year = date.getFullYear()

  return date.getTime() > now.getTime() && year <= VALID_YEAR_MAX
}
