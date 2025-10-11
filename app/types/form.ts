export interface ArticleFormValues {
  title: string
  slug: string
  content: string
  publishMode: 'immediate' | 'schedule'
  scheduledDateTime?: string
}
