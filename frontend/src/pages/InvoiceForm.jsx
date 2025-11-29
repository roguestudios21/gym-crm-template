import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const InvoiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        memberID: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [
            { description: '', quantity: 1, unitPrice: 0, amount: 0, planID: '' }
        ],
        taxRate: 0,
        discount: 0,
        notes: ''
    });

    useEffect(() => {
        fetchMembers();
        fetchProducts();
        if (id) {
            fetchInvoice();
        }
    }, [id]);

    // Set default due date (7 days from now)
    useEffect(() => {
        if (!isEdit && !formData.dueDate) {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            setFormData(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }));
        }
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members?status=active');
            setMembers(res.data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const fetchInvoice = async () => {
        try {
            const res = await api.get(`/invoices/${id}`);
            const invoice = res.data;
            setFormData({
                memberID: invoice.memberID._id,
                invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                items: invoice.items.map(item => ({
                    ...item,
                    planID: item.planID?._id || item.planID || ''
                })),
                taxRate: invoice.taxRate || 0,
                discount: invoice.discount || 0,
                notes: invoice.notes || ''
            });
        } catch (error) {
            console.error("Failed to fetch invoice", error);
            alert("Failed to load invoice");
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Auto-fill price if plan selected
        if (field === 'planID' && value) {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index].description = product.name;
                newItems[index].unitPrice = product.price;
            }
        }

        // Recalculate amount
        if (field === 'quantity' || field === 'unitPrice' || field === 'planID') {
            newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, amount: 0, planID: '' }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const tax = subtotal * (formData.taxRate / 100);
        const total = subtotal + tax - formData.discount;
        return { subtotal, tax, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/invoices/${id}`, formData);
            } else {
                await api.post('/invoices', formData);
            }
            navigate('/invoices');
        } catch (error) {
            console.error("Failed to save invoice", error);
            alert("Failed to save invoice");
        } finally {
            setLoading(false);
        }
    };

    const { subtotal, tax, total } = calculateTotals();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="card bg-base-100 shadow-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Member</span>
                            </label>
                            <select
                                required
                                className="select select-bordered w-full"
                                value={formData.memberID}
                                onChange={(e) => setFormData({ ...formData, memberID: e.target.value })}
                                disabled={isEdit}
                            >
                                <option value="">Select Member</option>
                                {members.map(m => (
                                    <option key={m._id} value={m._id}>{m.name} ({m.memberID})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Invoice Date</span>
                            </label>
                            <input
                                type="date"
                                required
                                className="input input-bordered w-full"
                                value={formData.invoiceDate}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Due Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="card bg-base-100 shadow-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Invoice Items</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="w-1/4">Item / Plan</th>
                                    <th className="w-1/3">Description</th>
                                    <th className="w-24">Qty</th>
                                    <th className="w-32">Unit Price</th>
                                    <th className="w-32">Amount</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select
                                                className="select select-bordered select-sm w-full"
                                                value={item.planID}
                                                onChange={(e) => handleItemChange(index, 'planID', e.target.value)}
                                            >
                                                <option value="">Custom Item</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm w-full"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder="Description"
                                                required
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm w-full"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                min="1"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm w-full"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="font-bold text-right">
                                            ${item.amount.toFixed(2)}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => removeItem(index)}
                                                disabled={formData.items.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-2 mt-4 self-start"
                        onClick={addItem}
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Totals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Notes</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-32"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Payment terms, bank details, etc."
                            ></textarea>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Subtotal</span>
                                <span className="text-xl">${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Tax Rate (%)</span>
                                    <input
                                        type="number"
                                        className="input input-bordered input-xs w-20"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <span>${tax.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Discount ($)</span>
                                    <input
                                        type="number"
                                        className="input input-bordered input-xs w-20"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <span className="text-error">-${formData.discount.toFixed(2)}</span>
                            </div>

                            <div className="divider my-2"></div>

                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/invoices')} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
