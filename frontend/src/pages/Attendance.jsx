import React, { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, UserCheck } from 'lucide-react';
import api from '../api';

const Attendance = () => {
    const [currentAttendance, setCurrentAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentAttendance();
        fetchStats();
    }, []);

    const fetchCurrentAttendance = async () => {
        try {
            const res = await api.get('/attendance/current');
            setCurrentAttendance(res.data.members || []);
        } catch (error) {
            console.error('Failed to fetch current attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Get last 30 days stats
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const res = await api.get('/attendance/stats', {
                params: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (checkInTime) => {
        const now = new Date();
        const checkIn = new Date(checkInTime);
        const diffMs = now - checkIn;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Attendance</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-primary to-primary/80 text-primary-content shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Currently In Gym</p>
                                <h2 className="text-4xl font-bold mt-2">
                                    {currentAttendance.length}
                                </h2>
                            </div>
                            <Users size={48} className="opacity-60" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-accent to-accent/80 text-accent-content shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Visits (30d)</p>
                                <h2 className="text-4xl font-bold mt-2">
                                    {stats?.totalVisits || 0}
                                </h2>
                            </div>
                            <TrendingUp size={48} className="opacity-60" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-secondary to-secondary/80 text-secondary-content shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Avg. Duration</p>
                                <h2 className="text-4xl font-bold mt-2">
                                    {stats?.averageDuration ? Math.round(stats.averageDuration) + 'm' : '-'}
                                </h2>
                            </div>
                            <Clock size={48} className="opacity-60" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success to-success/80 text-success-content shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Peak Hour</p>
                                <h2 className="text-4xl font-bold mt-2">
                                    {stats?.peakHours?.[0] ? `${stats.peakHours[0]._id}:00` : '-'}
                                </h2>
                            </div>
                            <UserCheck size={48} className="opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Attendance */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Active Members</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : currentAttendance.length === 0 ? (
                        <div className="text-center py-12 text-base-content/60">
                            <Users size={64} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-semibold">No members currently in gym</p>
                            <p className="text-sm mt-2">Members will appear here when they check in</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>ID</th>
                                        <th>Check-in Time</th>
                                        <th>Duration</th>
                                        <th>Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAttendance.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                                                            {record.memberID?.profilePicture ? (
                                                                <img
                                                                    src={`http://localhost:4000${record.memberID.profilePicture}`}
                                                                    alt={record.memberID.name}
                                                                    className="rounded-full"
                                                                />
                                                            ) : (
                                                                <span className="text-xl font-bold">
                                                                    {record.memberID?.name?.charAt(0) || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{record.memberID?.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost">
                                                    {record.memberID?.memberID}
                                                </span>
                                            </td>
                                            <td>{formatTime(record.checkInTime)}</td>
                                            <td>
                                                <span className="badge badge-info badge-outline">
                                                    {getDuration(record.checkInTime)}
                                                </span>
                                            </td>
                                            <td>{record.memberID?.contact1 || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Biometric Integration Info */}
            <div className="alert alert-info mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 className="font-bold">Biometric Check-in</h3>
                    <div className="text-sm">Biometric attendance is managed through your fingerprint scanner device. Configure the scanner to send check-in data to <code className="bg-base-200 px-2 py-1 rounded">/api/attendance/checkin</code></div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
