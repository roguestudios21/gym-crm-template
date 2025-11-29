import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Users, Clock, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ClassView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchClass();
        fetchMembers();
    }, [id]);

    const fetchClass = async () => {
        try {
            const res = await api.get(`/classes/${id}`);
            setClassData(res.data);
        } catch (error) {
            console.error("Failed to fetch class", error);
            alert("Failed to load class details");
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members?status=active');
            setMembers(res.data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const handleBookMember = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;

        try {
            await api.post(`/classes/${id}/book`, {
                memberID: selectedMember,
                specificDate: bookingDate
            });
            fetchClass(); // Refresh list
            setSelectedMember('');
            alert("Member booked successfully!");
        } catch (error) {
            console.error("Booking failed", error);
            alert(error.response?.data?.error || "Booking failed");
        }
    };

    const handleCancelBooking = async (memberID) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await api.post(`/classes/${id}/cancel-booking`, {
                memberID,
                specificDate: bookingDate // This logic might need refinement for recurring vs specific dates
            });
            fetchClass();
        } catch (error) {
            console.error("Cancellation failed", error);
            alert("Failed to cancel booking");
        }
    };

    const getDayName = (dayIndex) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[dayIndex];
    };

    if (loading) return <div className="p-8 text-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (!classData) return <div className="p-8 text-center">Class not found</div>;

    // Filter bookings for display (simplified view)
    const activeBookings = classData.bookings.filter(b => b.status !== 'cancelled');

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/classes')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">{classData.name}</h1>
                    <div className="badge badge-primary">{classData.type}</div>
                </div>
                <button onClick={() => navigate(`/classes/edit/${id}`)} className="btn btn-outline">
                    Edit Class
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Class Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Users className="text-primary" />
                                <div>
                                    <p className="text-sm opacity-70">Trainer</p>
                                    <p className="font-semibold">{classData.trainerID?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="text-primary" />
                                <div>
                                    <p className="text-sm opacity-70">Schedule</p>
                                    <p className="font-semibold">
                                        {classData.schedule.daysOfWeek.map(d => getDayName(d)).join(', ')} @ {classData.schedule.time}
                                    </p>
                                    <p className="text-xs opacity-60">{classData.schedule.duration} mins</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="text-primary" />
                                <div>
                                    <p className="text-sm opacity-70">Location</p>
                                    <p className="font-semibold">{classData.location || 'Main Studio'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="text-primary" />
                                <div>
                                    <p className="text-sm opacity-70">Capacity</p>
                                    <p className="font-semibold">{activeBookings.length} / {classData.capacity}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm opacity-70 mb-1">Description</p>
                            <p>{classData.description}</p>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">No bookings yet</td>
                                        </tr>
                                    ) : (
                                        activeBookings.map((booking, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="font-semibold">{booking.memberID?.name}</div>
                                                    <div className="text-xs opacity-50">{booking.memberID?.contact1}</div>
                                                </td>
                                                <td>
                                                    <div className={`badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                                        {booking.status}
                                                    </div>
                                                </td>
                                                <td>
                                                    {booking.specificDate ? new Date(booking.specificDate).toLocaleDateString() : 'Recurring'}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.memberID._id)}
                                                        className="btn btn-ghost btn-xs text-error"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Booking Form */}
                <div className="space-y-6">
                    <div className="card bg-base-100 shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-4">Book Member</h2>
                        <form onSubmit={handleBookMember} className="space-y-4">
                            <div className="form-control">
                                <label className="label">Select Member</label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    required
                                >
                                    <option value="">Choose member...</option>
                                    {members.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label">Date</label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Book Spot
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassView;
