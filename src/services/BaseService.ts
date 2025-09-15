import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess, refreshTokenSuccess } from '../store'
import { apiRefresh } from '@/services/AuthService'

const unauthorizedCode = [401]

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
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
  (error) => {
    return Promise.reject(error)
  }
)

BaseService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const originalRequest = config

    if (response && response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
          return BaseService(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const state = store.getState()
        const refreshToken = state.auth.session.refreshToken
        const deviceId = localStorage.getItem('deviceId') || ''

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const refreshResponse = await apiRefresh({
          deviceId,
          refreshToken
        })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data

        // Update store with new tokens
        store.dispatch(refreshTokenSuccess({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }))

        // Update the Authorization header
        originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newAccessToken}`

        // Process queued requests
        processQueue(null, newAccessToken)

        return BaseService(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(signOutSuccess())
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (response && unauthorizedCode.includes(response.status)) {
      store.dispatch(signOutSuccess())
    }

    return Promise.reject(error)
  }
)

export default BaseService