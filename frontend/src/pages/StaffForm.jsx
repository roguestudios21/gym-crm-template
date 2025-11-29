import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const StaffForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        contact: '',
        email: '',
        leaveBucket: 20,
        status: 'active',
        address: '',
        salary: '',
        joiningDate: '',
        emergencyContact: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchStaff();
        }
    }, [id]);

    const fetchStaff = async () => {
        try {
            const res = await api.get(`/staff/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/staff/update/${id}`, formData);
            } else {
                await api.post('/staff/create', formData);
            }
            navigate('/staff');
        } catch (error) {
            console.error("Failed to save staff", error);
            alert("Failed to save staff");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/staff')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{id ? 'Edit Staff' : 'New Staff'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Full Name</span>
                        </label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Role</span>
                        </label>
                        <input name="role" value={formData.role} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Trainer, Manager" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Contact</span>
                        </label>
                        <input required name="contact" value={formData.contact} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Leave Bucket</span>
                        </label>
                        <input type="number" name="leaveBucket" value={formData.leaveBucket} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Status</span>
                        </label>
                        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium">Address</span>
                        </label>
                        <input name="address" value={formData.address} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Salary</span>
                        </label>
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Joining Date</span>
                        </label>
                        <input type="date" name="joiningDate" value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Emergency Contact</span>
                        </label>
                        <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/staff')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Staff'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffForm;
