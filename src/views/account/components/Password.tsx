import classNames from 'classnames'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import isLastChild from '@/utils/isLastChild'
import {
    HiOutlineDesktopComputer,
    HiOutlineDeviceMobile,
    HiOutlineDeviceTablet,
    HiOutlineLockClosed,
    HiOutlineLogout,
} from 'react-icons/hi'
import dayjs from 'dayjs'
import * as Yup from 'yup'
import {
    apiChangePassword,
    apiDevicelogs,
    apiSignOutAllDevices,
} from '@/services/AuthService'
import { useAppSelector } from '@/store'
import { useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import useAuth from '@/utils/hooks/useAuth'
import { PasswordInput } from '@/components/shared'

type LoginHistory = {
    id: string
    userId: string
    deviceId: string
    deviceName: string
    ipAddress: string
    location: string | null
    lastLoginAt: string
    lastLogoutAt: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    type?: string
    time?: number
}

type PasswordFormModel = {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

type DeviceLogsResponse = {
    message: string
    data: LoginHistory[]
}

const LoginHistoryIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Desktop':
            return <HiOutlineDesktopComputer />
        case 'Mobile':
            return <HiOutlineDeviceMobile />
        case 'Tablet':
            return <HiOutlineDeviceTablet />
        default:
            return <HiOutlineDesktopComputer />
    }
}

const getDeviceType = (deviceName: string): string => {
    if (
        deviceName.toLowerCase().includes('iphone') ||
        deviceName.toLowerCase().includes('android')
    ) {
        return 'Mobile'
    } else if (
        deviceName.toLowerCase().includes('ipad') ||
        deviceName.toLowerCase().includes('tablet')
    ) {
        return 'Tablet'
    } else {
        return 'Desktop'
    }
}

// Password validation pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string()
        .min(8, 'Min 8 characters')
        .matches(passwordPattern, 'Include letters, numbers & symbols')
        .required('New Password is required'),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
        .required('Confirm Password is required'),
})

const Password = () => {
    const user = useAppSelector((state) => state.auth.user)
    const [deviceLogs, setDeviceLogs] = useState<LoginHistory[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [loading, setLoading] = useState(false)
    const [signingOutAll, setSigningOutAll] = useState(false)
      const { signOut } = useAuth()

    useEffect(() => {
        fetchDeviceLogs()
    }, [])

    const fetchDeviceLogs = async () => {
        try {
            setLoadingLogs(true)
            const response = await apiDevicelogs({})
            const logsData: DeviceLogsResponse = response.data

            const transformedLogs = logsData.data.map((log) => ({
                ...log,
                type: getDeviceType(log.deviceName),
                time: dayjs(log.lastLoginAt).unix(),
            }))

            setDeviceLogs(transformedLogs)
        } catch (error) {
            console.error('Failed to fetch device logs:', error)
            toast.push(
                <Notification title="Error" type="danger" duration={2500}>
                    Failed to load device logs
                </Notification>
            )

        } finally {
            setLoadingLogs(false)
        }
    }

    const onFormSubmit = async (
        values: PasswordFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setLoading(true)
            if (!user?.email) {
                throw new Error('User email not found')
            }

            const changePasswordData = {
                email: user.email,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            }

            const response = await apiChangePassword(changePasswordData)

            toast.push(
                <Notification
                    title={'Password updated successfully'}
                    type="success"
                />,
            )

            // Reset form on success
            setSubmitting(false)
        } catch (error) {
            console.error('Password change error:', error)
            let message = 'An unknown error occurred'

            if (error instanceof AxiosError) {
                message =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Failed to update password'
            } else if (error instanceof Error) {
                message = error.message
            }

            toast.push(
                <Notification title="Error" type="danger" duration={4000}>
                    {message}
                </Notification>
            )
        } finally {
            setLoading(false)
            setSubmitting(false)
        }
    }

    const handleSignOutAllDevices = async () => {
        try {
            setSigningOutAll(true)
            const response = await apiSignOutAllDevices({})

            toast.push(
                <Notification
                    title={'Signed out from all devices successfully'}
                    type="success"
                />,
            )

            await signOut()
        } catch (error) {
            console.error('Sign out all devices error:', error)
            let message = 'An unknown error occurred'

            if (error instanceof AxiosError) {
                message =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Failed to sign out from all devices'
            }

            toast.push(
                <Notification title="Error" type="danger" duration={4000}>
                    {message}
                </Notification>
            )
        } finally {
            setSigningOutAll(false)
        }
    }

    const hasActiveSessions = deviceLogs.some((log) => log.isActive)

    return (
        <>
            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onFormSubmit(values, setSubmitting)
                }}
            >
                {({ touched, errors, isSubmitting, resetForm }) => (
                    <Form>
                        <FormContainer>
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-2">
                                    Password
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Enter your current & new password to reset
                                    your password
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Current Password
                                </label>
                                <Field
                                    type="password"
                                    autoComplete="off"
                                    name="currentPassword"
                                    placeholder="Current Password"
                                    component={PasswordInput}
                                    prefix={
                                        <HiOutlineLockClosed className="text-xl" />
                                    }
                                />
                                {errors.currentPassword &&
                                    touched.currentPassword && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.currentPassword}
                                        </div>
                                    )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <Field
                                    type="password"
                                    autoComplete="off"
                                    name="newPassword"
                                    placeholder="New Password"
                                    component={PasswordInput}
                                    prefix={
                                        <HiOutlineLockClosed className="text-xl" />
                                    }
                                />
                                {errors.newPassword && touched.newPassword && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.newPassword}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <Field
                                    type="password"
                                    autoComplete="off"
                                    name="confirmNewPassword"
                                    placeholder="Confirm Password"
                                    component={PasswordInput}
                                    prefix={
                                        <HiOutlineLockClosed className="text-xl" />
                                    }
                                />
                                {errors.confirmNewPassword &&
                                    touched.confirmNewPassword && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.confirmNewPassword}
                                        </div>
                                    )}
                            </div>

                            <div className="mt-8 pt-4 border-t flex gap-4">
                                <Button
                                    type="button"
                                    variant="solid"
                                    onClick={() => resetForm()}
                                    disabled={isSubmitting || loading}
                                    className="!bg-custom-dark-600 hover:!bg-custom-dark-400 cursor-not-allowed transition-colors duration-200 text-white"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting || loading}
                                    type="submit"
                                    className="!bg-custom-dark-800 hover:!bg-custom-dark-600 transition-colors duration-200 text-white"
                                >
                                    {isSubmitting || loading
                                        ? 'Updating'
                                        : 'Update Password'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>

            <div className="mt-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Where you're signed in
                        </h3>
                        <p className="text-gray-500 text-sm">
                            You're signed in to your account on these devices.
                        </p>
                    </div>
                    {hasActiveSessions && (
                        <Button
                            variant="solid"
                            loading={signingOutAll}
                            onClick={handleSignOutAllDevices}
                            icon={<HiOutlineLogout />}
                            className="!bg-red-500 hover:!bg-red-600 text-white"
                        >
                            Sign out all devices
                        </Button>
                    )}
                </div>

                {loadingLogs ? (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 mt-6 p-4">
                        <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ) : deviceLogs.length > 0 ? (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 mt-6">
                        {deviceLogs.map((log, index) => (
                            <div
                                key={log.id}
                                className={classNames(
                                    'flex items-center px-4 py-6',
                                    !isLastChild(deviceLogs, index) &&
                                        'border-b border-gray-200 dark:border-gray-600'
                                )}
                            >
                                <div className="flex items-center">
                                    <div className="text-3xl">
                                        <LoginHistoryIcon
                                            type={log.type || 'Desktop'}
                                        />
                                    </div>
                                    <div className="ml-3 rtl:mr-3">
                                        <div className="flex items-center">
                                            <div className="text-gray-900 dark:text-gray-100 font-semibold">
                                                {log.deviceName}
                                            </div>
                                            {log.isActive && (
                                                <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 rounded-md border-0 mx-2">
                                                    <span className="capitalize">
                                                        Current
                                                    </span>
                                                </Tag>
                                            )}
                                        </div>
                                        <span>
                                            {log.location || 'Unknown location'}{' '}
                                            •{' '}
                                            {dayjs(log.lastLoginAt).format(
                                                'DD-MMM-YYYY, hh:mm A'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 mt-6 p-4 text-center text-gray-500">
                        No device logs found
                    </div>
                )}
            </div>
        </>
    )
}

export default Password
