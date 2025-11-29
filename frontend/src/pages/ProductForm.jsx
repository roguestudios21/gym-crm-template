import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        description: '',
        category: 'membership', // Default
        sessionCredits: 0,      // For session packs
        sessionTypes: [],
        totalSessions: 0,
        isUnlimited: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setFormData({
                name: res.data.name,
                price: res.data.price,
                duration: res.data.duration,
                description: res.data.description || '',
                category: res.data.category || 'membership',
                sessionCredits: res.data.sessionCredits || 0,
                sessionTypes: res.data.sessionTypes || [],
                totalSessions: res.data.totalSessions || 0,
                isUnlimited: res.data.isUnlimited || false
            });
        } catch (error) {
            console.error("Failed to fetch product", error);
            alert("Failed to load product");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addSessionType = () => {
        setFormData({
            ...formData,
            sessionTypes: [
                ...formData.sessionTypes,
                { name: '', sessionsIncluded: 0, duration: 60, description: '' }
            ]
        });
    };

    const removeSessionType = (index) => {
        const updated = formData.sessionTypes.filter((_, i) => i !== index);
        setFormData({ ...formData, sessionTypes: updated });
    };

    const updateSessionType = (index, field, value) => {
        const updated = [...formData.sessionTypes];
        updated[index][field] = value;
        setFormData({ ...formData, sessionTypes: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate total sessions if not unlimited
            let totalSessions = formData.totalSessions;
            if (!formData.isUnlimited && formData.sessionTypes.length > 0) {
                totalSessions = formData.sessionTypes.reduce(
                    (sum, st) => sum + (parseInt(st.sessionsIncluded) || 0),
                    0
                );
            }

            const dataToSend = {
                ...formData,
                totalSessions: formData.isUnlimited ? 0 : totalSessions
            };

            if (isEdit) {
                await api.put(`/products/${id}`, dataToSend);
            } else {
                await api.post('/products', dataToSend);
            }
            navigate('/products');
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/products')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{isEdit ? 'Edit Plan' : 'New Plan'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="card bg-base-100 shadow-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Plan Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                                placeholder="e.g. Monthly Membership, 10 PT Sessions"
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Category</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="membership">Membership Plan</option>
                                <option value="session_pack">Session Pack</option>
                                <option value="merchandise">Merchandise</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Price</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Duration (Days)</span>
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                                placeholder="30"
                            />
                        </div>

                        {formData.category === 'session_pack' && (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Session Credits</span>
                                </label>
                                <input
                                    type="number"
                                    name="sessionCredits"
                                    value={formData.sessionCredits}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    placeholder="e.g. 10"
                                />
                                <label className="label">
                                    <span className="label-text-alt">Total sessions added to member balance</span>
                                </label>
                            </div>
                        )}

                        {formData.category === 'membership' && (
                            <div className="form-control w-full">
                                <label className="label cursor-pointer">
                                    <span className="label-text font-medium">Unlimited Sessions</span>
                                    <input
                                        type="checkbox"
                                        name="isUnlimited"
                                        checked={formData.isUnlimited}
                                        onChange={handleChange}
                                        className="checkbox checkbox-primary"
                                    />
                                </label>
                            </div>
                        )}

                        <div className="form-control w-full md:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="textarea textarea-bordered h-24"
                                placeholder="Plan details and benefits..."
                            ></textarea>
                        </div>
                    </div>
                </div>


                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/products')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
