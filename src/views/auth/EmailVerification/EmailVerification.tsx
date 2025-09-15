import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { apiVerifyEmail, apiResendVerification } from '@/services/authService'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

const EmailVerification = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const hasVerified = useRef(false)

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'success' | 'error' | 'already-verified' | 'invalid-link' | 'expired' | 'not-found' | null>(null)
    const [message, setMessage] = useTimeOutMessage() 
    const [resending, setResending] = useState(false)
    const [resendMessage, setResendMessage] = useTimeOutMessage() 

    useEffect(() => {
        if (hasVerified.current) return
        
        if (!token || !email) {
            setStatus('invalid-link')
            setMessage('Invalid verification link. Please check your email for the complete verification URL.')
            setLoading(false)
            return
        }

        const verifyEmail = async () => {
            try {
                hasVerified.current = true
                const res = await apiVerifyEmail({ token, email })
                
                setStatus('success')
                setMessage(res?.data?.message || 'Email verified successfully! You can now sign in to your account.')
                setTimeout(() => navigate('/sign-in'), 3000)
            } catch (err: any) {
                console.error('Verification error:', err)
                
                const errorMessage = err.response?.data?.message || err.message || ''
                
               
                if (errorMessage.includes('already verified')) {
                    setStatus('already-verified')
                    setMessage('Your email address is already verified. You can sign in to your account now.')
                    setTimeout(() => navigate('/sign-in'), 2000)
                } 
                else if (errorMessage.includes('Invalid email') || errorMessage.includes('User not found')) {
                    setStatus('not-found')
                    setMessage('No account found with this email address. Please check your email or sign up for a new account.')
                }
                else if (errorMessage.includes('No verification token present')) {
                    setStatus('invalid-link')
                    setMessage('This verification link has already been used. Please request a new verification email if needed.')
                }
                else if (errorMessage.includes('Invalid or expired verification token')) {
                    setStatus('expired')
                    setMessage('This verification link has expired or is invalid. Please request a new verification email.')
                }
                else {
                    setStatus('error')
                    setMessage('Verification failed. Please try again or contact support if the problem persists.')
                }
            } finally {
                setLoading(false)
            }
        }

        verifyEmail()
    }, [token, email, navigate, setMessage]) 

    const handleResend = async () => {
        if (!email) return
        
        setResending(true)
        setResendMessage('') 
        
        try {
            const res = await apiResendVerification({ email })
            setResendMessage(res?.data?.message || 'Verification email sent! Please check your inbox.')
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || ''
            
            if (errorMessage.includes('already verified')) {
                setResendMessage('This email is already verified. You can sign in to your account now.')
            }
            else if (errorMessage.includes('User not found')) {
                setResendMessage('No account found with this email address. Please sign up first.')
            }
            else {
                setResendMessage('Failed to resend verification email. Please try again later.')
            }
        } finally {
            setResending(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-md mx-auto text-center">
                <h3 className="mb-4">Verify your email</h3>
                <p>We are verifying your email address...</p>
                <p className="text-gray-500 mt-4">Please wait...</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
                <h3 className="mb-1">Verify your email</h3>
                <p className="text-gray-600">
                    {status === 'success' && 'Almost done! Your email is being verified...'}
                    {status === 'already-verified' && 'Your email is already verified!'}
                    {(status === 'error' || status === 'expired' || status === 'invalid-link' || status === 'not-found') && 'Verification issue'}
                </p>
            </div>

            {status === 'success' && message && (
                <Alert type="success" showIcon className="mb-4">
                    <strong>Success!</strong>
                    <p className="mt-1">{message}</p>
                    <p className="mt-2 text-sm">Redirecting you to sign in...</p>
                </Alert>
            )}

            {status === 'already-verified' && message && (
                <Alert type="success" showIcon className="mb-4">
                    <strong>Already Verified</strong>
                    <p className="mt-1">{message}</p>
                    <p className="mt-2 text-sm">Redirecting you to sign in...</p>
                </Alert>
            )}

            {(status === 'error' || status === 'expired' || status === 'invalid-link' || status === 'not-found') && (
                <>
                    {message && (
                        <Alert type="danger" showIcon className="mb-4">
                            <strong>Verification Failed</strong>
                            <p className="mt-1">{message}</p>
                        </Alert>
                    )}

                    <div className="text-center space-y-3">
                        <Button
                            variant="solid"
                            onClick={() => navigate('/sign-in')}
                            className="w-full"
                        >
                            Go to Sign In
                        </Button>
                        
                        {(status === 'expired' || status === 'invalid-link') && email && (
                            <Button
                                variant="default"
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full"
                            >
                                {resending ? 'Sending...' : 'Send New Verification Email'}
                            </Button>
                        )}
                        
                        {status === 'not-found' && (
                            <Button
                                variant="default"
                                onClick={() => navigate('/sign-up')}
                                className="w-full"
                            >
                                Create New Account
                            </Button>
                        )}
                    </div>

                    {resendMessage && (
                        <Alert 
                            type={resendMessage.includes('already verified') || resendMessage.includes('sent') ? 'success' : 'danger'} 
                            showIcon 
                            className="mt-3"
                        >
                            {resendMessage}
                        </Alert>
                    )}
                </>
            )}
        </div>
    )
}

export default EmailVerification