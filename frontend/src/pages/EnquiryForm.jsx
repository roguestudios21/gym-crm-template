import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const EnquiryForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        type: '',
        remarks: '',
        notes: '',
        status: 'open'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/enquiries/add', formData);
            navigate('/enquiries');
        } catch (error) {
            console.error("Failed to create enquiry", error);
            alert("Failed to create enquiry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/enquiries')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">New Enquiry</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Name</span>
                        </label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" />
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
                            <span className="label-text font-medium">Type</span>
                        </label>
                        <input name="type" value={formData.type} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Membership, Personal Training" />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium">Remarks</span>
                        </label>
                        <input name="remarks" value={formData.remarks} onChange={handleChange} className="input input-bordered w-full" placeholder="Additional notes" />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium">Private Notes</span>
                        </label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="textarea textarea-bordered w-full" rows="3" placeholder="Internal notes about this enquiry"></textarea>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Status</span>
                        </label>
                        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
                            <option value="open">Open</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/enquiries')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Create Enquiry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EnquiryForm;
