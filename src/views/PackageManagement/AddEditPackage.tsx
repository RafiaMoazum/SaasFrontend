                                                                                                                                                                                                             
import React, { useState, useEffect } from 'react'
import { AdaptableCard } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { countries } from '../../constants/countries.json'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import type { ChangeEvent } from 'react'
import Button from '@/components/ui/Button'

import {
    apiCreatePackage,
    apiCreatePackageBadge,
    apiCreatePackageFeature,
    apiGetAllPackageBadges,
    apiGetAllPackageFeatures,
    apiGetPackagesById,
    apiUpdatePackage,
} from '@/services/PackageApiService'

interface RegionalPricing {
    country: string
    currency: string
    price: number
}

interface PackageData {
    id?: string
    packageName: string
    description: string
    packageType: string
    duration: string
    isActive: boolean
    badgeId?: string | null
    pricing: number
    isPromoApplicable: boolean
    AdOnDiscountValue?: number
    featuresOffered: string[]
    featuresNotOffered: string[]
    addOns: string[]
    regionalPricing: RegionalPricing[]
    countries: string[]
}

const AddEditPackage: React.FC = () => {
    const [packageName, setPackageName] = useState('')
    const [description, setDescription] = useState('')
    const [packageType, setPackageType] = useState('Monthly')
    const [duration, setDuration] = useState<number | ''>('')
    const [pricing, setPricing] = useState<number | ''>('')
    const [isActive, setIsActive] = useState(true)
    const [badgeId, setBadgeId] = useState('')
    const [isPromoApplicable, setIsPromoApplicable] = useState(false)
    const [adOnDiscountValue, setAdOnDiscountValue] = useState<number | ''>('')
    const [features, setFeatures] = useState<string[]>([])
    const [badges, setBadges] = useState<string[]>([])

    const [featuresOffered, setFeaturesOffered] = useState<string[]>([])
    const [featuresNotOffered, setFeaturesNotOffered] = useState<string[]>([])
    const [addOns, setAddOns] = useState<string[]>([])
    const [regionalPricing, setRegionalPricing] = useState<RegionalPricing[]>([])
    const [selectedCountries, setSelectedCountries] = useState<string[]>([])
    const countryList = countries.country || [];

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
     const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
    const [newFeature, setNewFeature] = useState("")
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)
        const [newBadge, setNewBadge] = useState("")
    

    const { packageId } = useParams<{ packageId: string }>()
    const isEditMode = Boolean(packageId)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchPackageData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Fetch features and badges in parallel
                const [fetchedFeatures, fetchedBadges] = await Promise.all([
                    apiGetAllPackageFeatures(),
                    apiGetAllPackageBadges(),
                ])

                //console.log("Fetched features:", fetchedFeatures.data.data)
                //console.log("Fetched badges:", fetchedBadges.data.data)

                setFeatures(fetchedFeatures.data.data)
                setBadges(fetchedBadges.data.data)
            } catch (err: any) {
                console.error(err)
                setError("Failed to fetch package features or badges")
            } finally {
                setLoading(false)
            }
        }

        fetchPackageData()
    }, [])


    // 🔹 Fetch package if edit mode
    useEffect(() => {
        const fetchPackageForEdit = async () => {
            if (!packageId) return
            setLoading(true)
            try {
                const response = await apiGetPackagesById({ id: packageId })
                const pkg: PackageData = response.data.data

                setPackageName(pkg.packageName)
                setDescription(pkg.description)
                setPackageType(pkg.packageType)
                setDuration(pkg.duration)
                setPricing(pkg.pricing)
                setIsActive(pkg.isActive)
                setBadgeId(pkg.badgeId || '');
                setIsPromoApplicable(pkg.isPromoApplicable)
                setAdOnDiscountValue(pkg.AdOnDiscountValue || '')
                setFeaturesOffered(pkg.featuresOffered || [])
                setFeaturesNotOffered(pkg.featuresNotOffered || [])
                setAddOns(pkg.addOns || [])
                setRegionalPricing(pkg.regionalPricing || [])
                setSelectedCountries(pkg.countries || [])
            } catch (err) {
                setError('Failed to fetch package data.')
            } finally {
                setLoading(false)
            }
        }

        if (isEditMode) {
            fetchPackageForEdit()
        }
    }, [packageId, isEditMode])

    // 🔹 Add regional pricing row
    const addRegionalPricing = () => {
        setRegionalPricing([...regionalPricing, { country: '', currency: '', price: 0 }])
    }

    // 🔹 Update regional pricing row
    const updateRegionalPricing = (index: number, field: keyof RegionalPricing, value: string | number) => {
        const updated = [...regionalPricing]
        updated[index][field] = value as never
        setRegionalPricing(updated)
    }

    // 🔹 Submit
    const handleSubmit = async () => {
        if (!packageName.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Package Name is required
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        const payload: PackageData = {
            id: packageId,
            packageName,
            description,
            packageType,
            duration: duration,
            pricing: Number(pricing),
            isActive,
            badgeId:badgeId || null,
            isPromoApplicable,
            AdOnDiscountValue: Number(adOnDiscountValue),
            featuresOffered,
            featuresNotOffered,
            addOns,
            regionalPricing,
            countries: selectedCountries,
        }

        console.log("Payload to submit:", payload)

        try {
            setLoading(true)
            if (isEditMode && packageId) {
                await apiUpdatePackage(payload)
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Package Updated Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await apiCreatePackage(payload)
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Package Added Successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
            }

            navigate('/packageList')
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save package.'}
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

    const packageOptions = [
        { value: "Monthly", label: "Monthly" },
        { value: "Yearly", label: "Yearly" },
        { value: "One-Time", label: "One-Time" }
    ];

    const onCheck = (value: boolean, e: ChangeEvent<HTMLInputElement>) => {
        console.log(value, e)
    }


    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? 'Edit Package' : 'Add New Package'}
                    </h3>
                </div>
                <div className="pb-4">
                    {/* Package Name */}
                    <div className="mb-4 flex space-x-4">
                        {/* Package Name Input */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Package Name</label>
                            <div className="mt-2">      
                            <Input
                                placeholder="Enter Package Name"
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                            />
                            </div>
                        </div>

                        {/* Package Type Dropdown */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Package Type</label>
                            <div className="mt-2">
                                <Select
                                    placeholder="Please Select"
                                    value={packageOptions.find((opt) => opt.value === packageType)}
                                    onChange={(option) => setPackageType(option.value)}
                                    options={packageOptions}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Description</label>
                        <div className="mt-2">
                        <Input
                            placeholder="Enter Description"
                            textArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4} // keep same rows as textarea
                        />
                        </div>
                    </div>

                    <div className="mb-4 flex space-x-4">
                        {/* Duration */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Duration (in months)</label>
                            <div className="mt-2">
                                <Input
                                    placeholder="Enter Duration"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium">Price</label>
                            <div className="mt-2">
                                <Input
                                    type="number"
                                    placeholder="Enter Price"
                                    value={pricing}
                                    onChange={(e) => setPricing(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features Row */}
                    <div className="mb-4 flex space-x-4">
                        {/* Features Offered */}
                        <div className="w-1/2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Features Offered</label>
                                <button
                                    type="button"
                                    onClick={() => setIsFeatureModalOpen(true)}
                                    className="px-3 py-1 text-sm rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                                >
                                    + Add Feature
                                </button>

                            </div>

                            <Select
                                isMulti
                                placeholder="Please Select"
                                value={features
                                    .filter((f) => featuresOffered.includes(f.id))
                                    .map((f) => ({
                                        value: f.id,
                                        label: f.feature,
                                    }))}
                                onChange={(selectedOptions) =>
                                    setFeaturesOffered(selectedOptions ? selectedOptions.map((opt) => opt.value) : [])
                                }
                                options={features.map((f) => ({
                                    value: f.id,
                                    label: f.feature,
                                }))}
                            />
                        </div>

                        {/* Features Not Offered */}
                        <div className="w-1/2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Features Not Offered</label>
                                <button
                                    type="button"
                                    onClick={() => setIsFeatureModalOpen(true)}
                                    className="px-3 py-1 text-sm rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                                >
                                    + Add Feature
                                </button>

                            </div>

                            <Select
                                isMulti
                                placeholder="Please Select"
                                value={features
                                    .filter((f) => featuresNotOffered.includes(f.id))
                                    .map((f) => ({
                                        value: f.id,
                                        label: f.feature,
                                    }))}
                                onChange={(selectedOptions) =>
                                    setFeaturesNotOffered(selectedOptions ? selectedOptions.map((opt) => opt.value) : [])
                                }
                                options={features.map((f) => ({
                                    value: f.id,
                                    label: f.feature,
                                }))}
                            />
                        </div>
                    </div>


                    <div className="w-full mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Select Badge</label>
                            <button
                                type="button"
                                onClick={() => setIsBadgeModalOpen(true)}
                                className="px-3 py-1 text-sm rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                            >
                                + Add Badge
                            </button>

                        </div>

                        <Select
                            placeholder="Please Select"
                            value={
                                badges
                                    .map((badge) => ({
                                        value: badge.id,
                                        label: badge.badgeText,
                                    }))
                                    .find((opt) => opt.value === badgeId) || null
                            }
                            onChange={(option) => setBadgeId(option?.value || "")}
                            options={badges.map((badge) => ({
                                value: badge.id,
                                label: badge.badgeText,
                            }))}
                        />
                    </div>


                    
                    {/* Countries Multi-select */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Available In Countries</label>
                        <div className="mt-2">
                            <Select
                                isMulti
                                placeholder="Please Select"
                                value={countries.country
                                    .filter((c) => selectedCountries.includes(c.countryCode))
                                    .map((c) => ({
                                        value: c.countryCode,
                                        label: `${c.countryName} (${c.currencyCode})`,
                                    }))}
                                onChange={(selectedOptions) =>
                                    setSelectedCountries(selectedOptions ? selectedOptions.map((opt) => opt.value) : [])
                                }
                                options={countries.country.map((c) => ({
                                    value: c.countryCode,
                                    label: `${c.countryName} (${c.currencyCode})`,
                                }))}
                            />
                        </div>
                    </div>

                    {/* Regional Pricing */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Regional Pricing</label>
                        {regionalPricing.map((rp, i) => (
                            <div key={i} className="flex space-x-2 mb-2">
                                <select
                                    value={rp.country}
                                    onChange={(e) => updateRegionalPricing(i, 'country', e.target.value)}
                                    className="px-2 py-1 border rounded"
                                >
                                    <option value="">Select Country</option>
                                    {countryList.map((c) => (
                                        <option key={c.countryCode} value={c.countryCode}>
                                            {c.countryName}
                                        </option>
                                    ))}

                                </select>

                                <input
                                    type="text"
                                    value={rp.currency}
                                    onChange={(e) => updateRegionalPricing(i, 'currency', e.target.value)}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Currency"
                                />

                                <input
                                    type="number"
                                    value={rp.price}
                                    onChange={(e) => updateRegionalPricing(i, 'price', Number(e.target.value))}
                                    className="px-2 py-1 border rounded"
                                    placeholder="Price"
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addRegionalPricing}
                            className="px-3 py-1 bg-gray-200 rounded"
                        >
                            + Add Region
                        </button>
                    </div>



                    {/* Active */}
                    <div className="mb-4 flex space-x-6 items-center">

                        {/* Is Active */}
                        <Checkbox
                            checked={isActive}
                            onChange={(value, e) => {
                                setIsActive(value)
                                onCheck(value, e)
                            }}
                        >
                            Is Active
                        </Checkbox>
                        {/* Promo Applicable */}
                        <Checkbox
                            checked={isPromoApplicable}
                            onChange={(value, e) => {
                                setIsPromoApplicable(value)
                                onCheck(value, e)
                            }}
                        >
                            Promo Applicable
                        </Checkbox>

                       
                    </div>


                    {/* Submit */}
                    <div className="mt-12">
                        <Button
                            className="px-6"   // wider horizontally
                            variant="solid"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Package' : 'Add Package'}
                        </Button>
                    </div>

                </div>
            </div>
            {isFeatureModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Add New Feature</h2>
                        <Input
                            placeholder="Enter Feature Name"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setIsFeatureModalOpen(false)
                                    setNewFeature("")
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={async () => {
                                    if (!newFeature.trim()) {
                                        toast.push(
                                            <Notification title="Missing Field" type="danger" duration={2500}>
                                                Feature name is required
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                        return
                                    }

                                    try {
                                        const payload = { feature: newFeature }
                                        const res = await apiCreatePackageFeature(payload)

                                        // Update features list immediately
                                        setFeatures((prev) => [...prev, res.data.data])

                                        toast.push(
                                            <Notification title="Successfully Added" type="success" duration={2500}>
                                                Feature Added Successfully
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                        setIsFeatureModalOpen(false)
                                        setNewFeature("")
                                    } catch (error) {
                                        toast.push(
                                            <Notification title="Error" type="danger" duration={2500}>
                                                Failed to add feature
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isBadgeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Add New Badge</h2>
                        <Input
                            placeholder="Enter Badge Name"
                            value={newBadge}
                            onChange={(e) => setNewBadge(e.target.value)}
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <Button
                                variant="plain"
                                onClick={() => {
                                    setIsBadgeModalOpen(false)
                                    setNewBadge("")
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={async () => {
                                    if (!newBadge.trim()) {
                                        toast.push(
                                            <Notification title="Missing Field" type="danger" duration={2500}>
                                                Badge name is required
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                        return
                                    }

                                    try {
                                        const payload = { badgeText: newBadge }
                                        const res = await apiCreatePackageBadge(payload)

                                        // Update badges list immediately
                                        setBadges((prev) => [...prev, res.data.data])

                                        toast.push(
                                            <Notification title="Successfully Added" type="success" duration={2500}>
                                                Badge Added Successfully
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                        setIsBadgeModalOpen(false)
                                        setNewBadge("")
                                    } catch (error) {
                                        toast.push(
                                            <Notification title="Error" type="danger" duration={2500}>
                                                Failed to add badge
                                            </Notification>,
                                            { placement: "top-center" }
                                        )
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}


        </AdaptableCard>
    )
}

export default AddEditPackage
