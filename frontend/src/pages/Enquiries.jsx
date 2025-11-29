import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus } from 'lucide-react';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await api.get('/enquiries');
            setEnquiries(res.data);
        } catch (error) {
            console.error("Failed to fetch enquiries", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Enquiries</h1>
                <Link to="/enquiries/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Enquiry
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Type</th>
                                <th>Remarks</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : enquiries.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No enquiries found</td></tr>
                            ) : (
                                enquiries.map(e => (
                                    <tr key={e._id}>
                                        <td className="font-bold">{e.name}</td>
                                        <td>{e.contact}</td>
                                        <td>{e.type}</td>
                                        <td>{e.remarks}</td>
                                        <td>
                                            <span className={`badge ${e.status === 'converted' ? 'badge-success' : e.status === 'closed' ? 'badge-error' : 'badge-info'}`}>
                                                {e.status}
                                            </span>
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

export default Enquiries;
