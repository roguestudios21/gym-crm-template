import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus } from 'lucide-react';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/sales');
            setSales(res.data);
        } catch (error) {
            console.error("Failed to fetch sales", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sales</h1>
                <Link to="/sales/new" className="btn btn-primary">
                    <Plus size={18} />
                    Record Sale
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Member</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : sales.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No sales found</td></tr>
                            ) : (
                                sales.map(s => (
                                    <tr key={s._id}>
                                        <td>{new Date(s.date).toLocaleDateString()}</td>
                                        <td>{s.memberID?.name || 'Guest'}</td>
                                        <td>{s.description}</td>
                                        <td><span className="badge badge-ghost">{s.type}</span></td>
                                        <td className="font-bold">${s.amount}</td>
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

export default Sales;
