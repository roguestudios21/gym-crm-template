import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Edit2 } from 'lucide-react';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            // Assuming backend has GET /api/staff (I need to verify if I implemented GET / in staff.js)
            // Checking staff.js content from memory/previous steps... 
            // staff.js had /create, /update/:id, /request-leave/:id, /availability/:id.
            // It did NOT have a GET / list route!
            // I need to add GET / to staff.js first.
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (error) {
            console.error("Failed to fetch staff", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Staff</h1>
                <Link to="/staff/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Staff
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Contact</th>
                                <th>Leave Bucket</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : staff.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No staff found</td></tr>
                            ) : (
                                staff.map(s => (
                                    <tr key={s._id}>
                                        <td className="font-bold">{s.name}</td>
                                        <td>{s.role || 'Trainer'}</td>
                                        <td>{s.contact}</td>
                                        <td>{s.leaveBucket}</td>
                                        <td>
                                            <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/staff/edit/${s._id}`} className="btn btn-ghost btn-sm">
                                                <Edit2 size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Staff;
