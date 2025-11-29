import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { DollarSign, Download, Save, Calendar } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
    const [dsr, setDsr] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [productWise, setProductWise] = useState([]);
    const [staffPerformance, setStaffPerformance] = useState([]);
    const [paymentMode, setPaymentMode] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    useEffect(() => {
        fetchAllReports();
    }, [dateRange]);

    const fetchAllReports = async () => {
        try {
            const params = {};
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;

            const [dsrRes, monthlyRes, productRes, staffRes, paymentRes] = await Promise.all([
                api.get('/reports/dsr', { params }),
                api.get('/reports/monthly', { params }),
                api.get('/reports/product-wise', { params }),
                api.get('/reports/staff-performance', { params }),
                api.get('/reports/payment-mode', { params })
            ]);

            setDsr(dsrRes.data);
            setMonthly(monthlyRes.data);
            setProductWise(productRes.data);
            setStaffPerformance(staffRes.data);
            setPaymentMode(paymentRes.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = () => {
        const totalRevenue = monthly.reduce((acc, m) => acc + m.totalAmount, 0);
        const totalTransactions = monthly.reduce((acc, m) => acc + m.count, 0);
        const topProduct = productWise.length > 0
            ? productWise.reduce((max, p) => p.totalAmount > max.totalAmount ? p : max, productWise[0])
            : null;
        const topStaff = staffPerformance.length > 0
            ? staffPerformance.reduce((max, s) => s.totalAmount > max.totalAmount ? s : max, staffPerformance[0])
            : null;

        return {
            totalRevenue,
            totalTransactions,
            topProduct: topProduct?._id || 'N/A',
            topStaff: topStaff?._id || 'N/A',
            averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
        };
    };

    const exportToCSV = () => {
        const summary = calculateSummary();

        // Create CSV content
        let csvContent = `Gym CRM - Sales Report\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n`;
        if (dateRange.start || dateRange.end) {
            csvContent += `Date Range: ${dateRange.start || 'Beginning'} to ${dateRange.end || 'Today'}\n`;
        }
        csvContent += `\n`;
        csvContent += `SUMMARY STATISTICS\n`;
        csvContent += `Total Revenue,$${summary.totalRevenue.toFixed(2)}\n`;
        csvContent += `Total Transactions,${summary.totalTransactions}\n`;
        csvContent += `Average Transaction Value,$${summary.averageTransactionValue.toFixed(2)}\n`;
        csvContent += `Top Product,${summary.topProduct}\n`;
        csvContent += `Top Staff,${summary.topStaff}\n`;
        csvContent += `\n\n`;

        // Monthly Sales
        csvContent += `MONTHLY SALES\n`;
        csvContent += `Month,Revenue,Transaction Count\n`;
        monthly.forEach(m => {
            const monthName = new Date(2000, m._id - 1).toLocaleString('default', { month: 'long' });
            csvContent += `${monthName},$${m.totalAmount.toFixed(2)},${m.count}\n`;
        });
        csvContent += `\n\n`;

        // Product-wise
        if (productWise.length > 0) {
            csvContent += `PRODUCT-WISE SALES\n`;
            csvContent += `Product,Revenue,Transaction Count\n`;
            productWise.forEach(p => {
                csvContent += `${p._id || 'No Product'},$${p.totalAmount.toFixed(2)},${p.count}\n`;
            });
            csvContent += `\n\n`;
        }

        // Staff Performance
        if (staffPerformance.length > 0) {
            csvContent += `STAFF PERFORMANCE\n`;
            csvContent += `Staff,Revenue,Transaction Count\n`;
            staffPerformance.forEach(s => {
                csvContent += `${s._id || 'No Staff'},$${s.totalAmount.toFixed(2)},${s.count}\n`;
            });
            csvContent += `\n\n`;
        }

        // Payment Mode
        if (paymentMode.length > 0) {
            csvContent += `PAYMENT MODES\n`;
            csvContent += `Payment Mode,Revenue,Transaction Count\n`;
            paymentMode.forEach(p => {
                csvContent += `${p._id},$${p.totalAmount.toFixed(2)},${p.count}\n`;
            });
        }

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gym-crm-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToPDF = async () => {
        const summary = calculateSummary();
        const pdf = new jsPDF();

        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(59, 130, 246); // Blue
        pdf.text('Gym CRM - Sales Report', 14, 20);

        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        if (dateRange.start || dateRange.end) {
            pdf.text(`Date Range: ${dateRange.start || 'Beginning'} to ${dateRange.end || 'Today'}`, 14, 33);
        }

        // Summary Statistics
        pdf.setFontSize(14);
        pdf.setTextColor(0);
        pdf.text('Summary Statistics', 14, 45);

        pdf.autoTable({
            startY: 50,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
                ['Total Transactions', summary.totalTransactions.toString()],
                ['Average Transaction Value', `$${summary.averageTransactionValue.toFixed(2)}`],
                ['Top Product', summary.topProduct],
                ['Top Staff', summary.topStaff]
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Monthly Sales
        if (monthly.length > 0) {
            pdf.setFontSize(14);
            pdf.text('Monthly Sales', 14, pdf.lastAutoTable.finalY + 15);

            pdf.autoTable({
                startY: pdf.lastAutoTable.finalY + 20,
                head: [['Month', 'Revenue', 'Transactions']],
                body: monthly.map(m => {
                    const monthName = new Date(2000, m._id - 1).toLocaleString('default', { month: 'long' });
                    return [monthName, `$${m.totalAmount.toFixed(2)}`, m.count.toString()];
                }),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Product-wise Sales
        if (productWise.length > 0) {
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text('Product-wise Sales', 14, 20);

            pdf.autoTable({
                startY: 25,
                head: [['Product', 'Revenue', 'Transactions']],
                body: productWise.map(p => [
                    p._id || 'No Product',
                    `$${p.totalAmount.toFixed(2)}`,
                    p.count.toString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Staff Performance
        if (staffPerformance.length > 0) {
            pdf.setFontSize(14);
            pdf.text('Staff Performance', 14, pdf.lastAutoTable.finalY + 15);

            pdf.autoTable({
                startY: pdf.lastAutoTable.finalY + 20,
                head: [['Staff Member', 'Revenue', 'Transactions']],
                body: staffPerformance.map(s => [
                    s._id || 'No Staff',
                    `$${s.totalAmount.toFixed(2)}`,
                    s.count.toString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Payment Modes
        if (paymentMode.length > 0) {
            pdf.setFontSize(14);
            pdf.text('Payment Modes', 14, pdf.lastAutoTable.finalY + 15);

            pdf.autoTable({
                startY: pdf.lastAutoTable.finalY + 20,
                head: [['Payment Mode', 'Revenue', 'Transactions']],
                body: paymentMode.map(p => [
                    p._id,
                    `$${p.totalAmount.toFixed(2)}`,
                    p.count.toString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Save PDF
        pdf.save(`gym-crm-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const saveSnapshot = async () => {
        try {
            const summary = calculateSummary();

            await api.post('/reports/snapshot', {
                reportType: 'comprehensive',
                dateRange: {
                    start: dateRange.start || new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    end: dateRange.end || new Date()
                },
                data: {
                    dsr,
                    monthly,
                    productWise,
                    staffPerformance,
                    paymentMode
                },
                summary
            });

            alert('Report snapshot saved successfully!');
        } catch (error) {
            console.error('Failed to save snapshot:', error);
            alert('Failed to save report snapshot');
        }
    };

    const setQuickDateRange = (range) => {
        const end = new Date();
        let start = new Date();

        switch (range) {
            case '7days':
                start.setDate(end.getDate() - 7);
                break;
            case '30days':
                start.setDate(end.getDate() - 30);
                break;
            case '90days':
                start.setDate(end.getDate() - 90);
                break;
            case 'all':
                setDateRange({ start: '', end: '' });
                return;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;

    const summary = calculateSummary();

    return (
        <div>
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <div className="flex flex-wrap gap-2">
                    <button onClick={exportToCSV} className="btn btn-outline btn-sm gap-2">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button onClick={exportToPDF} className="btn btn-outline btn-sm gap-2">
                        <Download size={16} />
                        Export PDF
                    </button>
                    <button onClick={saveSnapshot} className="btn btn-primary btn-sm gap-2">
                        <Save size={16} />
                        Save Snapshot
                    </button>
                </div>
            </div>

            {/* Date Range Filters */}
            <div className="card bg-base-100 shadow-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Date Range Filter
                </h3>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Start Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered input-sm"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">End Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered input-sm"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setQuickDateRange('7days')} className="btn btn-sm btn-ghost">Last 7 Days</button>
                        <button onClick={() => setQuickDateRange('30days')} className="btn btn-sm btn-ghost">Last 30 Days</button>
                        <button onClick={() => setQuickDateRange('90days')} className="btn btn-sm btn-ghost">Last 90 Days</button>
                        <button onClick={() => setQuickDateRange('all')} className="btn btn-sm btn-ghost">All Time</button>
                    </div>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold">${summary.totalRevenue.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-12 h-12 opacity-50" />
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Transactions</p>
                            <p className="text-3xl font-bold">{summary.totalTransactions}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                            #{summary.totalTransactions}
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl p-6">
                    <div>
                        <p className="text-purple-100 text-sm">Avg Transaction</p>
                        <p className="text-3xl font-bold">${summary.averageTransactionValue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl p-6">
                    <div>
                        <p className="text-amber-100 text-sm">Top Product</p>
                        <p className="text-xl font-bold truncate">{summary.topProduct}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Monthly Sales Trend */}
                {monthly.length > 0 && (
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Monthly Sales Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="_id"
                                        tickFormatter={(month) => new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}
                                        stroke="#6b7280"
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => `$${value.toFixed(2)}`}
                                        labelFormatter={(month) => new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                                    />
                                    <Legend />
                                    <Bar dataKey="totalAmount" name="Revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Product-wise Sales */}
                {productWise.length > 0 && (
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Sales by Product</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productWise}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name || 'Other'} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="totalAmount"
                                        nameKey="_id"
                                    >
                                        {productWise.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Staff Performance */}
                {staffPerformance.length > 0 && (
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Staff Performance</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={staffPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#6b7280" />
                                    <YAxis dataKey="_id" type="category" width={100} stroke="#6b7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="totalAmount" name="Sales Generated" fill="#10b981" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Payment Modes */}
                {paymentMode.length > 0 && (
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Payment Modes</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMode}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {paymentMode.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
