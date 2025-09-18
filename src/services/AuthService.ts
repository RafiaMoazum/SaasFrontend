import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    changePassword
} from '@/@types/auth'

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData({
     url: '/auth/signup', 
     method: 'post',
      data 
    })
}
export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({ 
        url: '/auth/login', 
        method: 'post', 
        data 
    })
}
export async function apiSignOut(data: { deviceId: string }) {
    return ApiService.fetchData({
        url: '/auth/logout-device',
        method: 'post',
        data,
    })
}
export async function apiRefresh(data: {
    deviceId: string
    refreshToken: string
}) {
    return ApiService.fetchData({
        url: '/auth/refresh-token',
        method: 'post',
        data,
    })
}


export async function apiVerifyEmail(params: { token: string; email: string }) {
    return ApiService.fetchData({
        url: '/auth/verification/verify-email',
        method: 'get',
        params, 
    })
}

export async function apiResendVerification(data: { email: string }) {
    return ApiService.fetchData({
        url: '/auth/verification/resend-verification',
        method: 'post',
        data,
    })
}


export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/auth/password/request-set-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/auth/password/set-password',
        method: 'post',
        data,
    })
}
export async function apiChangePassword(data: changePassword) {
    return ApiService.fetchData({
        url: '/auth/password/change-password',
        method: 'post',
        data,
    })
}
export async function apiDevicelogs(data: any) {
    return ApiService.fetchData({
        url: '/auth/device-logs',
        method: 'get',
        data,
    })
}
export async function apiSignOutAllDevices(data: any) {
    return ApiService.fetchData({
        url: '/auth/logout-all',
        method: 'post',
        data,
    })
}