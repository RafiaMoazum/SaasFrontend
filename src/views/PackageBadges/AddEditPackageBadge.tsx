import React, { useState, useEffect } from 'react'
import { AdaptableCard } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { apiCreatePackageBadge, apiGetPackageBadgesById, apiUpdatePackageBadges } from '@/services/PackageApiService'


interface PackageBadgeData {
    id?: string
    badgeText: string
}

const AddEditPackageBadge: React.FC = () => {
    const [badgeText, setBadgeText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    


    const { id } = useParams<{ id: string }>()
    const isEditMode = Boolean(id)
    const navigate = useNavigate()

    // 🔹 Fetch existing badge if edit mode
    useEffect(() => {
        const fetchBadge = async () => {
            if (!id) return
            setLoading(true)
            try {
                console.log("Fetching badge with ID:", id)
                const response = await apiGetPackageBadgesById({ id })
                console.log("Fetched badge data:", response.data.data)
                const data: PackageBadgeData = response.data.data
                setBadgeText(data.badgeText)
            } catch (err) {
                setError('Failed to fetch badge data.')
            } finally {
                setLoading(false)
            }
        }

        if (isEditMode) {
            fetchBadge()
        }
    }, [id, isEditMode])

    // 🔹 Submit handler
    const handleSubmit = async () => {
        if (!badgeText.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Badge Text is required
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        const payload: PackageBadgeData = {
            id: id || undefined,
            badgeText,
        }

        console.log("Payload to submit:", payload)

        try {
            setLoading(true)
            if (isEditMode && id) {
                await apiUpdatePackageBadges(payload)
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Badge Updated Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await apiCreatePackageBadge(payload)
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Badge Added Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            }

            navigate('/packageBadgesList')
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save badge.'}
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        An unknown error occurred.
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? 'Edit Package Badge' : 'Add New Package Badge'}
                    </h3>
                </div>
                <div className="pb-4">
                    {/* Badge Text Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Badge Text</label>
                        <div className="mt-2">
                            <Input
                                placeholder="Enter Badge Text"
                                value={badgeText}
                                onChange={(e) => setBadgeText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-12">
                        <Button
                            className="px-6"
                            variant="solid"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Badge' : 'Add Badge'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default AddEditPackageBadge
