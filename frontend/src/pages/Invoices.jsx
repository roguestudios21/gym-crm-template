import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Search, FileText, DollarSign, Eye } from 'lucide-react';

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [filterStatus]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            let url = '/invoices';
            if (filterStatus) {
                url += `?status=${filterStatus}`;
            }
            const res = await api.get(url);
            setInvoices(res.data.invoices || []);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return 'badge-success';
            case 'partial': return 'badge-warning';
            case 'pending': return 'badge-info';
            case 'overdue': return 'badge-error';
            case 'draft': return 'badge-ghost';
            default: return 'badge-ghost';
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.memberID?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Create Invoice
                </button>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="form-control flex-1">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search invoice # or member..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-square">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                    <select
                        className="select select-bordered w-full md:w-48"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card bg-base-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Member</th>
                                <th>Amount</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-base-content/60">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover">
                                        <td className="font-mono font-bold">{inv.invoiceNumber}</td>
                                        <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="font-semibold">{inv.memberID?.name}</div>
                                            <div className="text-xs opacity-50">{inv.memberID?.contact1}</div>
                                        </td>
                                        <td className="font-bold">${inv.totalAmount.toFixed(2)}</td>
                                        <td className="text-success">${inv.paidAmount.toFixed(2)}</td>
                                        <td className="text-error">${inv.balanceAmount.toFixed(2)}</td>
                                        <td>
                                            <div className={`badge ${getStatusBadge(inv.status)} gap-1`}>
                                                {inv.status}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-ghost btn-xs tooltip"
                                                    data-tip="View Details"
                                                    onClick={() => navigate(`/invoices/${inv._id}`)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {inv.balanceAmount > 0 && (
                                                    <button
                                                        className="btn btn-ghost btn-xs text-success tooltip"
                                                        data-tip="Record Payment"
                                                        onClick={() => navigate(`/invoices/${inv._id}?action=pay`)}
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                )}
                                            </div>
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

export default Invoices;
