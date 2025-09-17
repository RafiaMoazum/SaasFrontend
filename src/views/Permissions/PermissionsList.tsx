import { useState, useMemo, useEffect } from "react"
import Table from "@/components/ui/Table"
import Pagination from "@/components/ui/Pagination"
import Select from "@/components/ui/Select"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import AdaptableCard from "@/components/shared/AdaptableCard"
import { Link, useNavigate } from "react-router-dom"
import { HiOutlinePencil, HiOutlineTrash, HiPlusCircle } from "react-icons/hi"
import Button from "@/components/ui/Button"
import { apiGetAllPermissions, apiDeletePermission } from "@/services/PermissionsApiService"

const { Tr, Th, Td, THead, TBody } = Table

const pageSizeOption = [
    { value: 10, label: "10 / page" },
    { value: 20, label: "20 / page" },
    { value: 30, label: "30 / page" },
    { value: 40, label: "40 / page" },
    { value: 50, label: "50 / page" },
]

const PermissionsList = () => {
    const [showModal, setShowModal] = useState(false)
    const [permissions, setPermissions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null)

    // pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const navigate = useNavigate()

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            { header: "Permission Name", accessorKey: "permissionName" },
            { header: "Description", accessorKey: "description" },
            {
                header: "Actions",
                id: "actions",
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
        ],
        []
    )

    const table = useReactTable({
        data: permissions,
        columns,
        state: { pagination }, // hook into your pagination state
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false, // client-side pagination
    })

    const onPaginationChange = (page: number) => {
        setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
    }

    const onSelectChange = (value = 0) => {
        setPagination((prev) => ({ ...prev, pageSize: Number(value) }))
    }

    useEffect(() => {
        const fetchPermissions = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await apiGetAllPermissions()
                setPermissions(res.data.data)
            } catch (err: any) {
                setError("Failed to fetch permissions")
            } finally {
                setLoading(false)
            }
        }
        fetchPermissions()
    }, [])

    const handleEdit = (id: string) => {
        navigate(`/editPermission/${id}`)
    }

    const handleDelete = (id: string) => {
        setSelectedPermissionId(id)
        setShowModal(true)
    }

    const confirmDelete = async () => {
        if (!selectedPermissionId) return
        try {
            await apiDeletePermission({ id: selectedPermissionId })
            setPermissions((prev) =>
                prev.filter((permission) => permission.id !== selectedPermissionId)
            )
        } catch (error) {
            alert("An error occurred while deleting the permission.")
        } finally {
            setShowModal(false)
            setSelectedPermissionId(null)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="flex flex-row justify-between items-center pb-4">
                    <h3 className="mb-4 lg:mb-0">Permissions List</h3>
                    <Link to="/addPermission">
                        <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                            Add Permission
                        </Button>
                    </Link>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        <Table>
                            <THead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <Tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <Th key={header.id} colSpan={header.colSpan}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </Th>
                                        ))}
                                    </Tr>
                                ))}
                            </THead>
                            <TBody>
                                {table.getRowModel().rows.map((row) => (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>

                        <div className="flex items-center justify-between mt-4">
                            <Pagination
                                pageSize={pagination.pageSize}
                                currentPage={pagination.pageIndex + 1}
                                total={permissions.length}
                                onChange={onPaginationChange}
                                nextButtonClassName={
                                    pagination.pageIndex + 1 >=
                                        Math.ceil(permissions.length / pagination.pageSize)
                                        ? "text-red-600"
                                        : ""
                                }
                            />
                            <div style={{ minWidth: 130 }}>
                                <Select
                                    size="sm"
                                    isSearchable={false}
                                    value={pageSizeOption.filter(
                                        (option) => option.value === pagination.pageSize
                                    )}
                                    options={pageSizeOption}
                                    onChange={(option) => onSelectChange(option?.value)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <p className="mb-6">Do you want to delete this permission?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdaptableCard>
    )
}

export default PermissionsList
