import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, MessageSquare } from 'lucide-react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [convertConfirm, setConvertConfirm] = useState(false);
    const [convertId, setConvertId] = useState(null);
    const { toasts, error, success, removeToast } = useToast();

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await api.get('/enquiries');
            setEnquiries(res.data);
        } catch (err) {
            console.error("Failed to fetch enquiries", err);
            error(err.response?.data?.error || 'Failed to load enquiries. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConvertClick = (id) => {
        setConvertId(id);
        setConvertConfirm(true);
    };

    const handleConvertConfirm = async () => {
        try {
            await api.post(`/enquiries/convert/${convertId}`);
            success("Enquiry converted to member successfully!");
            fetchEnquiries();
        } catch (err) {
            error(err.response?.data?.error || "Failed to convert enquiry");
        } finally {
            setConvertConfirm(false);
            setConvertId(null);
        }
    };

    return (
        <div>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}

            <ConfirmDialog
                isOpen={convertConfirm}
                title="Convert to Member?"
                message="This will create a new member from this enquiry. Continue?"
                onConfirm={handleConvertConfirm}
                onCancel={() => setConvertConfirm(false)}
                confirmText="Convert"
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Enquiries</h1>
                <Link to="/enquiries/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Enquiry
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                {loading ? (
                    <LoadingSpinner message="Loading enquiries..." />
                ) : enquiries.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="No enquiries yet"
                        message="Start tracking enquiries to convert them into members"
                        action={
                            <Link to="/enquiries/new" className="btn btn-primary">
                                <Plus size={18} />
                                Add First Enquiry
                            </Link>
                        }
                    />
                ) : (
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
                                {enquiries.map(e => (
                                    <tr key={e._id}>
                                        <td className="font-bold">{e.name}</td>
                                        <td>{e.contact}</td>
                                        <td>{e.type}</td>
                                        <td>{e.remarks}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <span className={`badge ${e.status === 'converted' ? 'badge-success' : e.status === 'closed' ? 'badge-error' : 'badge-info'}`}>
                                                    {e.status}
                                                </span>
                                                {e.status === 'open' && (
                                                    <button
                                                        onClick={() => handleConvertClick(e._id)}
                                                        className="btn btn-xs btn-outline btn-success"
                                                        title="Convert to Member"
                                                    >
                                                        Convert
                                                    </button>
                                                )}
                                            </div>
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

export default Enquiries;
