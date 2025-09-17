import { useState, useMemo, useEffect } from 'react'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import AdaptableCard from '@/components/shared/AdaptableCard'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlinePencil, HiOutlineTrash, HiPlusCircle } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import { apiGetAllUsers, apiDeleteUser } from '@/services/UserAPIService'
import Avatar from '@/components/ui/Avatar'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const { Tr, Th, Td, THead, TBody } = Table

const defaultAvatars = [
    '/img/avatars/thumb-1.jpg',
    '/img/avatars/thumb-2.jpg',
    '/img/avatars/thumb-3.jpg',
    '/img/avatars/thumb-4.jpg',
    '/img/avatars/thumb-5.jpg',
    '/img/avatars/thumb-6.jpg',
    '/img/avatars/thumb-7.jpg',
    '/img/avatars/thumb-8.jpg',
    '/img/avatars/thumb-9.jpg',
    '/img/avatars/thumb-10.jpg',
    '/img/avatars/thumb-11.jpg',
    '/img/avatars/thumb-12.jpg',
    '/img/avatars/thumb-13.jpg',
    '/img/avatars/thumb-14.jpg',
    '/img/avatars/thumb-15.jpg',
    '/img/avatars/thumb-16.jpg',
]

const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]

const UserList = () => {
    const [showModal, setShowModal] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [countries, setCountries] = useState<{ name: string; code: string; flag: string }[]>([])
    const [countriesLoading, setCountriesLoading] = useState(false)
    const navigate = useNavigate()

    const AVATAR_SIZE = 40

    
    useEffect(() => {
        const fetchCountries = async () => {
            setCountriesLoading(true)
            try {
                const res = await fetch('https://flagcdn.com/en/codes.json')
                const codes = await res.json()
                const formatted = Object.entries(codes).map(([code, name]) => ({
                    name,
                    code,
                    flag: `https://flagcdn.com/w40/${code}.png`, // small flag image
                }))
                setCountries(formatted)
            } catch (err) {
                console.error('Failed to fetch FlagCDN codes:', err)
            } finally {
                setCountriesLoading(false)
            }
        }
        fetchCountries()
    }, [])

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'Name',
            id: 'name',
            cell: ({ row }) => {
                const { firstName, lastName, profileImage } = row.original
                return (
                    <div className="flex items-center gap-1">
                        <Avatar size={AVATAR_SIZE} src={profileImage} shape="circle" />
                        <span className="font-medium">
                            {firstName || 'N/A'} {lastName || ''}
                        </span>
                    </div>
                )
            },
        },
        {
            header: 'Email',
            accessorFn: (row) => row.email || 'N/A',
        },
        {
            header: 'Role',
            accessorFn: (row) => {
                const role = row.role?.roleName || 'N/A'
                return role.charAt(0).toUpperCase() + role.slice(1)
            },
        },
        {
            header: 'Country',
            accessorFn: (row) => row.country || 'N/A',
            cell: ({ row }) => {
                if (countriesLoading) return <span>Loading...</span>
                const country = countries.find(c => 
                    c.name.toLowerCase() === row.original.country?.toLowerCase()
                )
                return (
                    <span className="inline-flex items-center gap-1">
                        {country?.flag && (
                            <img
                                src={country.flag}
                                alt={row.original.country}
                                className="w-5 h-3 inline-block"
                            />
                        )}
                        {row.original.country || 'N/A'}
                    </span>
                )
            },
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-start text-lg">
                    <span
                        className="cursor-pointer p-2 hover:text-blue-500"
                        onClick={() => handleEdit(row.original.id)}
                    >
                        <HiOutlinePencil />
                    </span>
                    <span
                        className="cursor-pointer p-2 hover:text-red-500"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <HiOutlineTrash />
                    </span>
                </div>
            ),
        },
    ], [countries, countriesLoading])

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const res = await apiGetAllUsers()
                const usersWithAvatars = res.data.data.map((user: any) => ({
                    ...user,
                    profileImage: user.profileImage
                        ? `http://localhost:3000/uploads/${user.profileImage}`
                        : defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
                }))
                setUsers(usersWithAvatars)
            } catch (err) {
                setError('Failed to fetch users')
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleEdit = (id: string) => navigate(`/editUser?id=${id}`)
    const handleDelete = (id: string) => {
        setSelectedUserId(id)
        setShowModal(true)
    }

    const confirmDelete = async () => {
        if (!selectedUserId) return
        try {
            const res = await apiDeleteUser(selectedUserId)
            setUsers(prev => prev.filter(u => u.id !== selectedUserId))
            toast.push(<Notification title="Success" type="success">
                {res.data?.message || 'User deleted successfully.'}
            </Notification>)
        } catch (err: any) {
            toast.push(<Notification title="Error" type="danger">
                {err.response?.data?.message || 'Failed to delete user. Please try again.'}
            </Notification>)
        } finally {
            setShowModal(false)
            setSelectedUserId(null)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="flex flex-row justify-between items-center pb-4">
                    <h3 className="mb-4 lg:mb-0">Users List</h3>
                    <Link to="/addUser">
                        <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                            Add User
                        </Button>
                    </Link>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Table>
                    <THead>
                        {table.getHeaderGroups().map(hg => (
                            <Tr key={hg.id}>
                                {hg.headers.map(header => (
                                    <Th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    {loading ? (
                        <TableRowSkeleton avatarInColumns={[0]} columns={columns.length} rows={5} avatarProps={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
                    ) : (
                        <TBody>
                            {table.getRowModel().rows.map(row => (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <Td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Td>
                                    ))}
                                </Tr>
                            ))}
                        </TBody>
                    )}
                </Table>
                {!loading && !error && (
                    <div className="flex items-center justify-between mt-4">
                        <Pagination
                            pageSize={table.getState().pagination.pageSize}
                            currentPage={table.getState().pagination.pageIndex + 1}
                            total={users.length}
                            onChange={page => table.setPageIndex(page - 1)}
                        />
                        <div style={{ minWidth: 130 }}>
                            <Select
                                size="sm"
                                isSearchable={false}
                                value={pageSizeOption.find(opt => opt.value === table.getState().pagination.pageSize)}
                                options={pageSizeOption}
                                onChange={opt => table.setPageSize(Number(opt?.value))}
                            />
                        </div>
                    </div>
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <p className="mb-6">Do you want to delete this user?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdaptableCard>
    )
}

export default UserList
