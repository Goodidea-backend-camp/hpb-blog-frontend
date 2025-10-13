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
  duration?: number
}
