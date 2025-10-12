export interface ArticleFormValues {
  title: string
  slug: string
  content: string
  publishSetting: ArticleAction
  scheduledDateTime?: string
}

export type ArticleAction = 'save-draft' | 'publish-immediate' | 'publish-scheduled'
