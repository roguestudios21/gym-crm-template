import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Search, FileText } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchInvoices();
    }, [filterStatus]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            let url = '/invoices';
            if (filterStatus) {
                url += `? status = ${filterStatus} `;
            }
            const res = await api.get(url);
            setInvoices(res.data);
        } catch (err) {
            console.error("Failed to fetch invoices", err);
            error(err.response?.data?.error || 'Failed to load invoices. Please try again.');
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
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.memberID?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Placeholder for handleRecordPayment, assuming it will be defined elsewhere or is a future addition
    const handleRecordPayment = (invoice) => {
        navigate(`/ invoices / ${invoice._id}?action = pay`);
    };

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

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
                {loading ? (
                    <LoadingSpinner message="Loading invoices..." />
                ) : filteredInvoices.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={searchTerm || filterStatus ? "No invoices found" : "No invoices yet"}
                        message={searchTerm || filterStatus ? "Try adjusting your filters" : "Create your first invoice to get started"}
                        action={!searchTerm && !filterStatus && (
                            <button onClick={() => navigate('/invoices/new')} className="btn btn-primary">
                                <Plus size={18} />
                                Create First Invoice
                            </button>
                        )}
                    />
                ) : (
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
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover">
                                        <td className="font-mono font-bold">{inv.invoiceNumber}</td>
                                        <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="font-semibold">{inv.memberID?.name || 'Unknown Member'}</div>
                                            <div className="text-xs opacity-50">{inv.memberID?.contact1 || ''}</div>
                                        </td>
                                        <td className="font-bold">${(inv.totalAmount || 0).toFixed(2)}</td>
                                        <td className="text-success">${(inv.paidAmount || 0).toFixed(2)}</td>
                                        <td className="text-error">${(inv.balanceAmount || 0).toFixed(2)}</td>
                                        <td>
                                            <div className={`badge ${getStatusBadge(inv.status)} gap - 1`}>
                                                {inv.status}
                                            </div>
                                        </td>
                                        <td className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/ invoices / ${inv._id} `)}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            {inv.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleRecordPayment(inv)}
                                                    className="btn btn-success btn-sm"
                                                >
                                                    Record Payment
                                                </button>
                                            )}
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

export default Invoices;
