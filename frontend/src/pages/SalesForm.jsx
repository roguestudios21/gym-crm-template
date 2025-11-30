import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const SalesForm = () => {
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        memberID: '',
        amount: '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        product: '',
        staff: '',
        paymentMode: 'Cash'
    });
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [members, setMembers] = useState([]);

    const fetchData = async () => {
        try {
            const [prodRes, staffRes, memRes] = await Promise.all([
                api.get('/products'),
                api.get('/staff'),
                api.get('/members?status=active')
            ]);
            setProducts(prodRes.data);
            setStaffList(staffRes.data);
            setMembers(memRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-fill amount and type if product is selected
            if (name === 'product') {
                const selectedProduct = products.find(p => p._id === value);
                if (selectedProduct) {
                    newData.amount = selectedProduct.price;
                    newData.type = 'Membership Plan'; // or Product Name
                    newData.description = selectedProduct.name;
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/sales/add', formData);
            if (res.data.invoice && res.data.invoice._id) {
                navigate(`/invoices/${res.data.invoice._id}`);
            } else {
                navigate('/sales');
            }
        } catch (error) {
            console.error("Failed to record sale", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to record sale";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/sales')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">Record Sale</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Member</span>
                        </label>
                        <select required name="memberID" value={formData.memberID} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">Select Member</option>
                            {members.map(m => (
                                <option key={m._id} value={m._id}>{m.name} ({m.memberID})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Product (Optional)</span>
                        </label>
                        <select name="product" value={formData.product} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Staff (Sold By)</span>
                        </label>
                        <select name="staff" value={formData.staff} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">Select Staff</option>
                            {staffList.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Amount</span>
                        </label>
                        <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="input input-bordered w-full" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Payment Mode</span>
                        </label>
                        <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="select select-bordered w-full">
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Type</span>
                        </label>
                        <input name="type" value={formData.type} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g. Subscription, Product" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Date</span>
                        </label>
                        <input required type="date" name="date" value={formData.date} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="form-control w-full md:col-span-2">
                        <label className="label">
                            <span className="label-text font-medium">Description</span>
                        </label>
                        <input name="description" value={formData.description} onChange={handleChange} className="input input-bordered w-full" placeholder="Sale details" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/sales')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Record Sale'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesForm;
