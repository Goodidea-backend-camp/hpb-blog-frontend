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
})
