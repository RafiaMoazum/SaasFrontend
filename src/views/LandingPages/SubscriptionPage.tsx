import { apiGetAllPackages } from '@/services/PackageApiService'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { apiCreateUserSubscription } from '@/services/UserSubscription'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const SubscriptionPage = () => {
    const [packages, setPackages] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string | null>(null) // only for package fetch
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('Guest')

    useEffect(() => {
        // ✅ Extract userId from localStorage.admin
        try {
            const adminData = localStorage.getItem('admin')
            if (adminData) {
                const parsedData = JSON.parse(adminData)
                if (parsedData.auth) {
                    const authData = JSON.parse(parsedData.auth)
                    const extractedUserId = authData.user?.id || 'Guest'
                    setUserId(extractedUserId)
                    console.log("Extracted userId:", extractedUserId)
                }
            }
        } catch (error) {
            console.error('Error parsing localStorage data:', error)
        }


        // ✅ Fetch packages
        const fetchPackages = async () => {
            setLoading(true)
            setFetchError(null)
            try {
                const res = await apiGetAllPackages()
                setPackages(res.data.data.packages)
            } catch (err: any) {
                setFetchError('Failed to fetch packages')
            } finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [])


    const handleChoosePlan = async (planId: string) => {
        if (!userId || userId === 'Guest') {
            toast.push(
                <Notification title="Error" type="danger">
                    User not found. Please log in again.
                </Notification>
            )
            return
        }
        console.log("Creating subscription for user:", userId, "with plan:", planId)
        if (!userId) {
            toast.push(
                <Notification title="Error" type="danger">
                    User not found. Please log in again.
                </Notification>
            )
            return
        }
        console.log("Creating subscription for user:", userId, "with plan:", planId)

        setSubmitting(planId)
        try {
            const res = await apiCreateUserSubscription({ planId, userId })
            toast.push(
                <Notification title="Success" type="success">
                    Subscription created successfully!
                </Notification>
            )
            console.log("Subscription created:", res.data)
        } catch (err: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to create subscription
                </Notification>
            )
        } finally {
            setSubmitting(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading packages...</div>
    }

    if (fetchError) {
        return <div className="text-red-600 text-center py-8">{fetchError}</div>
    }

    return (
        <div className="p-6 md:p-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
                Choose Your Plan
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="relative bg-white border rounded-2xl shadow-md hover:shadow-xl transition duration-300 flex flex-col"
                    >
                        {/* Badge */}
                        {pkg.badge && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#4f46e4] text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                                {pkg.badge.badgeText}
                            </div>
                        )}

                        <div className="p-6 flex flex-col flex-grow">
                            {/* Title & Price */}
                            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                                {pkg.packageName}
                            </h2>
                            <p className="text-3xl font-bold text-gray-900 text-center">
                                PKR {pkg.pricing}.00
                                <span className="text-base text-gray-500 font-normal"> / {pkg.packageType}</span>
                            </p>
                            <p className="mt-2 text-gray-600 text-sm text-center">{pkg.description}</p>

                            {/* Features */}
                            <div className="mt-6 flex-grow">
                                <ul className="space-y-3">
                                    {pkg.features
                                        .slice()
                                        .sort((a: any, b: any) => {
                                            if (a.packageFeature.isOffered === b.packageFeature.isOffered) return 0
                                            return a.packageFeature.isOffered ? -1 : 1
                                        })
                                        .map((f: any) => (
                                            <li key={f.id} className="flex items-center gap-2 text-sm">
                                                {f.packageFeature.isOffered ? (
                                                    <CheckCircle2 className="text-[#4f46e4] w-5 h-5" />
                                                ) : (
                                                    <XCircle className="text-red-500 w-5 h-5" />
                                                )}
                                                <span
                                                    className={
                                                        f.packageFeature.isOffered
                                                            ? "text-gray-700"
                                                            : "text-gray-400 line-through"
                                                    }
                                                >
                                                    {f.feature}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Button */}
                            <div className="mt-6">
                                <button
                                    onClick={() => handleChoosePlan(pkg.id)}
                                    disabled={submitting === pkg.id}
                                    className={`w-full ${submitting === pkg.id
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#4f46e4] hover:bg-indigo-700"
                                        } text-white font-semibold py-2 px-4 rounded-xl transition`}
                                >
                                    {submitting === pkg.id ? "Processing..." : "Choose Plan"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SubscriptionPage
