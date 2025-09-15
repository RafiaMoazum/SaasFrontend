import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import { AdaptableCard } from '@/components/shared';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCreatePermission, apiGetPermissionById, apiUpdatePermission } from '@/services/PermissionsApiService';

const AddPermissions: React.FC = () => {
    const [permissionName, setPermissionName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    console.log("id-->", id)
    const isEditMode = Boolean(id);

    // console.log('isEditMode:', isEditMode, 'id:', id.id);

    // Fetch permission details when editing
    useEffect(() => {
        if (isEditMode && id) {
            const fetchPermission = async () => {
                try {
                    const response = await apiGetPermissionById({ id: id });
                    console.log('Fetched permission details:', response.data.data);
                    setPermissionName(response.data.data.permissionName);
                    setDescription(response.data.data.description);
                } catch (error) {
                    console.error('Failed to fetch permission:', error);
                    toast.push(
                        <Notification title="Error" type="danger" duration={2500}>
                            Failed to load permission details.
                        </Notification>,
                        { placement: 'top-center' }
                    );
                }
            };
            fetchPermission();
        }
    }, [isEditMode, id]);

    const handleSubmit = async () => {
        if (!permissionName.trim()) {
            toast.push(
                <Notification title="Missing Field" type="danger" duration={2500}>
                    Permission Name is Required
                </Notification>,
                { placement: 'top-center' }
            );
            return;
        }

        const payload = { id: id, permissionName, description };

        try {
            setLoading(true);
            let response;

            if (isEditMode && id) {
                // Update API
                response = await apiUpdatePermission(payload);
                console.log('Update response:', response);
                toast.push(
                    <Notification title="Successfully Updated" type="success" duration={2500}>
                        Permission updated successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
            } else {
                // Create API
                response = await apiCreatePermission(payload);
                toast.push(
                    <Notification title="Successfully Added" type="success" duration={2500}>
                        Permission added successfully
                    </Notification>,
                    { placement: 'top-center' }
                );
            }

            console.log('Response:', response.data);
            navigate('/permissionsList');
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.push(
                    <Notification title="Error Occurred" type="danger" duration={2500}>
                        {error.response?.data?.error || 'Failed to save permission.'}
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
                    <h3 className="mb-4 lg:mb-0">
                        {isEditMode ? 'Edit Permission' : 'Add New Permission'}
                    </h3>
                </div>
                <div className="pb-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Permission Name</label>
                        <input
                            type="text"
                            value={permissionName}
                            onChange={(e) => setPermissionName(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Permission Name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Permission Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Permission Description"
                            rows={7}
                        />
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

export default AddPermissions;
//             