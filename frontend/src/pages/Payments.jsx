import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, FileText, Download, DollarSign } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchPayments();
    }, [filterMode]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let url = '/payments';
            if (filterMode) {
                url += `?paymentMode=${filterMode}`;
            }
            const res = await api.get(url);
            setPayments(res.data.payments || []);
        } catch (err) {
            console.error("Failed to fetch payments", err);
            error(err.response?.data?.error || 'Failed to load payments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateReceipt = (payment) => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("PAYMENT RECEIPT", 105, 20, null, null, "center");

            doc.setFontSize(10);
            doc.text(`Receipt #: ${payment.paymentNumber || 'PENDING'}`, 14, 40);
            doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 14, 45);

            doc.text("Received From:", 14, 55);
            doc.setFont("helvetica", "bold");
            doc.text(payment.memberID?.name || 'Unknown Member', 14, 60);

            doc.setFont("helvetica", "normal");
            doc.text(`Amount Received: $${(payment.amount || 0).toFixed(2)}`, 14, 70);
            doc.text(`Payment Mode: ${(payment.paymentMode || 'N/A').toUpperCase()}`, 14, 75);
            if (payment.transactionID) {
                doc.text(`Transaction ID: ${payment.transactionID}`, 14, 80);
            }

            doc.text(`For Invoice: ${payment.invoiceID?.invoiceNumber || 'N/A'}`, 14, 90);

            doc.save(`Receipt-${payment.paymentNumber || 'draft'}.pdf`);
            success('Receipt generated successfully');
        } catch (err) {
            error('Failed to generate receipt');
        }
    };

    const filteredPayments = payments.filter(p =>
        (p.memberID?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.invoiceID?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Payments</h1>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="form-control flex-1">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search member or invoice..."
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
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                    >
                        <option value="">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card bg-base-100 shadow-xl overflow-hidden">
                {loading ? (
                    <LoadingSpinner message="Loading payments..." />
                ) : filteredPayments.length === 0 ? (
                    <EmptyState
                        icon={DollarSign}
                        title={searchTerm || filterMode ? "No payments found" : "No payments yet"}
                        message={searchTerm || filterMode ? "Try adjusting your filters" : "Payments will appear here once recorded"}
                        action={null}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Receipt #</th>
                                    <th>Date</th>
                                    <th>Member</th>
                                    <th>Invoice</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover">
                                        <td className="font-mono font-semibold">{payment.paymentNumber || 'PENDING'}</td>
                                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="font-semibold">{payment.memberID?.name || 'Unknown'}</div>
                                            <div className="text-xs opacity-50">{payment.memberID?.contact1 || ''}</div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/invoices/${payment.invoiceID?._id}`)}
                                                className="link link-primary font-mono text-sm"
                                            >
                                                {payment.invoiceID?.invoiceNumber || 'N/A'}
                                            </button>
                                        </td>
                                        <td className="font-bold text-success">${(payment.amount || 0).toFixed(2)}</td>
                                        <td>
                                            <span className="badge badge-ghost">{(payment.paymentMode || 'N/A').toUpperCase()}</span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => generateReceipt(payment)}
                                                className="btn btn-ghost btn-sm"
                                                title="Download Receipt"
                                            >
                                                <Download size={16} />
                                            </button>
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

export default Payments;

