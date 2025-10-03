import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useJwtToken, TOKEN_KEY } from '@/composables/useJwtToken'

// Mock useCookie
vi.mock('#app', () => ({
  useCookie: vi.fn()
}))

describe('TOKEN_KEY', () => {
  it('should have the correct value', () => {
    expect(TOKEN_KEY).toBe('jwt-token')
  })
})

describe('useJwtToken', () => {
  let mockCookieRef: ReturnType<typeof ref<string | null>>

  beforeEach(async () => {
    // Create a real Vue ref so computed can track it
    mockCookieRef = ref<string | null>(null)

    // Mock useCookie to return our mock ref
    const { useCookie } = await import('#app')
    vi.mocked(useCookie).mockReturnValue(mockCookieRef as unknown as ReturnType<typeof useCookie>)
  })

  it('should initialize with null token', () => {
    const { get } = useJwtToken()

    expect(get()).toBe(null)
  })

  it('should set token correctly', () => {
    const { set, get } = useJwtToken()

    set('test-token')

    expect(mockCookieRef.value).toBe('test-token')
    expect(get()).toBe('test-token')
  })

  it('should remove token correctly', () => {
    // Set token first
    mockCookieRef.value = 'test-token'

    const { remove, get } = useJwtToken()

    remove()

    expect(mockCookieRef.value).toBe(null)
    expect(get()).toBe(null)
  })

  it('should expose reactive token ref', () => {
    const { token } = useJwtToken()

    expect(token.value).toBe(null)

    // Directly modify the mock cookie ref
    mockCookieRef.value = 'new-token'

    // The exposed token should reflect the change
    expect(token.value).toBe('new-token')
  })

  describe('cookie configuration', () => {
    it('should call useCookie with correct configuration', async () => {
      const { useCookie } = await import('#app')

      useJwtToken()

      expect(useCookie).toHaveBeenCalledWith(TOKEN_KEY, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const { set, get } = useJwtToken()

      set('')

      expect(mockCookieRef.value).toBe('')
      expect(get()).toBe('')
    })

    it('should handle real JWT token format', () => {
      const { set, get } = useJwtToken()
      const realJwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      set(realJwtToken)

      expect(mockCookieRef.value).toBe(realJwtToken)
      expect(get()).toBe(realJwtToken)
    })

    it('should handle consecutive set operations (overwriting)', () => {
      const { set, get } = useJwtToken()

      set('first-token')
      expect(get()).toBe('first-token')

      set('second-token')
      expect(get()).toBe('second-token')

      set('third-token')
      expect(get()).toBe('third-token')
    })

    it('should handle consecutive remove operations', () => {
      const { set, remove, get } = useJwtToken()

      set('test-token')
      remove()
      expect(get()).toBe(null)

      remove() // Remove again when already null
      expect(get()).toBe(null)
    })
  })

  describe('token lifecycle', () => {
    it('should handle complete state transitions: null → token → null → another token', () => {
      const { set, remove, get } = useJwtToken()

      // Initial state: null
      expect(get()).toBe(null)

      // Set first token
      set('first-token')
      expect(get()).toBe('first-token')

      // Remove token (back to null)
      remove()
      expect(get()).toBe(null)

      // Set another token
      set('second-token')
      expect(get()).toBe('second-token')
    })

    it('should overwrite existing token correctly', () => {
      const { set, get } = useJwtToken()

      // Set initial token
      set('initial-token')
      expect(get()).toBe('initial-token')

      // Overwrite with new token
      set('new-token')
      expect(get()).toBe('new-token')
      expect(mockCookieRef.value).toBe('new-token')
    })
  })
})
