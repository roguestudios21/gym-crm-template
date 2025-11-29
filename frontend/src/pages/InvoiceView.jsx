import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Printer, Mail, DollarSign, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoiceView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Payment Form State
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMode: 'cash',
        transactionID: '',
        notes: ''
    });

    useEffect(() => {
        fetchInvoice();
        if (searchParams.get('action') === 'pay') {
            setShowPaymentModal(true);
        }
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const res = await api.get(`/invoices/${id}`);
            setInvoice(res.data);
            // Default payment amount to balance
            setPaymentData(prev => ({
                ...prev,
                amount: res.data.balanceAmount
            }));
        } catch (error) {
            console.error("Failed to fetch invoice", error);
            alert("Failed to load invoice");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/invoices/${id}/record-payment`, {
                ...paymentData,
                receivedBy: null // Backend will handle or we can add current user ID if auth implemented
            });
            setShowPaymentModal(false);
            fetchInvoice(); // Refresh data
            alert("Payment recorded successfully!");
        } catch (error) {
            console.error("Payment failed", error);
            alert(error.response?.data?.error || "Payment failed");
        }
    };

    const generatePDF = () => {
        if (!invoice) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("INVOICE", 14, 22);

        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 14, 35);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 40);

        // Member Info
        doc.text("Bill To:", 140, 30);
        doc.setFont("helvetica", "bold");
        doc.text(invoice.memberID.name, 140, 35);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.memberID.email || '', 140, 40);
        doc.text(invoice.memberID.contact1 || '', 140, 45);

        // Items Table
        const tableColumn = ["Description", "Qty", "Unit Price", "Amount"];
        const tableRows = invoice.items.map(item => [
            item.description,
            item.quantity,
            `$${item.unitPrice.toFixed(2)}`,
            `$${item.amount.toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 55,
            head: [tableColumn],
            body: tableRows,
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 140, finalY + 5);
        doc.text(`Discount: -$${invoice.discount.toFixed(2)}`, 140, finalY + 10);

        doc.setFont("helvetica", "bold");
        doc.text(`Total: $${invoice.totalAmount.toFixed(2)}`, 140, finalY + 20);

        doc.setTextColor(0, 128, 0);
        doc.text(`Paid: $${invoice.paidAmount.toFixed(2)}`, 140, finalY + 25);

        doc.setTextColor(255, 0, 0);
        doc.text(`Balance: $${invoice.balanceAmount.toFixed(2)}`, 140, finalY + 30);

        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    };

    if (loading) return <div className="p-8 text-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
                    <div className={`badge ${invoice.status === 'paid' ? 'badge-success' : invoice.status === 'overdue' ? 'badge-error' : 'badge-warning'} gap-1`}>
                        {invoice.status.toUpperCase()}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={generatePDF} className="btn btn-outline gap-2">
                        <Download size={18} /> PDF
                    </button>
                    {invoice.balanceAmount > 0 && (
                        <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary gap-2">
                            <DollarSign size={18} /> Record Payment
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Invoice Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="card bg-base-100 shadow-xl p-8">
                        <div className="flex justify-between mb-8">
                            <div>
                                <h3 className="text-gray-500 text-sm uppercase font-bold">Billed To</h3>
                                <p className="text-xl font-bold mt-2">{invoice.memberID.name}</p>
                                <p>{invoice.memberID.email}</p>
                                <p>{invoice.memberID.contact1}</p>
                                <p className="mt-2 text-sm text-gray-500">{invoice.memberID.address}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-gray-500 text-sm uppercase font-bold">Invoice Details</h3>
                                <p className="mt-2"><span className="font-semibold">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <table className="table w-full mb-8">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th className="text-center">Qty</th>
                                    <th className="text-right">Unit Price</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.description}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                                        <td className="text-right font-bold">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${invoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax ({invoice.taxRate}%):</span>
                                    <span>${invoice.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-success">
                                    <span>Discount:</span>
                                    <span>-${invoice.discount.toFixed(2)}</span>
                                </div>
                                <div className="divider my-2"></div>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total:</span>
                                    <span>${invoice.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-success font-semibold">
                                    <span>Paid:</span>
                                    <span>${invoice.paidAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-error font-bold text-lg">
                                    <span>Balance:</span>
                                    <span>${invoice.balanceAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Payment History */}
                <div className="space-y-6">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Payment History</h3>
                        {invoice.paymentHistory.length === 0 ? (
                            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {invoice.paymentHistory.map((payment, idx) => (
                                    <div key={idx} className="border-l-4 border-success pl-4 py-1">
                                        <p className="font-bold">${payment.amount.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()} via {payment.mode}
                                        </p>
                                        {payment.transactionID && (
                                            <p className="text-xs font-mono bg-base-200 inline-block px-1 rounded mt-1">
                                                {payment.transactionID}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Record Payment</h3>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    className="input input-bordered"
                                    value={paymentData.amount}
                                    onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                                    max={invoice.balanceAmount}
                                    step="0.01"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">Payment Mode</label>
                                <select
                                    className="select select-bordered"
                                    value={paymentData.paymentMode}
                                    onChange={e => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="netbanking">Net Banking</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label">Transaction ID / Ref #</label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={paymentData.transactionID}
                                    onChange={e => setPaymentData({ ...paymentData, transactionID: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">Notes</label>
                                <textarea
                                    className="textarea textarea-bordered"
                                    value={paymentData.notes}
                                    onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Record Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceView;
