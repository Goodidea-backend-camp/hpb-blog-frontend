import { ref, readonly, onUnmounted, getCurrentInstance } from 'vue'
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

  // Only register lifecycle hook if called within a component context
  if (getCurrentInstance()) {
    onUnmounted(() => {
      cleanupTimeout()
    })
  }

  const cleanupTimeout = () => {
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout)
      autoHideTimeout = null
    }
  }

  const showAlert = (options: ShowAlertOptions) => {
    // Clear existing auto-hide timeout to prevent memory leaks
    cleanupTimeout()

    alert.value = {
      show: true,
      variant: options.variant,
      title: options.title,
      message: options.message
    }

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
    cleanupTimeout()
  }

  return {
    alert: readonly(alert),
    showAlert,
    hideAlert
  }
}
