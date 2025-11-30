import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Search, DollarSign, TrendingUp } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Sales = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalSales: 0,
        todaySales: 0,
        thisMonthSales: 0
    });
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/sales');
            setSales(res.data);

            // Calculate stats
            const today = new Date().toDateString();
            const thisMonth = new Date().getMonth();

            const todaySales = res.data
                .filter(s => new Date(s.date).toDateString() === today)
                .reduce((sum, s) => sum + (s.amount || 0), 0);

            const monthSales = res.data
                .filter(s => new Date(s.date).getMonth() === thisMonth)
                .reduce((sum, s) => sum + (s.amount || 0), 0);

            const totalSales = res.data.reduce((sum, s) => sum + (s.amount || 0), 0);

            setStats({
                totalSales,
                todaySales,
                thisMonthSales: monthSales
            });
        } catch (err) {
            console.error("Failed to fetch sales", err);
            error(err.response?.data?.error || 'Failed to load sales. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale =>
        (sale.memberID?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sales</h1>
                <button
                    onClick={() => navigate('/sales/new')}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    Record Sale
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-60">Today's Sales</p>
                                <h2 className="text-3xl font-bold text-success">
                                    ${stats.todaySales.toFixed(2)}
                                </h2>
                            </div>
                            <DollarSign size={40} className="opacity-20" />
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-60">This Month</p>
                                <h2 className="text-3xl font-bold text-info">
                                    ${stats.thisMonthSales.toFixed(2)}
                                </h2>
                            </div>
                            <TrendingUp size={40} className="opacity-20" />
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-60">Total Sales</p>
                                <h2 className="text-3xl font-bold text-primary">
                                    ${stats.totalSales.toFixed(2)}
                                </h2>
                            </div>
                            <DollarSign size={40} className="opacity-20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card bg-base-100 shadow-xl p-4 mb-6">
                <div className="form-control">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Search by member or description..."
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-square">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card bg-base-100 shadow-xl overflow-hidden">
                {loading ? (
                    <LoadingSpinner message="Loading sales..." />
                ) : filteredSales.length === 0 ? (
                    <EmptyState
                        icon={DollarSign}
                        title={searchTerm ? "No sales found" : "No sales yet"}
                        message={searchTerm ? "Try adjusting your search" : "Record your first sale to get started"}
                        action={!searchTerm && (
                            <button onClick={() => navigate('/sales/new')} className="btn btn-primary">
                                <Plus size={18} />
                                Record First Sale
                            </button>
                        )}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Member</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr key={sale._id} className="hover">
                                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="font-semibold">{sale.memberID?.name || 'Walk-in'}</div>
                                            <div className="text-xs opacity-50">{sale.memberID?.contact1 || ''}</div>
                                        </td>
                                        <td>{sale.product?.name || 'N/A'}</td>
                                        <td className="font-bold text-success">${(sale.amount || 0).toFixed(2)}</td>
                                        <td>
                                            <span className="badge badge-ghost">
                                                {(sale.paymentMode || 'cash').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate">{sale.description || '-'}</td>
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

export default Sales;
