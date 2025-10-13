import { ref, readonly } from 'vue'
import { ALERT_AUTO_HIDE_DURATION } from '@/constants/alert'
import type { AlertState, ShowAlertOptions } from '@/types/alert'

export function useAlert() {
  const alert = ref<AlertState>({
    show: false,
    variant: 'default',
    title: '',
    message: ''
  })

  let autoHideTimeout: ReturnType<typeof setTimeout> | null = null

  const showAlert = (options: ShowAlertOptions) => {
    // Clear existing auto-hide timeout to prevent memory leaks
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout)
      autoHideTimeout = null
    }

    alert.value = {
      show: true,
      variant: options.variant,
      title: options.title,
      message: options.message
    }

    // Auto-hide after specified duration
    // Infinity = never auto-hide (user must manually close)
    // finite number = auto-hide after N milliseconds
    // undefined = use default duration
    const duration = options.duration ?? ALERT_AUTO_HIDE_DURATION

    // Only set timeout if duration is finite (not Infinity)
    if (isFinite(duration)) {
      autoHideTimeout = setTimeout(() => {
        hideAlert()
      }, duration)
    }
  }

  //Hide the alert immediately
  const hideAlert = () => {
    alert.value.show = false
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout)
      autoHideTimeout = null
    }
  }

  return {
    alert: readonly(alert),
    showAlert,
    hideAlert
  }
}
