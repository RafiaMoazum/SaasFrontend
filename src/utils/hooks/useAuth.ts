import {
    apiSignUp,
    apiSignIn,
    apiSignOut,
} from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import { UserState } from '@/store/slices/auth/userSlice'
import { v4 as uuidv4 } from 'uuid'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const query = useQuery()

    const { accessToken, refreshToken, signedIn } = useAppSelector(
        (state) => state.auth.session
    )

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId')
        if (!deviceId) {
            deviceId = uuidv4()
            localStorage.setItem('deviceId', deviceId)
        }
        return deviceId
    }

    const signIn = async (
        values: SignInCredential
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const deviceId = getDeviceId()
            const resp = await apiSignIn({ ...values, deviceId })

            if (resp.data) {
                const { accessToken, refreshToken, user } = resp.data

                dispatch(
                    signInSuccess({
                        accessToken,
                        refreshToken,
                    })
                )

                if (user) {
                    const userData: UserState = {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions,
                        profileImage: user.profileImage || '',
                        authority: [user.role || 'USER'],
                    }

                    dispatch(setUser(userData))
                }

                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )
                return {
                    status: 'success',
                    message: '',
                }
            }
        } catch (errors: any) {
            console.error('SignIn error:', errors)
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)

            if (resp.data) {
                // Redirect after successful signup
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl
                        ? redirectUrl
                        : appConfig.unAuthenticatedEntryPath
                )

                return {
                    status: 'success',
                    message: '',
                }
            }
        } catch (errors: any) {
            return {
                status: 'failed',
                message:
                    errors?.response?.data?.errors?.[0] ||
                    errors?.response?.data?.message ||
                    errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                id: '',
                firstName: '',
                lastName: '',
                email: '',
                role: '',
                permissions: [],
                profileImage: '',
                authority: [],
            })
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async (): Promise<{
        status: Status
        message: string
    }> => {
        try {
            const deviceId = localStorage.getItem('deviceId') || ''

            await apiSignOut({ deviceId })

            handleSignOut()

            return {
                status: 'success',
                message: 'Signed out successfully',
            }
        } catch (errors: any) {
            console.error('SignOut error:', errors)
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    return {
        authenticated: accessToken && refreshToken && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
