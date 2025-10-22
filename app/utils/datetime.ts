import { format, isValid, parseISO } from 'date-fns'
import { VALID_YEAR_MAX } from '@/constants/datetime'

export function convertLocalToUtc(localDateTimeString: string): string {
  const date = parseISO(localDateTimeString)
  if (!isValid(date)) {
    throw new Error(`Invalid datetime string: ${localDateTimeString}`)
  }
  return date.toISOString()
}

export function convertUtcToLocal(utcDateTimeString: string): string {
  const date = parseISO(utcDateTimeString)
  if (!isValid(date)) {
    throw new Error(`Invalid datetime string: ${utcDateTimeString}`)
  }
  return format(date, 'yyyy-MM-dd HH:mm')
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
