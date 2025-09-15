// BaseService.ts
import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess, refreshTokenSuccess } from '../store'

// 401 unauthorized codes
const unauthorizedCode = [401]

// Flag for refreshing token and request queue
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

// Axios instance for main requests
const BaseService = axios.create({
  baseURL: appConfig.apiPrefix,
  timeout: 60000,
})

// Axios instance for refresh token request
const refreshAxios = axios.create({
  baseURL: appConfig.apiPrefix,
  timeout: 60000,
})

// ✅ Always read the latest token directly from Redux store
BaseService.interceptors.request.use(
  (config) => {
    const { auth } = store.getState()
    const accessToken = auth?.session?.accessToken
    if (accessToken) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor to handle 401 and refresh
BaseService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const originalRequest = config

    if (
      response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        // Queue other requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
            return BaseService(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const state = store.getState()
        const refreshToken = state.auth.session.refreshToken
        const deviceId = localStorage.getItem('deviceId') || ''

        if (!refreshToken) throw new Error('No refresh token available')

        // Use plain axios to avoid interceptor recursion
        const refreshResponse = await refreshAxios.post('/auth/refresh-token', {
          deviceId,
          refreshToken,
        })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data

        // ✅ Update store
        store.dispatch(
          refreshTokenSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken })
        )

        // ✅ Persist new tokens to localStorage BEFORE retry
        const rawPersist = localStorage.getItem(PERSIST_STORE_NAME)
        const persisted = rawPersist ? deepParseJson(rawPersist) : {}
        localStorage.setItem(
          PERSIST_STORE_NAME,
          JSON.stringify({
            ...persisted,
            auth: {
              ...persisted.auth,
              session: {
                ...persisted?.auth?.session,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              },
            },
          })
        )

       
        originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newAccessToken}`
        processQueue(null, newAccessToken)

        console.log(
          '🔄 Retrying request:',
          originalRequest.url,
          'with new token:',
          newAccessToken?.slice(0, 10)
        )

        return BaseService(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(signOutSuccess()) 
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default BaseService
