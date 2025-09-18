import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess, refreshTokenSuccess } from '../store'
import { apiRefresh } from '@/services/AuthService'

const unauthorizedCode = [401]
let isRefreshing = false
let refreshPromise: Promise<string> | null = null
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const BaseService = axios.create({
  timeout: 60000,
  baseURL: appConfig.apiPrefix,
})

BaseService.interceptors.request.use(
  (config) => {
    let accessToken: string | null = null
    const { auth } = store.getState()

    if (auth?.session?.accessToken) {
      accessToken = auth.session.accessToken
    } else {
      try {
        const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
        if (rawPersistData) {
          const persistData = deepParseJson(rawPersistData)
          accessToken = (persistData as any)?.auth?.session?.accessToken
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error)
      }
    }

    if (accessToken) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

BaseService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const originalRequest = config

    // Skip refresh logic for auth-related requests
    const skipRefresh = ['/auth/login', '/auth/signup', '/auth/refresh-token'].some((url) =>
      originalRequest.url?.includes(url)
    )
    if (skipRefresh) {
      return Promise.reject(error)
    }

    if (response && response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // If already refreshing, wait for the existing refresh to complete
      if (isRefreshing && refreshPromise) {
        try {
          const newToken = await refreshPromise
          originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newToken}`
          return BaseService(originalRequest)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }

      // If not refreshing, start the refresh process
      if (!isRefreshing) {
        isRefreshing = true
        
        refreshPromise = new Promise(async (resolve, reject) => {
          try {
            const state = store.getState()
            const refreshToken = state.auth.session?.refreshToken
            const deviceId = localStorage.getItem('deviceId') || ''

            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            console.log('🔄 Attempting token refresh...')
            const refreshResponse = await apiRefresh({ deviceId, refreshToken })
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
              refreshResponse.data

            // Update Redux store
            store.dispatch(
              refreshTokenSuccess({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              })
            )

            console.log('✅ Token refresh successful')
            processQueue(null, newAccessToken)
            resolve(newAccessToken)
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed:', refreshError.response?.data?.message || refreshError.message)
            processQueue(refreshError, null)
            
            // Only sign out if it's actually an invalid refresh token, not a network error
            if (refreshError.response?.status === 401 || refreshError.response?.data?.message?.includes('Invalid refresh token')) {
              store.dispatch(signOutSuccess())
            }
            
            reject(refreshError)
          } finally {
            isRefreshing = false
            refreshPromise = null
          }
        })

        try {
          const newToken = await refreshPromise
          originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newToken}`
          return BaseService(originalRequest)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }

      // If somehow we get here (shouldn't happen), add to queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ 
          resolve: (token: string) => {
            originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
            resolve(BaseService(originalRequest))
          }, 
          reject 
        })
      })
    }

    // Handle other unauthorized responses
    if (response && unauthorizedCode.includes(response.status) && !originalRequest._retry) {
      store.dispatch(signOutSuccess())
    }

    return Promise.reject(error)
  }
)

export default BaseService