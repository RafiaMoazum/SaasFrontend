import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import Button from '@/components/ui/Button';
import { HiDownload, HiPlusCircle } from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass'
import { Link } from 'react-router-dom';
import AdaptableCard from '@/components/shared/AdaptableCard';
import { apiDeleteRole, apiGetAllRoles } from "@/services/RoleApiService";




interface Role {
    id: number;
    roleName: string;
    roleDescription: string;
}

interface RolesResponse {
    data: {
        roles: Role[];
    };
}

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const { textTheme } = useThemeClass()

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedRoles = (await apiGetAllRoles()) as RolesResponse;
                console.log("Fetched roles:", fetchedRoles.data.data);
                setRoles(fetchedRoles.data.data);
            } catch (err: any) {
                setError("Failed to fetch roles");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleEdit = (roleId: number): void => {
        navigate(`/editRole/${roleId}`);
    };

    const handleDelete = (id: number): void => {
        setSelectedRoleId(id);
        setShowModal(true); // Show the modal
    };

    const confirmDelete = async (): Promise<void> => {
        if (selectedRoleId === null) return;

        try {
            // Call the delete API
            await apiDeleteRole({ id: selectedRoleId });

            // Remove the deleted role from the state
            setRoles((prevRoles) =>
                prevRoles.filter((role) => role.id !== selectedRoleId)
            );

            console.log("Role deleted successfully:", selectedRoleId);
        } catch (error) {
            console.error("Failed to delete role:", error);
            alert("An error occurred while trying to delete the role.");
        } finally {
            setShowModal(false);
            setSelectedRoleId(null);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <AdaptableCard className="h-full " bodyClass="h-full">
            <div>
                <div className="bg-white rounded-lg">
                    <div className="flex flex-row justify-between items-center pb-4">
                        <h3 className="mb-4 lg:mb-0">Roles List</h3>

                        <Link
                            className="block lg:inline-block md:mb-0 mb-4"
                            to="/addRole"
                        >
                            <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                                Add Role
                            </Button>
                        </Link>

                    </div>
                    <table className="min-w-full table-auto text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-gray-600">Role Name</th>
                                <th className="px-6 py-3 text-gray-600">Description</th>
                                <th className="px-6 py-3 text-gray-600 text-right pr-10">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(roles) && roles.length > 0 ? (
                                roles.map((role) => (
                                    <tr key={role.id} className="border-t">
                                        <td className="px-6 py-3">{role.roleName}</td>
                                        <td className="px-6 py-3">{role.roleDescription}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex justify-end text-lg">
                                                <span
                                                    className={`cursor-pointer p-2 hover:${textTheme}`}
                                                    onClick={() => handleEdit(role.id)}
                                                >
                                                    <HiOutlinePencil />
                                                </span>
                                                <span
                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                    onClick={() => handleDelete(role.id)}
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
                                        No roles available
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

export default RoleManagement;
