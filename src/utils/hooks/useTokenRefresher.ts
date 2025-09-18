import { useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { refreshTokenSuccess, signOutSuccess } from '@/store'
import { apiRefresh } from '@/services/AuthService'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'

export function useTokenRefresher() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)
  const dispatch = useAppDispatch()

  const { accessToken, refreshToken, signedIn } = useAppSelector(
    (state) => state.auth.session
  )


  const getTokenExpiry = useCallback((token: string) => {
    if (!token) return 0
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000
    } catch (e) {
      console.warn('Failed to parse token expiry:', e)
      return 0
    }
  }, [])


  const isTokenExpiringSoon = useCallback((token: string) => {
    const expiryTime = getTokenExpiry(token)
    const now = Date.now()
    return expiryTime - now < 2 * 60 * 1000 
  }, [getTokenExpiry])

  
  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !refreshToken || !signedIn) {
      return false
    }

    isRefreshingRef.current = true

    try {
      const deviceId = localStorage.getItem('deviceId') || ''
      console.log('🔄 Scheduled token refresh starting...')
      
      const resp = await apiRefresh({ deviceId, refreshToken })
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = resp.data

     
      dispatch(refreshTokenSuccess({ 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken 
      }))

      try {
        const rawPersist = localStorage.getItem(PERSIST_STORE_NAME)
        if (rawPersist) {
          const persisted = JSON.parse(rawPersist)
          const updatedPersist = {
            ...persisted,
            auth: {
              ...persisted.auth,
              session: { 
                ...persisted.auth?.session,
                accessToken: newAccessToken, 
                refreshToken: newRefreshToken,
                signedIn: true
              },
            },
          }
          localStorage.setItem(PERSIST_STORE_NAME, JSON.stringify(updatedPersist))
        }
      } catch (persistError) {
        console.warn('Failed to update localStorage:', persistError)
      }

      console.log('✅ Scheduled token refresh successful')
      return true
    } catch (error: any) {
      console.error('❌ Scheduled token refresh failed:', error.response?.data?.message || error.message)
      
      // Only sign out on specific auth errors, not network errors
      if (error.response?.status === 401 || 
          error.response?.data?.message?.includes('Invalid refresh token') ||
          error.response?.data?.message?.includes('Token expired')) {
        console.log('🚪 Signing out due to invalid refresh token')
        dispatch(signOutSuccess())
      }
      
      return false
    } finally {
      isRefreshingRef.current = false
    }
  }, [refreshToken, signedIn, dispatch])

 
  const scheduleRefresh = useCallback(() => {
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!accessToken || !refreshToken || !signedIn) {
      console.log('❌ Cannot schedule refresh - missing tokens or not signed in')
      return
    }

    const expiryTime = getTokenExpiry(accessToken)
    if (expiryTime === 0) {
      console.warn('⚠️ Could not parse token expiry, skipping scheduled refresh')
      return
    }

    const now = Date.now()
    const timeUntilExpiry = expiryTime - now

   
    if (timeUntilExpiry <= 2 * 60 * 1000) {
      console.log('⚡ Token expires soon, refreshing immediately')
      performRefresh().then((success) => {
        if (success) {
         
          setTimeout(() => scheduleRefresh(), 1000)
        }
      })
      return
    }

    // Schedule refresh 2 minutes before expiry
    const timeout = Math.max(timeUntilExpiry - 2 * 60 * 1000, 30 * 1000) // minimum 30 seconds

    console.log(`⏰ Next token refresh scheduled in ${Math.round(timeout / 1000)} seconds`)

    timerRef.current = setTimeout(async () => {
      const success = await performRefresh()
      if (success) {
       
        scheduleRefresh()
      } else {
       
        timerRef.current = setTimeout(() => {
          scheduleRefresh()
        }, 30 * 1000)
      }
    }, timeout)
  }, [accessToken, refreshToken, signedIn, getTokenExpiry, performRefresh])

  
  useEffect(() => {
    if (signedIn && accessToken && refreshToken) {
      scheduleRefresh()
    } else {
     
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [accessToken, refreshToken, signedIn, scheduleRefresh])

  
  useEffect(() => {
    return () => {
      isRefreshingRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])
}