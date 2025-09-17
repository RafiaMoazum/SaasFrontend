import React, { useState, useEffect } from 'react'
import { AdaptableCard } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { apiCreatePackageFeature, apiGetPackageFeaturesById, apiUpdatePackageFeature } from '@/services/PackageApiService'


interface PackageFeatureData {
    id?: string
    feature: string
}

const AddEditPackageFeatures: React.FC = () => {
    const [feature, setFeature] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
    const [newFeature, setNewFeature] = useState("")


    const { id } = useParams<{ id: string }>()
    const isEditMode = Boolean(id)
    const navigate = useNavigate()

    // 🔹 Fetch existing feature if edit mode
    useEffect(() => {
        const fetchFeature = async () => {
            if (!id) return
            setLoading(true)
            try {
                console.log("Fetching feature with ID:", id)
                const response = await apiGetPackageFeaturesById({ id })
                console.log("Fetched feature data:", response.data.data)
                const data: PackageFeatureData = response.data.data
                setFeature(data.feature)
            } catch (err) {
                setError('Failed to fetch feature data.')
            } finally {
                setLoading(false)
            }
        }

        if (isEditMode) {
            fetchFeature()
        }
    }, [id, isEditMode])

    // 🔹 Submit handler
    const handleSubmit = async () => {
        if (!feature.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Feature name is required
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        const payload: PackageFeatureData = {
            id: id || undefined,
            feature,
        }

        console.log("Payload to submit:", payload)

        try {
            setLoading(true)
            if (isEditMode && id) {
                await apiUpdatePackageFeature(payload)
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Feature Updated Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await apiCreatePackageFeature(payload)
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Feature Added Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            }

            navigate('/packageFeaturesList')
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save feature.'}
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
                        {isEditMode ? 'Edit Package Feature' : 'Add New Package Feature'}
                    </h3>
                </div>
                <div className="pb-4">
                    {/* Feature Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Feature</label>
                        <div className="mt-2">
                            <Input
                                placeholder="Enter Feature"
                                value={feature}
                                onChange={(e) => setFeature(e.target.value)}
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
                            {loading ? 'Saving...' : isEditMode ? 'Update Feature' : 'Add Feature'}
                        </Button>
                    </div>
                </div>
            </div>
            
        </AdaptableCard>
    )
}

export default AddEditPackageFeatures
