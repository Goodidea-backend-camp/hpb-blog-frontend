export interface AlertState {
  show: boolean
  variant: 'default' | 'destructive'
  title: string
  message: string
}

export interface ShowAlertOptions {
  variant: 'default' | 'destructive'
  title: string
  message: string
  duration?: number | null // number = auto-hide after ms, null = never auto-hide, undefined = use default
}
