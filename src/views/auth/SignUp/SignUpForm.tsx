import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { getDeviceInfo } from '@/utils/deviceInfo'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    firstName: string
    lastName: string
    password: string
    email: string
}
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .min(2, 'Must be at least 2 characters')
        .max(50, 'Cannot exceed 50 characters')
        .required('First name is required'),

    lastName: Yup.string()
        .min(2, 'Must be at least 2 characters')
        .max(50, 'Cannot exceed 50 characters')
        .required('Last name is required'),

    email: Yup.string()
        .email('Email must be a valid email')
        .required('Email is required')
        .test(
            'domain-has-dot',
            'Email must include user@domain.com',
            function (value) {
                if (!value) return true
                const parts = value.split('@')
                if (parts.length !== 2) return false
                return parts[1].includes('.')
            }
        ),

    password: Yup.string()
        .min(8, 'Min 8 characters')
        .matches(passwordPattern, 'Include letters, numbers & symbols')
        .required('Password is required'),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const { signUp } = useAuth()

    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)

        const { deviceId, deviceName } = await getDeviceInfo()
        const result = await signUp({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            deviceId,
            deviceName,
        })

        if (result?.status === 'failed') {
            setMessage(result.message)
        } else if (result?.status === 'success') {
            toast.push(
                <Notification type="success">
                    {result.message ||
                        'User Registered Successfully. Please check your email for verification link.'}
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="First Name"
                                invalid={errors.firstName && touched.firstName}
                                errorMessage={errors.firstName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="firstName"
                                    placeholder="First Name"
                                    component={Input}
                                />
                            </FormItem>

                            <FormItem
                                label="Last Name"
                                invalid={errors.lastName && touched.lastName}
                                errorMessage={errors.lastName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="lastName"
                                    placeholder="Last Name"
                                    component={Input}
                                />
                            </FormItem>

                            <FormItem
                                label="Email"
                                invalid={errors.email && touched.email}
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Password"
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Confirm Password"
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="!bg-custom-dark-800 hover:!bg-custom-dark-600 transition-colors duration-200 text-white"
                            >
                                {isSubmitting
                                    ? 'Creating Account...'
                                    : 'Sign Up'}
                            </Button>
                            <div className="mt-2 text-center">
                                <span>Already have an account? </span>
                                <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
