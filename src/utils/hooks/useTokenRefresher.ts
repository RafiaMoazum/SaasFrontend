import { useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { refreshTokenSuccess, signOutSuccess } from '@/store'
import { apiRefresh } from '@/services/AuthService'

export function useTokenRefresher() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dispatch = useAppDispatch()

  const { accessToken, refreshToken, signedIn } = useAppSelector(
    (state) => state.auth.session
  )

  // Parse JWT to get expiry timestamp
  const getTokenExpiry = (token: string) => {
    if (!token) return 0
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000
    } catch (e) {
      return 0
    }
  }

  // Schedule refresh before token expiry
  const scheduleRefresh = () => {
    if (!accessToken || !refreshToken || !signedIn) return

    const expiryTime = getTokenExpiry(accessToken)
    const now = Date.now()
    const timeout = Math.max(expiryTime - now - 60 * 1000, 0) // refresh 60s before expiry

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const deviceId = localStorage.getItem('deviceId') || ''
        const resp = await apiRefresh({ deviceId, refreshToken })
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = resp.data

        // Update Redux store
        dispatch(refreshTokenSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken }))

        // Persist updated tokens
        const rawPersist = localStorage.getItem('PERSIST_STORE_NAME')
        const persisted = rawPersist ? JSON.parse(rawPersist) : {}
        localStorage.setItem(
          'PERSIST_STORE_NAME',
          JSON.stringify({
            ...persisted,
            auth: {
              ...persisted.auth,
              session: { accessToken: newAccessToken, refreshToken: newRefreshToken },
            },
          })
        )

        // Reschedule next refresh
        scheduleRefresh()
      } catch (err: any) {
        console.warn('Token refresh failed:', err.response?.data?.message || err.message)

        // Retry after 30 seconds instead of logging out immediately
        timerRef.current = setTimeout(() => {
          scheduleRefresh()
        }, 30 * 1000)
      }
    }, timeout)
  }

  useEffect(() => {
    scheduleRefresh()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [accessToken, refreshToken, signedIn])
}
