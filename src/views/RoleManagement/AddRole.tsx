import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import { AdaptableCard } from '@/components/shared';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetAllPermissions } from '@/services/PermissionsApiService';
import { apiCreateRole, apiGetRolesById, apiUpdateRole } from '@/services/RoleApiService'; // <-- update API added

interface Permission {
    id: string;
    permissionName: string;
    description: string;
}
interface RoleData {
    roleName: string;
    roleDescription: string;
    permissions?: Permission[];
}

const AddRole: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [roleName, setRoleName] = useState<string>('');
    const [roleDescription, setRoleDescription] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { roleId } = useParams<{ roleId: string }>();
    const isEditMode = Boolean(roleId);  // check if edit mode

    const navigate = useNavigate();

    // 🔹 Fetch all permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await apiGetAllPermissions();
                setPermissions(response.data.data);
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        };
        fetchPermissions();
    }, []);

    // 🔹 Fetch role data if in edit mode
    useEffect(() => {
        const fetchRoleForEdit = async () => {
            if (!roleId) return;
            setLoading(true);
            try {
                const response = await apiGetRolesById({ id: roleId });
                console.log("roleForEdit=", response.data.data)
                const role = response.data.data;

                setRoleName(role.roleName);
                setRoleDescription(role.roleDescription);
                // pre-select permissions by mapping their ids
                setSelectedPermissions(role.permissions.map((p: Permission) => p.id));
            } catch (err) {
                setError("Failed to fetch role data.");
            } finally {
                setLoading(false);
            }
        };

        if (isEditMode) {
            fetchRoleForEdit();
        }
    }, [roleId, isEditMode]);

    // 🔹 Toggle individual permission
    const handleCheckboxChange = (id: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((permId) => permId !== id) : [...prev, id]
        );
    };

    // 🔹 Submit handler
    const handleSubmit = async () => {
        if (!roleName.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Role Name is Required
                </Notification>,
                { placement: 'top-center' }
            );
            return;
        }

        const payload = {
            id: roleId, 
            roleName,
            roleDescription,
            permissionIds: selectedPermissions,
        };

        try {
            setLoading(true);
            if (isEditMode && roleId) {
                // 🔹 Update role API
               const response = await apiUpdateRole(payload);

                console.log("response==", response);
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Role Updated Successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
            } else {
                // 🔹 Create role API
                const response = await apiCreateRole(payload);
                console.log("response==", response);
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Role Added Successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
            }

            navigate('/roleManagement');
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save role.'}
                    </Notification>,
                    { placement: 'top-center' }
                );
            } else {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        An unknown error occurred.
                    </Notification>,
                    { placement: 'top-center' }
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? "Edit Role" : "Add New Role"}
                    </h3>
                </div>
                <div className="pb-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Role Name</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Role Name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium">Role Description</label>
                        <textarea
                            value={roleDescription}
                            onChange={(e) => setRoleDescription(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Role Description"
                            rows={4}
                        />
                    </div>

                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-4">
                        {permissions.map((permission) => (
                            <label
                                key={permission.id}
                                className="flex items-center space-x-2 border p-2 rounded-md"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => handleCheckboxChange(permission.id)}
                                />
                                <span>{permission.permissionName}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
                        >
                            <span>{loading ? 'Saving...' : isEditMode ? 'Update' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdaptableCard>
    );
};

export default AddRole;
