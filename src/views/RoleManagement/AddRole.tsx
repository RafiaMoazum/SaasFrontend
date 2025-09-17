import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import { AdaptableCard } from '@/components/shared';
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { AxiosError } from 'axios';
import { useNavigate,useParams} from 'react-router-dom';
import { apiGetAllPermissions } from '@/services/PermissionsApiService';
import { apiCreateRole, apiGetRolesById, apiUpdateRole } from '@/services/RoleApiService';




// Define the structure for each permission
interface Permission {
    name: string;
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
    viewId: string | null;
    editId: string | null;
    createId: string | null;
    deleteId: string | null;
}


const AddRole: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roleName, setRoleName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [roleDescription, setRoleDescription] = useState<string>('');
    const { roleId } = useParams<{ roleId: string }>();
    const isEditMode = Boolean(roleId);  // check if edit mode


    const navigate = useNavigate();
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await apiGetAllPermissions();
                const rawPermissions = response.data.data;

                const grouped: Record<string, Permission> = {};
                rawPermissions.forEach((p: any) => {
                    const [action, entity] = p.permissionName.split("_");

                    if (!grouped[entity]) {
                        grouped[entity] = {
                            name: entity,
                            view: false,
                            edit: false,
                            create: false,
                            delete: false,
                            viewId: null,
                            editId: null,
                            createId: null,
                            deleteId: null,
                        };
                    }

                    if (action === "view") grouped[entity].viewId = p.id;
                    if (action === "edit" || action === "update") grouped[entity].editId = p.id;
                    if (action === "create") grouped[entity].createId = p.id;
                    if (action === "delete") grouped[entity].deleteId = p.id;
                });

                setPermissions(Object.values(grouped));
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };

        const fetchRoleDetails = async () => {
            if (isEditMode && roleId) {
                try {
                    const response = await apiGetRolesById({ id:roleId });
                    const roleData = response.data.data;

                    setRoleName(roleData.roleName);
                    setRoleDescription(roleData.roleDescription);

                    // Mark role's permissions as checked
                    setPermissions((prev) =>
                        prev.map((perm) => ({
                            ...perm,
                            view: roleData.permissions.some((p: any) => p.id === perm.viewId),
                            edit: roleData.permissions.some((p: any) => p.id === perm.editId),
                            create: roleData.permissions.some((p: any) => p.id === perm.createId),
                            delete: roleData.permissions.some((p: any) => p.id === perm.deleteId),
                        }))
                    );
                } catch (error) {
                    console.error("Error fetching role details:", error);
                }
            }
        };

        fetchPermissions().then(fetchRoleDetails);
    }, [isEditMode, roleId]);



    // Handle checkbox change
    const handleCheckboxChange = (index: number, field: keyof Permission) => {
        const updatedPermissions = [...permissions];
        updatedPermissions[index] = {
            ...updatedPermissions[index],
            [field]: !updatedPermissions[index][field], // Safely toggle the value
        };
        setPermissions(updatedPermissions);
    };


    const handleSelectAll = (field: keyof Permission) => {
        const allChecked = permissions.every((permission) => permission[field]);
        const updatedPermissions = permissions.map((permission) => ({
            ...permission,
            [field]: !allChecked,
        }));
        setPermissions(updatedPermissions);
    };

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

        const permissionIds: string[] = [];
        permissions.forEach((p) => {
            if (p.view && p.viewId) permissionIds.push(p.viewId);
            if (p.edit && p.editId) permissionIds.push(p.editId);
            if (p.create && p.createId) permissionIds.push(p.createId);
            if (p.delete && p.deleteId) permissionIds.push(p.deleteId);
        });

        console.log("roleIds-->", roleId);
        const payload = {
            roleId, // include when updating
            roleName,
            roleDescription,
            permissionIds,
        };

        try {
            setLoading(true);
            let response;
            if (isEditMode) {
                response = await apiUpdateRole(payload);
            } else {
                response = await apiCreateRole(payload);
            }

            if (response) {
                toast.push(
                    <Notification title="Success" type="success" duration={2500}>
                        {isEditMode ? "Role Updated Successfully" : "Role Added Successfully"}
                    </Notification>,
                    { placement: 'top-center' }
                );
                navigate("/roleManagement");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || (isEditMode ? "Failed to update role." : "Failed to add role.")}
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
        <AdaptableCard className="h-full " bodyClass="h-full">
            <div className="bg-white rounded-lg">
                <div className="pb-8">
                    <h3 className="mb-4 lg:mb-0">{isEditMode ? "Edit Role" : "Add New Role"}</h3>
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className='text-left'>
                                <tr>
                                    <th className="p-2">Permission</th>
                                    <th className="p-2">View</th>
                                    <th className="p-2">Edit</th>
                                    <th className="p-2">Create</th>
                                    <th className="p-2">Delete</th>
                                </tr>
                                <tr>
                                    <th className="p-2"></th> {/* Empty space for the Permission column */}
                                    {(["view", "edit", "create", "delete"] as (keyof Permission)[]).map((field) => (
                                        <th key={field} className="py-2 px-5">

                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleSelectAll(field)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {permissions.map((permission, index) => (
                                    <tr key={index}>
                                        <td className="p-2">
                                            {permission.name.charAt(0).toUpperCase() + permission.name.slice(1)}
                                        </td>
                                        {(["view", "edit", "create", "delete"] as (keyof Permission)[]).map((field) => (
                                            <td key={field} className="py-2 px-5">
                                                <input
                                                    type="checkbox"
                                                    checked={permission[field] as boolean}
                                                    onChange={() => handleCheckboxChange(index, field)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* {message && <div className="mt-4 text-red-500">{message}</div>} */}

                    <div className="mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex items-center px-4 py-2 text-white bg-customgreen-900 rounded-lg hover:bg-customgreen-800 focus:outline-none ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <span>{loading ? "Saving..." : "Save"}</span>
                            <FaCheck className="ml-2 text-white" />
                        </button>


                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
                        >
                            <span>{loading ? "Saving..." : isEditMode ? "Update" : "Save"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdaptableCard>
    );
};

export default AddRole;
