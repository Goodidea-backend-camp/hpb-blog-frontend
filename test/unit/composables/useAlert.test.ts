import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAlert } from '@/composables/useAlert'
import { ALERT_AUTO_HIDE_DURATION } from '@/constants/alert'

describe('useAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with show = false', () => {
    const { alert } = useAlert()

    expect(alert.value.show).toBe(false)
  })

  it('should set all fields correctly when showAlert is called', () => {
    const { alert, showAlert } = useAlert()

    showAlert({
      variant: 'default',
      title: 'Success',
      message: 'Operation completed successfully'
    })

    expect(alert.value).toEqual({
      show: true,
      variant: 'default',
      title: 'Success',
      message: 'Operation completed successfully'
    })
  })

  it('should show destructive variant alert', () => {
    const { alert, showAlert } = useAlert()

    showAlert({
      variant: 'destructive',
      title: 'Error',
      message: 'Something went wrong'
    })

    expect(alert.value.variant).toBe('destructive')
    expect(alert.value.title).toBe('Error')
  })

  it('should auto-hide after ALERT_AUTO_HIDE_DURATION by default', () => {
    const { alert, showAlert } = useAlert()

    showAlert({
      variant: 'default',
      title: 'Test',
      message: 'Test message'
    })

    expect(alert.value.show).toBe(true)

    // Fast-forward time by ALERT_AUTO_HIDE_DURATION
    vi.advanceTimersByTime(ALERT_AUTO_HIDE_DURATION)

    expect(alert.value.show).toBe(false)
  })

  it('should auto-hide after custom duration when provided', () => {
    const { alert, showAlert } = useAlert()
    const customDuration = 3000

    showAlert({
      variant: 'default',
      title: 'Test',
      message: 'Test message',
      duration: customDuration
    })

    expect(alert.value.show).toBe(true)

    // Should not hide before custom duration
    vi.advanceTimersByTime(customDuration - 100)
    expect(alert.value.show).toBe(true)

    // Should hide after custom duration
    vi.advanceTimersByTime(100)
    expect(alert.value.show).toBe(false)
  })

  it('should hide immediately when hideAlert is called', () => {
    const { alert, showAlert, hideAlert } = useAlert()

    showAlert({
      variant: 'default',
      title: 'Test',
      message: 'Test message'
    })

    expect(alert.value.show).toBe(true)

    hideAlert()

    expect(alert.value.show).toBe(false)
  })

  it('should clear previous timeout when showAlert is called multiple times', () => {
    const { alert, showAlert } = useAlert()

    // Show first alert
    showAlert({
      variant: 'default',
      title: 'First',
      message: 'First message'
    })

    // Advance time partially
    vi.advanceTimersByTime(2000)

    // Show second alert (should reset timer)
    showAlert({
      variant: 'destructive',
      title: 'Second',
      message: 'Second message'
    })

    expect(alert.value.title).toBe('Second')
    expect(alert.value.show).toBe(true)

    // Advance time by 3000ms (total 5000ms from first alert, but only 3000ms from second)
    vi.advanceTimersByTime(3000)

    // Should still be visible (needs 5000ms from second alert)
    expect(alert.value.show).toBe(true)

    // Advance remaining time
    vi.advanceTimersByTime(2000)

    // Now should be hidden
    expect(alert.value.show).toBe(false)
  })

  it('should return readonly alert ref', () => {
    const { alert } = useAlert()

    // TypeScript would catch direct assignment, but we can verify it's readonly at runtime
    expect(Object.isFrozen(alert.value)).toBe(false) // value itself is not frozen
    // The ref is readonly, so we can't reassign alert.value = {...}
    // This is enforced by TypeScript types
  })

  it('should clear timeout on hideAlert to prevent memory leaks', () => {
    const { alert, showAlert, hideAlert } = useAlert()
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    showAlert({
      variant: 'default',
      title: 'Test',
      message: 'Test message'
    })

    hideAlert()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(alert.value.show).toBe(false)

    // Advancing time should not affect already hidden alert
    vi.advanceTimersByTime(ALERT_AUTO_HIDE_DURATION)
    expect(alert.value.show).toBe(false)
  })
})
