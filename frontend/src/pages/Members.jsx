import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Edit2, Users as UsersIcon } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
            error(err.response?.data?.error || 'Failed to load members. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Members</h1>
                <Link to="/members/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Member
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="form-control w-full max-w-xs mb-6">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading members..." />
                ) : filteredMembers.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title={searchTerm ? "No members found" : "No members yet"}
                        message={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first gym member"}
                        action={!searchTerm && (
                            <Link to="/members/new" className="btn btn-primary">
                                <Plus size={18} />
                                Add First Member
                            </Link>
                        )}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Member ID</th>
                                    <th>Name</th>
                                    <th>Plan</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map(member => (
                                    <tr key={member.memberID}>
                                        <td><span className="badge badge-ghost">{member.memberID}</span></td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {member.profilePicture ? (
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 rounded-full">
                                                            <img
                                                                src={member.profilePicture}
                                                                alt={member.name}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className="avatar placeholder" style={{ display: 'none' }}>
                                                                <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                                                                    <span>{member.name?.charAt(0) || '?'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                                                            <span>{member.name?.charAt(0) || '?'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold">{member.name}</div>
                                                    <div className="text-sm opacity-50">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{member.plan?.name || member.subscription || 'N/A'}</td>
                                        <td>{member.contact1}</td>
                                        <td>
                                            <span className={`badge ${member.status === 'active' ? 'badge-success' : member.status === 'frozen' ? 'badge-info' : 'badge-ghost'}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/members/edit/${member.memberID}`} className="btn btn-ghost btn-sm">
                                                <Edit2 size={16} />
                                            </Link>
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

export default Members;
