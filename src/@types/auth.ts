export type SignInCredential = {
    email: string
    password: string
    deviceId: string
    deviceName: string
}

export type SignInResponse = {
    accessToken: string 
    refreshToken: string 
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        role: string
        permissions: string[]
        authority: string[]
        profileImage: string
    }
}
   

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    firstName: string
    lastName: string
    email: string
    password: string
    deviceId: string
    deviceName: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    email: string
    token: string
    newPassword: string
}
