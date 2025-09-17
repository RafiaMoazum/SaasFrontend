import React, { useState, useEffect } from 'react'
import { AdaptableCard } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Upload from '@/components/ui/Upload'
import Avatar from '@/components/ui/Avatar'
import { HiOutlinePlus } from 'react-icons/hi'
import {
    apiAddUser,
    apiUpdateUser,
    apiGetUserById,
} from '@/services/UserAPIService'
import { apiGetAllRoles } from '@/services/RoleApiService'
import { User } from '@/@types/user'
import { Role } from '@/@types/role'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .min(2, 'Min 2 characters')
        .max(50, 'Max 50 characters'),
    lastName: Yup.string()
        .min(2, 'Min 2 characters')
        .max(50, 'Max 50 characters'),
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
    roleId: Yup.string().uuid('Invalid role').required('Role is required'),
})

interface FormValues {
    firstName: string
    lastName: string
    email: string
    country: string
    roleId: string
    profileImage: File | null
    isEditMode: boolean
}

// Skeleton Loader for Form
const FormSkeleton = () => (
    <div className="space-y-6">
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
        <div>
            <Skeleton height={20} width={40} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div>
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={40} className="rounded-md" />
        </div>
        <div className="flex gap-4 mt-8 pt-4">
            <Skeleton height={40} width={80} className="rounded-md" />
            <Skeleton height={40} width={120} className="rounded-md" />
        </div>
    </div>
)

const AddEditUser: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
    const [initialFormValues, setInitialFormValues] = useState<FormValues>({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        roleId: '',
        profileImage: null,
        isEditMode: false,
    })
    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [countries, setCountries] = useState<
        { name: string; flag: string }[]
    >([])
    const [countriesLoading, setCountriesLoading] = useState(false)

    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const isEditMode = Boolean(id)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiGetAllRoles()
                setRoles(response?.data?.data || [])
            } catch (error) {
                console.error('Failed to fetch roles:', error)
                toast.push(
                    <Notification title="Error" type="danger" duration={2500}>
                        Failed to fetch roles
                    </Notification>
                )
            }
        }
        fetchRoles()
    }, [])

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return
            setFormLoading(true)
            try {
                const response = await apiGetUserById(id)
                const user: User = response?.data?.data
                if (!user) throw new Error('Invalid user data')

                setInitialFormValues({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    country: user.country
                        ? user.country.charAt(0).toUpperCase() +
                          user.country.slice(1)
                        : '',
                    roleId: user.roleId || '',
                    profileImage: null,
                    isEditMode: true,
                })
                setAvatarImg(
                    user.profileImage
                        ? getFullImageUrl(user.profileImage)
                        : null
                )
            } catch (error) {
                console.error('Failed to fetch user:', error)
                toast.push(
                    <Notification title="Error" type="danger" duration={2500}>
                        Failed to fetch user data
                    </Notification>
                )
                navigate('/userManagement')
            } finally {
                setFormLoading(false)
            }
        }

        if (isEditMode) fetchUser()
    }, [id, isEditMode, navigate])

    const getFullImageUrl = (filename: string | null) => {
        if (!filename) return null
        return `/uploads/${filename}`
    }

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

    const handleSubmit = async (values: FormValues) => {
        const formData = new FormData()
        formData.append('firstName', values.firstName)
        formData.append('lastName', values.lastName)
        formData.append('email', values.email)
        formData.append('country', values.country)
        formData.append('roleId', values.roleId)

        if (values.profileImage) {
            // user uploaded a new file
            formData.append('profileImage', values.profileImage)
        } else if (isEditMode && avatarImg) {
            // user did NOT upload new file, keep existing filename
            const existingFileName = avatarImg.replace('/uploads/', '')
            formData.append('profileImage', existingFileName)
        }

        try {
            setLoading(true)
            let res

            if (isEditMode && id) {
                res = await apiUpdateUser(id, formData)
            } else {
                res = await apiAddUser(formData)
            }

            toast.push(
                <Notification title="Success" type="success" duration={2500}>
                    {res?.data?.message ||
                        (isEditMode ? 'User updated' : 'User created')}
                </Notification>
            )
            setTimeout(() => navigate('/userManagement'), 1000)
        } catch (error) {
            console.error('Submit error:', error)
            let message = 'An unknown error occurred'
            if (error instanceof AxiosError) {
                message =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    `Failed to ${isEditMode ? 'update' : 'create'} user`
            }
            toast.push(
                <Notification title="Error" type="danger" duration={4000}>
                    {message}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

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

    const onFileUpload = (
        files: File[],
        setFieldValue: (field: string, value: any) => void
    ) => {
        if (files.length > 0) {
            const file = files[0]
            setAvatarImg(URL.createObjectURL(file))
            setFieldValue('profileImage', file)
        }
    }

    if (formLoading) {
        return (
            <AdaptableCard className="h-full" bodyClass="h-full">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h3>
                </div>
                <FormSkeleton />
            </AdaptableCard>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="pb-8">
                <h3 className="mb-4 lg:mb-0">
                    {isEditMode ? 'Edit User' : 'Add New User'}
                </h3>
            </div>
            <Formik
                enableReinitialize
                initialValues={initialFormValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, values, errors, touched }) => (
                    <Form>
                        <div className="mb-4 flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-2">
                                    First Name
                                </label>
                                <Field
                                    name="firstName"
                                    placeholder="Enter First Name"
                                    component={Input}
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
                                    name="lastName"
                                    placeholder="Enter Last Name"
                                    component={Input}
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
                                name="email"
                                placeholder="Enter Email"
                                component={Input}
                            />
                            {errors.email && touched.email && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Country
                            </label>
                            <Select
                                placeholder="Select Country"
                                isLoading={countriesLoading}
                                value={
                                    countries.find(
                                        (c) => c.name === values.country
                                    )
                                        ? {
                                              value: values.country,
                                              label: values.country,
                                              flag: countries.find(
                                                  (c) =>
                                                      c.name === values.country
                                              )?.flag,
                                          }
                                        : null
                                }
                                onChange={(option) =>
                                    setFieldValue('country', option?.value)
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
                                                isFocused ? 'bg-gray-100' : ''
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

                        {/* Role */}
                        <div className="mb-4">
                            {' '}
                            <label className="block text-sm font-medium mb-2">
                                {' '}
                                Role{' '}
                            </label>{' '}
                            <Select
                                placeholder="Select Role"
                                value={
                                    roles.find(
                                        (role) => role.id === values.roleId
                                    )
                                        ? {
                                              value: values.roleId,
                                              label: roles.find(
                                                  (role) =>
                                                      role.id === values.roleId
                                              )?.roleName
                                                  ? roles
                                                        .find(
                                                            (role) =>
                                                                role.id ===
                                                                values.roleId
                                                        )!
                                                        .roleName.charAt(0)
                                                        .toUpperCase() +
                                                    roles
                                                        .find(
                                                            (role) =>
                                                                role.id ===
                                                                values.roleId
                                                        )!
                                                        .roleName.slice(1)
                                                  : '',
                                          }
                                        : null
                                }
                                onChange={(option) => {
                                    setFieldValue('roleId', option?.value || '')
                                }}
                                options={roles.map((role) => ({
                                    value: role.id,
                                    label:
                                        role.roleName.charAt(0).toUpperCase() +
                                        role.roleName.slice(1),
                                }))}
                                isLoading={roles.length === 0}
                            />{' '}
                            {errors.roleId && touched.roleId && (
                                <div className="text-red-500 text-sm mt-1">
                                    {' '}
                                    {errors.roleId}{' '}
                                </div>
                            )}{' '}
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
                                onChange={(files) =>
                                    onFileUpload(files, setFieldValue)
                                }
                            >
                                <Avatar
                                    size={80}
                                    src={avatarImg || undefined}
                                    icon={
                                        !avatarImg ? (
                                            <HiOutlinePlus />
                                        ) : undefined
                                    }
                                />
                            </Upload>
                            <div className="mt-2 text-xs text-gray-500">
                                Click to upload a profile image (JPEG or PNG,
                                max 5MB)
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t flex gap-4">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={() => navigate('/userManagement')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={loading}
                            >
                                {isEditMode ? 'Update User' : 'Create User'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default AddEditUser
