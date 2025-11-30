import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Edit2, Trash2, Users as StaffIcon } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (err) {
            console.error("Failed to fetch staff", err);
            error(err.response?.data?.error || 'Failed to load staff. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/staff/${deleteId}`);
            success('Staff member deleted successfully');
            fetchStaff();
        } catch (err) {
            error(err.response?.data?.error || 'Failed to delete staff member');
        } finally {
            setDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const filteredStaff = staff.filter(member =>
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <ConfirmDialog
                isOpen={deleteConfirm}
                title="Delete Staff Member?"
                message="Are you sure you want to delete this staff member? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(false)}
                dangerConfirm
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Staff</h1>
                <Link to="/staff/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Staff
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="form-control w-full max-w-xs mb-6">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading staff..." />
                ) : filteredStaff.length === 0 ? (
                    <EmptyState
                        icon={StaffIcon}
                        title={searchTerm ? "No staff found" : "No staff members yet"}
                        message={searchTerm ? "Try adjusting your search criteria" : "Add your first staff member to get started"}
                        action={!searchTerm && (
                            <Link to="/staff/new" className="btn btn-primary">
                                <Plus size={18} />
                                Add First Staff Member
                            </Link>
                        )}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map(member => (
                                    <tr key={member._id}>
                                        <td className="font-bold">{member.name}</td>
                                        <td>
                                            <span className="badge badge-ghost">{member.role}</span>
                                        </td>
                                        <td>{member.contact}</td>
                                        <td>{member.email}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Link to={`/staff/edit/${member._id}`} className="btn btn-ghost btn-sm">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(member._id)}
                                                    className="btn btn-ghost btn-sm text-error"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;
