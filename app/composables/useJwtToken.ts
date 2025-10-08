import { useCookie } from '#app'

export const TOKEN_KEY = 'jwt-token' as const

/**
 * JWT token composable using Nuxt's useCookie
 * Provides reactive token management with SSR support
 */
export function useJwtToken() {
  const token = useCookie<string | null>(TOKEN_KEY, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  })

  const get = () => token.value ?? null

  const set = (value: string) => {
    token.value = value
  }

  const remove = () => {
    token.value = null
  }

  return {
    token, // expose reactive ref for computed dependencies
    get,
    set,
    remove
  }
}
