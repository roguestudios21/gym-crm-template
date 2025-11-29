import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, Upload } from 'lucide-react';

const MemberForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        DOB: '',
        contact1: '',
        contact2: '',
        email: '',
        address: '',
        emergencyName: '',
        emergencyNumber: '',
        status: 'active',
        subscription: '',
        plan: '', // This will map to membership.currentPlan
        startDate: '', // This will map to membership.startDate
        endDate: ''    // This will map to membership.endDate
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const fetchMember = async () => {
        try {
            const res = await api.get(`/members/${id}`);
            const data = res.data;

            // Handle nested plan/membership data
            let planID = '';
            let startDate = '';
            let endDate = '';

            if (data.membership && data.membership.currentPlan) {
                planID = typeof data.membership.currentPlan === 'object' ? data.membership.currentPlan._id : data.membership.currentPlan;
                startDate = data.membership.startDate ? data.membership.startDate.split('T')[0] : '';
                endDate = data.membership.endDate ? data.membership.endDate.split('T')[0] : '';
            } else if (data.plan) {
                planID = typeof data.plan === 'object' ? data.plan._id : data.plan;
                startDate = data.startDate ? data.startDate.split('T')[0] : '';
                endDate = data.endDate ? data.endDate.split('T')[0] : '';
            }

            setFormData({
                name: data.name || '',
                gender: data.gender || '',
                DOB: data.DOB || '',
                contact1: data.contact1 || '',
                contact2: data.contact2 || '',
                email: data.email || '',
                address: data.address || '',
                emergencyName: data.emergencyName || '',
                emergencyNumber: data.emergencyNumber || '',
                status: data.status || 'active',
                subscription: data.subscription || '',
                plan: planID,
                startDate: startDate,
                endDate: endDate,
                memberID: data.memberID
            });

            if (data.profilePicture) {
                setPreview(data.profilePicture);
            }
        } catch (error) {
            console.error("Failed to fetch member", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        if (isEdit) {
            fetchMember();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();

        // Append basic fields
        const basicFields = ['name', 'gender', 'DOB', 'contact1', 'contact2', 'email', 'address', 'emergencyName', 'emergencyNumber', 'status', 'subscription'];
        basicFields.forEach(key => {
            data.append(key, formData[key]);
        });

        // Handle Plan/Membership explicitly
        if (formData.plan) {
            data.append('plan', formData.plan);
            // Also send as membership object structure for backend compatibility
            data.append('membership.currentPlan', formData.plan);
        }
        if (formData.startDate) {
            data.append('startDate', formData.startDate);
            data.append('membership.startDate', formData.startDate);
        }
        if (formData.endDate) {
            data.append('endDate', formData.endDate);
            data.append('membership.endDate', formData.endDate);
        }

        if (file) {
            data.append('profilePicture', file);
        }

        try {
            if (isEdit) {
                await api.put(`/members/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/members', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/members');
        } catch (error) {
            console.error("Failed to save member", error);
            alert("Failed to save member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/members')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{isEdit ? 'Edit Member' : 'New Member'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-32 h-32 rounded-full bg-base-200 overflow-hidden flex items-center justify-center border-2 border-dashed border-base-300">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-base-content/30">
                                <Upload size={32} />
                                <span className="text-xs mt-1">Photo</span>
                            </div>
                        )}
                    </div>
                    <label className="btn btn-outline btn-sm cursor-pointer">
                        Upload Photo
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Full Name</span>
                        </label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Gender</span>
                        </label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Date of Birth</span>
                        </label>
                        <input type="date" name="DOB" value={formData.DOB} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Primary Contact</span>
                        </label>
                        <input required name="contact1" value={formData.contact1} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Secondary Contact</span>
                        </label>
                        <input name="contact2" value={formData.contact2} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium">Address</span>
                        </label>
                        <input name="address" value={formData.address} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Emergency Contact Name</span>
                        </label>
                        <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Emergency Contact Number</span>
                        </label>
                        <input name="emergencyNumber" value={formData.emergencyNumber} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Status</span>
                        </label>
                        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="frozen">Frozen</option>
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Member ID</span>
                        </label>
                        <input value={formData.memberID || 'Auto-generated'} disabled className="input input-bordered w-full bg-base-200" />
                    </div>

                    <div className="divider md:col-span-2 font-semibold">Membership Details</div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Membership Plan</span>
                        </label>
                        <select name="plan" value={formData.plan || ''} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">Select Plan</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} - {p.price} ({p.duration} days)</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Start Date</span>
                        </label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">End Date</span>
                        </label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Legacy Subscription (Optional)</span>
                        </label>
                        <input name="subscription" value={formData.subscription} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Monthly, Yearly" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/members')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Member'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberForm;
