import React, { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import Skeleton from '@/components/ui/Skeleton'
import { Field, Form, Formik } from 'formik'
import {
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlineUser,
    HiOutlineGlobeAlt,
} from 'react-icons/hi'
import * as Yup from 'yup'
import { apiUpdateUser, apiGetUserById } from '@/services/UserAPIService'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUser } from '@/store/slices/auth/userSlice'
import { AxiosError } from 'axios'

export type ProfileFormModel = {
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
    country: string
}

const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .min(2, 'Min 2 characters')
        .max(50, 'Max 50 characters')
        .required('First name is required'),
    lastName: Yup.string()
        .min(2, 'Min 2 characters')
        .max(50, 'Max 50 characters')
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
    country: Yup.string()
        .min(2, 'Min 2 characters')
        .max(100, 'Max 100 characters')
        .transform((value) => {
            return value.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            })
        }),
    timeZone: Yup.string(),
})

// Skeleton Loader for Profile Form
const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">General</h3>
            <p className="text-gray-500 text-sm">
                Basic info, like your name and address that will displayed in
                public
            </p>
        </div>
        <div className="flex space-x-4">
            <div className="w-1/2">
                <Skeleton height={20} width={80} className="mb-2" />
                <Skeleton height={40} className="rounded-md" />
            </div>
            <div className="w-1/2">
                <Skeleton height={20} width={80} className="mb-2" />
                <Skeleton height={40} className="rounded-md" />
            </div>
        </div>
        <div>
            <Skeleton height={20} width={50} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div>
            <Skeleton height={20} width={70} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Preferences</h3>
            <p className="text-gray-500 text-sm">
                Your personalized preference displayed in your account
            </p>
        </div>
        <div>
            <Skeleton height={20} width={80} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div>
            <Skeleton height={20} width={80} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div className="flex gap-4 mt-8 pt-4">
            <Skeleton height={40} width={80} className="rounded-md" />
            <Skeleton height={40} width={120} className="rounded-md" />
        </div>
    </div>
)

const Profile = () => {
    const [countries, setCountries] = useState<
        { name: string; flag: string }[]
    >([])
    const [countriesLoading, setCountriesLoading] = useState(false)
    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [userDataLoading, setUserDataLoading] = useState(true)

    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)

    const [initialData, setInitialData] = useState<ProfileFormModel>({
        firstName: '',
        lastName: '',
        email: '',
        profileImage: null,
        country: '',
    })

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                try {
                    setUserDataLoading(true)
                    const response = await apiGetUserById(user.id)
                    const userData = response?.data?.data

                    if (userData) {
                        const formattedUserData: ProfileFormModel = {
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            profileImage: userData.profileImage
                                ? `/uploads/${userData.profileImage}`
                                : null,
                            country: userData.country
                                ? userData.country.charAt(0).toUpperCase() +
                                  userData.country.slice(1)
                                : '',
                        }
                        setInitialData(formattedUserData)
                        setAvatarImg(formattedUserData.profileImage)

                        dispatch(setUser(userData))
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error)
                    toast.push(
                        <Notification
                            title="Error"
                            type="danger"
                            duration={2500}
                        >
                            Failed to fetch user data
                        </Notification>
                    )
                } finally {
                    setUserDataLoading(false)
                }
            } else {
                setUserDataLoading(false)
            }
        }

        fetchUserData()
    }, [user?.id, dispatch])

    useEffect(() => {
        const fetchCountries = async () => {
            setCountriesLoading(true)
            try {
                // Fetch country codes from FlagCDN
                const res = await fetch('https://flagcdn.com/en/codes.json')
                const data = await res.json()

                // Map into your expected format using FlagCDN PNG flags
                const formatted = Object.entries(data).map(([code, name]) => ({
                    name: name as string,
                    flag: `https://flagcdn.com/w40/${code}.png`, // w40 = 40px wide flags
                }))

                setCountries(formatted)
            } catch (error) {
                console.error('Failed to fetch countries:', error)
                toast.push(
                    <Notification title="Error" type="danger" duration={2500}>
                        Failed to fetch countries
                    </Notification>
                )
            } finally {
                setCountriesLoading(false)
            }
        }

        fetchCountries()
    }, [])

    const beforeUpload = (files: FileList | null) => {
        let valid: string | boolean = true
        const allowedFileType = ['image/jpeg', 'image/png']
        const maxFileSize = 5 * 1024 * 1024 // 5MB

        if (files) {
            for (const file of files) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }

                if (file.size > maxFileSize) {
                    valid = 'File size must be less than 5MB!'
                }
            }
        }
        return valid
    }

    const onSetFormFile = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            setAvatarImg(URL.createObjectURL(file))
            setProfileImageFile(file)
        }
    }

    const onFormSubmit = async (
        values: ProfileFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('firstName', values.firstName)
            formData.append('lastName', values.lastName)
            formData.append('email', values.email)
            formData.append('country', values.country)
            // Don't send timeZone to backend as requested

            if (profileImageFile) {
                formData.append('profileImage', profileImageFile)
            } else if (avatarImg && avatarImg.startsWith('blob:')) {
                const existingFileName = user.profileImage
                if (existingFileName) {
                    formData.append('profileImage', existingFileName)
                }
            }

            const res = await apiUpdateUser(user.id, formData)

            const updatedUser = res?.data?.data
            if (updatedUser) {
                dispatch(setUser(updatedUser))
            }

            toast.push(
                <Notification title={'Profile updated'} type="success" />,
                { placement: 'top-center' }
            )
        } catch (error) {
            console.error('Submit error:', error)
            let message = 'An unknown error occurred'

            if (error instanceof AxiosError) {
                message =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Failed to update profile'
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

    if (userDataLoading || (countriesLoading && !countries.length)) {
        return (
            <FormContainer>
                <ProfileSkeleton />
            </FormContainer>
        )
    }

    return (
        <Formik
            enableReinitialize
            initialValues={initialData}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                onFormSubmit(values, setSubmitting)
            }}
        >
            {({
                values,
                touched,
                errors,
                isSubmitting,
                resetForm,
                setFieldValue,
            }) => {
                const selectedCountry = countries.find(
                    (c) => c.name === values.country
                )

                return (
                    <Form>
                        <FormContainer>
                            {/* General Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-2">
                                    General
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Basic info, like your name and address that
                                    will displayed in public
                                </p>
                            </div>

                            <div className="mb-4 flex space-x-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-2">
                                        First Name
                                    </label>
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="firstName"
                                        placeholder="First Name"
                                        component={Input}
                                        prefix={
                                            <HiOutlineUserCircle className="text-xl" />
                                        }
                                    />
                                    {errors.firstName && touched.firstName && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.firstName}
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-2">
                                        Last Name
                                    </label>
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="lastName"
                                        placeholder="Last Name"
                                        component={Input}
                                        prefix={
                                            <HiOutlineUserCircle className="text-xl" />
                                        }
                                    />
                                    {errors.lastName && touched.lastName && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                    prefix={
                                        <HiOutlineMail className="text-xl" />
                                    }
                                />
                                {errors.email && touched.email && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Profile Image
                                </label>
                                <Upload
                                    className="cursor-pointer"
                                    showList={false}
                                    uploadLimit={1}
                                    beforeUpload={beforeUpload}
                                    onChange={(files) => onSetFormFile(files)}
                                >
                                    <Avatar
                                        className="border-2 border-white dark:border-gray-800 shadow-lg"
                                        size={60}
                                        shape="circle"
                                        icon={<HiOutlineUser />}
                                        src={avatarImg || undefined}
                                    />
                                </Upload>
                                <div className="mt-2 text-xs text-gray-500">
                                    Click to upload a profile image (JPEG or
                                    PNG, max 5MB)
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="mt-8 mb-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    Preferences
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Your personalized preference displayed in
                                    your account
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Country
                                </label>
                                <Select
                                    placeholder="Select Country"
                                    isLoading={countriesLoading}
                                    value={
                                        selectedCountry
                                            ? {
                                                  value: selectedCountry.name,
                                                  label: selectedCountry.name,
                                                  flag: selectedCountry.flag,
                                              }
                                            : null
                                    }
                                    onChange={(option) =>
                                        setFieldValue(
                                            'country',
                                            option?.value || ''
                                        )
                                    }
                                    options={countries.map((c) => ({
                                        value: c.name,
                                        label: c.name,
                                        flag: c.flag,
                                    }))}
                                    styles={{
                                        valueContainer: (provided) => ({
                                            ...provided,
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginTop: 0,
                                            marginBottom: 0,
                                        }),
                                    }}
                                    components={{
                                        SingleValue: ({ data }) => (
                                            <span className="inline-flex items-center gap-1">
                                                {data.flag && (
                                                    <img
                                                        src={data.flag}
                                                        alt={data.label}
                                                        className="w-5 h-3 inline-block"
                                                    />
                                                )}
                                                {data.label}
                                            </span>
                                        ),
                                        Option: ({
                                            innerProps,
                                            data,
                                            isFocused,
                                            isSelected,
                                        }) => (
                                            <div
                                                {...innerProps}
                                                className={`flex items-center gap-2 p-2 ${
                                                    isFocused
                                                        ? 'bg-gray-100'
                                                        : ''
                                                } ${
                                                    isSelected
                                                        ? 'font-semibold'
                                                        : ''
                                                }`}
                                            >
                                                <img
                                                    src={data.flag}
                                                    alt={data.label}
                                                    className="w-5 h-3"
                                                />
                                                <span>{data.label}</span>
                                            </div>
                                        ),
                                    }}
                                />
                                {errors.country && touched.country && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.country}
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
                                        : 'Update'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default Profile
