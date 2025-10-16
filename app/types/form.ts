export interface ArticleFormValues {
  title: string
  slug: string
  content: string
  publishSetting: ArticleAction
  scheduledDateTime?: string
}

export const ARTICLE_ACTIONS = ['publish-immediate', 'publish-scheduled', 'save-draft'] as const
export type ArticleAction = (typeof ARTICLE_ACTIONS)[number]
