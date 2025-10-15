import { isValid, parseISO } from 'date-fns'
import { VALID_YEAR_MIN, VALID_YEAR_MAX } from '@/constants/datetime'

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function convertLocalToUTC(localDateTimeString: string): string {
  if (!isValidDateTime(localDateTimeString)) {
    throw new Error(`Invalid datetime string: ${localDateTimeString}`)
  }
  const date = parseISO(localDateTimeString)
  return date.toISOString()
}

export function isValidDateTime(dateTimeString: string): boolean {
  const date = parseISO(dateTimeString)

  if (!isValid(date)) {
    return false
  }

  const year = date.getFullYear()
  return year >= VALID_YEAR_MIN && year <= VALID_YEAR_MAX
}
