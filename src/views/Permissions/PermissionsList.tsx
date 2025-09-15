import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import Button from '@/components/ui/Button';
import { HiDownload, HiPlusCircle } from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass'
import { Link } from 'react-router-dom';
import AdaptableCard from '@/components/shared/AdaptableCard';
import { apiDeletePermission, apiGetAllPermissions } from "@/services/PermissionsApiService";




interface Permission {
    id: number;
    permissionName: string;
    description: string;
}

interface PermissionsResponse {
    data: {
        permissions: Permission[];
    };
}

const PermissionsList: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null);
    const { textTheme } = useThemeClass()

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPermissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedPermissions = (await apiGetAllPermissions()) as PermissionsResponse;
                console.log("fetchedPermissions-->", fetchedPermissions.data.data)
                setPermissions(fetchedPermissions.data.data);
            } catch (err: any) {
                setError("Failed to fetch permissions");
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const handleEdit = (permissionId: number): void => {
        navigate(`/editPermission/${permissionId}`);
    };

    const handleDelete = (id: number): void => {
        console.log("Delete permission with ID:", id);
        setSelectedPermissionId(id);
        setShowModal(true); // Show the modal
    };

    const confirmDelete = async (): Promise<void> => {
        if (selectedPermissionId === null) return;

        try {
            // Call the delete API
            await apiDeletePermission({id: selectedPermissionId});

            // Remove the deleted permission from the state
            setPermissions((prevPermissions) =>
                prevPermissions.filter((permission) => permission.id !== selectedPermissionId)
            );

            console.log("Permission deleted successfully:", selectedPermissionId);
        } catch (error) {
            console.error("Failed to delete permission:", error);
            alert("An error occurred while trying to delete the permission.");
        } finally {
            setShowModal(false);
            setSelectedPermissionId(null);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <AdaptableCard className="h-full " bodyClass="h-full">
            <div>
                <div className="bg-white rounded-lg">
                    <div className="flex flex-row justify-between items-center pb-4">
                        <h3 className="mb-4 lg:mb-0">Permissions List</h3>

                        <Link
                            className="block lg:inline-block md:mb-0 mb-4"
                            to="/addPermission"
                        >
                            <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                                Add Permission
                            </Button>
                        </Link>

                    </div>
                    <table className="min-w-full table-auto text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-gray-600">Permission</th>
                                <th className="px-6 py-3 text-gray-600">Description</th>
                                <th className="px-6 py-3 text-gray-600 text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(permissions) && permissions.length > 0 ? (
                                permissions.map((permission) => (
                                    <tr key={permission.id} className="border-t">
                                        <td className="px-6 py-3">{permission.permissionName}</td>
                                        <td className="px-6 py-3">{permission.description}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex justify-end text-lg">
                                                <span
                                                    className={`cursor-pointer p-2 hover:${textTheme}`}
                                                    onClick={() => handleEdit(permission.id)}
                                                >
                                                    <HiOutlinePencil />
                                                </span>
                                                <span
                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                    onClick={() => handleDelete(permission.id)}
                                                >
                                                    <HiOutlineTrash />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center px-6 py-3">
                                        No Permissions available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <p className="mb-6">Do you want to delete this role?</p>
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
    );
};

export default PermissionsList;
