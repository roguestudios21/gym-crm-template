import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const AppointmentForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        memberID: '',
        date: '',
        time: '',
        sessionType: null,  // { name, planID }
        staffID: '',
        notes: ''
    });
    const [members, setMembers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [availableSessions, setAvailableSessions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSession, setLoadingSession] = useState(false);

    useEffect(() => {
        fetchMembers();
        fetchStaff();
    }, []);

    useEffect(() => {
        if (formData.memberID) {
            fetchAvailableSessions(formData.memberID);
        } else {
            setAvailableSessions(null);
        }
    }, [formData.memberID]);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members?status=active');
            setMembers(res.data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const fetchAvailableSessions = async (memberID) => {
        setLoadingSession(true);
        try {
            const res = await api.get(`/appointments/available-sessions/${memberID}`);
            setAvailableSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch available sessions", error);
            setAvailableSessions(null);
        } finally {
            setLoadingSession(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSessionTypeChange = (e) => {
        const selectedSessionName = e.target.value;

        if (!selectedSessionName) {
            setFormData({ ...formData, sessionType: null });
            return;
        }

        // Find session in available list (either from sessionBalance or plan)
        const sessionType = availableSessions?.sessionTypes.find(
            st => st.name === selectedSessionName
        );

        if (sessionType) {
            setFormData({
                ...formData,
                sessionType: {
                    name: sessionType.name,
                    // planID is optional now as sessions can come from packs
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/appointments/add', formData);
            navigate('/appointments');
        } catch (error) {
            console.error("Failed to create appointment", error);
            const errorMsg = error.response?.data?.error || "Failed to create appointment";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/appointments')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">New Appointment</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Member Selection */}
                <div className="card bg-base-100 shadow-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Member Information</h2>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Select Member</span>
                        </label>
                        <select
                            required
                            name="memberID"
                            value={formData.memberID}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">Choose a member...</option>
                            {members.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.memberID})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Session Info Display */}
                    {formData.memberID && (
                        <div className="mt-6">
                            {loadingSession ? (
                                <div className="flex items-center gap-2 text-base-content/60">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Loading session information...
                                </div>
                            ) : availableSessions ? (
                                <div className="alert alert-info">
                                    <CheckCircle size={20} />
                                    <div>
                                        <p className="font-semibold">Available Sessions</p>
                                        {availableSessions.sessionTypes.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm mt-1">
                                                {availableSessions.sessionTypes.map((st, idx) => (
                                                    <li key={idx}>
                                                        {st.name}: {st.balance} remaining
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm">No active sessions found.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <AlertCircle size={20} />
                                    <span>No active sessions found for this member</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Appointment Details */}
                <div className="card bg-base-100 shadow-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Appointment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Date</span>
                            </label>
                            <input
                                required
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Time</span>
                            </label>
                            <input
                                required
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Session Type Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Session Type</span>
                            </label>
                            <select
                                name="sessionType"
                                value={formData.sessionType?.name || ''}
                                onChange={handleSessionTypeChange}
                                className="select select-bordered w-full"
                                disabled={!availableSessions || availableSessions.sessionTypes?.length === 0}
                            >
                                <option value="">General Appointment</option>
                                {availableSessions?.sessionTypes?.map((session, idx) => (
                                    <option key={idx} value={session.name}>
                                        {session.name} ({session.balance} remaining)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Trainer/Staff Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Assigned Trainer (Optional)</span>
                            </label>
                            <select
                                name="staffID"
                                value={formData.staffID}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="">No specific trainer</option>
                                {staff.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="form-control w-full md:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium">Notes</span>
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="textarea textarea-bordered h-24"
                                placeholder="Additional notes or requirements..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/appointments')} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || !formData.memberID}>
                        <Save size={18} />
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
