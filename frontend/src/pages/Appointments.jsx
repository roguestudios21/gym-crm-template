import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Calendar } from 'lucide-react';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Appointments</h1>
                <Link to="/appointments/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Appointment
                </Link>
            </div>

            <div className="card bg-base-100 shadow-xl p-6">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Member</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No appointments found</td></tr>
                            ) : (
                                appointments.map(a => (
                                    <tr key={a._id}>
                                        <td>{new Date(a.date).toLocaleDateString()}</td>
                                        <td>{a.time}</td>
                                        <td>{a.memberID?.name || 'Unknown'}</td>
                                        <td>{a.type}</td>
                                        <td>
                                            <span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-error' : 'badge-info'}`}>
                                                {a.status}
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

export default Appointments;
