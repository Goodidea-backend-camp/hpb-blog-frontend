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
  duration?: number // Infinity = never auto-hide, finite number = auto-hide after ms, undefined = use default
}
