import React, { useState, useEffect, ChangeEvent } from 'react'
import { AdaptableCard } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { apiCreatePromoCode, apiGetPromoCodeById, apiUpdatePromoCode } from '@/services/PromoCodesApiService'



interface PromoCodeData {
    id?: string
    codeTitle: string
    discountType: string
    discountValue: number
    startDate: string
    endDate: string
    maxPromos: number
    promoAccess: string
}

const AddEditPromoCodes: React.FC = () => {
    const [codeTitle, setCodeTitle] = useState('')
    const [discountType, setDiscountType] = useState('percentage')
    const [discountValue, setDiscountValue] = useState<number | ''>('')
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [maxPromos, setMaxPromos] = useState<number | ''>('')
    const [promoAccess, setPromoAccess] = useState('public')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { id } = useParams<{ id: string }>()
    const isEditMode = Boolean(id)

    const navigate = useNavigate()

    // 🔹 Fetch PromoCode if edit mode
    useEffect(() => {
        const fetchPromo = async () => {
            if (!id) return
            setLoading(true)
            try {
                const response = await apiGetPromoCodeById({ id: id })
                console.log("Fetched promo code dataaaaaaa:", response.data.data)
                const promo: PromoCodeData = response.data.data

                setCodeTitle(promo.codeTitle)
                setDiscountType(promo.discountType)
                setDiscountValue(promo.discountValue)
                setStartDate(new Date(promo.startDate))
                setEndDate(new Date(promo.endDate))
                setMaxPromos(promo.maxPromos)
                setPromoAccess(promo.promoAccess)
            } catch (err) {
                setError('Failed to fetch promo code data.')
            } finally {
                setLoading(false)
            }
        }

        if (isEditMode) {
            fetchPromo()
        }
    }, [id, isEditMode])

    // 🔹 Submit
    const handleSubmit = async () => {
        if (!codeTitle.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Code Title is required
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        const payload: PromoCodeData = {
            id: id || undefined,
            codeTitle,
            discountType,
            discountValue: Number(discountValue),
            startDate: startDate ? startDate.toISOString() : '',
            endDate: endDate ? endDate.toISOString() : '',
            maxPromos: Number(maxPromos),
            promoAccess,
        }

        console.log("Payload to submit:", payload)

        try {
            setLoading(true)
            if (isEditMode && id) {
                await apiUpdatePromoCode(payload)
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Promo Code Updated Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await apiCreatePromoCode(payload)
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Promo Code Added Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            }

            navigate('/promoCodesList')
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save promo code.'}
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

    const discountOptions = [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' },
    ]

    const accessOptions = [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
    ]

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? 'Edit Promo Code' : 'Add New Promo Code'}
                    </h3>
                </div>
                <div className="pb-4">
                    {/* Code Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Promo Code Title</label>
                        <div className="mt-2">
                            <Input
                                placeholder="Enter Promo Code"
                                value={codeTitle}
                                onChange={(e) => setCodeTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="mb-4 flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Discount Type</label>
                            <div className="mt-2">
                                <Select
                                    placeholder="Please Select"
                                    value={discountOptions.find((opt) => opt.value === discountType)}
                                    onChange={(option) => setDiscountType(option.value)}
                                    options={discountOptions}
                                />
                            </div>
                        </div>

                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Discount Value</label>
                            <div className="mt-2">
                                <Input
                                    type="number"
                                    placeholder="Enter Value"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Start & End Dates */}
                    <div className="mb-4 flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Start Date</label>
                            <div className="mt-2">
                                <DatePicker
                                    placeholder="Pick a date"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                />
                            </div>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">End Date</label>
                            <div className="mt-2">
                                <DatePicker
                                    placeholder="Pick a date"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Max Promos */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Max Promos</label>
                        <div className="mt-2">
                            <Input
                                type="number"
                                placeholder="Enter Max Limit"
                                value={maxPromos}
                                onChange={(e) => setMaxPromos(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Promo Access */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Promo Access</label>
                        <div className="mt-2">
                            <Select
                                placeholder="Please Select"
                                value={accessOptions.find((opt) => opt.value === promoAccess)}
                                onChange={(option) => setPromoAccess(option.value)}
                                options={accessOptions}
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
                            {loading ? 'Saving...' : isEditMode ? 'Update Promo Code' : 'Add Promo Code'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default AddEditPromoCodes
