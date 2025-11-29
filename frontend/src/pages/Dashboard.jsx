import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Clock,
    UserCheck,
    ArrowRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeMembers: 0,
        totalRevenue: 0,
        todayAppointments: 0,
        currentAttendance: 0
    });
    const [expiringMembers, setExpiringMembers] = useState([]);
    const [todayAppointmentsList, setTodayAppointmentsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [membersRes, salesRes, appointmentsRes, attendanceRes, expiringRes] = await Promise.all([
                api.get('/members?status=active'),
                api.get('/sales/report'),
                api.get('/appointments'),
                api.get('/attendance/current'),
                api.get('/members/expiring/list')
            ]);

            // Filter today's appointments
            const today = new Date().toISOString().split('T')[0];
            const todaysApps = appointmentsRes.data.filter(app =>
                app.date && app.date.startsWith(today)
            );

            setStats({
                activeMembers: membersRes.data.length,
                totalRevenue: salesRes.data.totalRevenue || 0,
                todayAppointments: todaysApps.length,
                currentAttendance: attendanceRes.data.count || 0
            });

            setTodayAppointmentsList(todaysApps.slice(0, 5)); // Show top 5
            setExpiringMembers(expiringRes.data.slice(0, 5)); // Show top 5

        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for chart (replace with real sales history if available)
    const data = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/attendance')} className="btn btn-primary gap-2">
                        <UserCheck size={18} /> Check-In
                    </button>
                    <button onClick={() => navigate('/sales/new')} className="btn btn-outline gap-2">
                        <DollarSign size={18} /> New Sale
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-base-100 shadow-xl p-6 flex-row items-center gap-4 cursor-pointer hover:shadow-2xl transition-all" onClick={() => navigate('/members')}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-blue-50 text-blue-600">
                        <Users />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium">Active Members</h3>
                        <p className="text-2xl font-bold text-base-content">{stats.activeMembers}</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl p-6 flex-row items-center gap-4 cursor-pointer hover:shadow-2xl transition-all" onClick={() => navigate('/attendance')}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-green-50 text-green-600">
                        <UserCheck />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium">Currently In Gym</h3>
                        <p className="text-2xl font-bold text-base-content">{stats.currentAttendance}</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl p-6 flex-row items-center gap-4 cursor-pointer hover:shadow-2xl transition-all" onClick={() => navigate('/appointments')}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-purple-50 text-purple-600">
                        <Calendar />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium">Today's Appts</h3>
                        <p className="text-2xl font-bold text-base-content">{stats.todayAppointments}</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl p-6 flex-row items-center gap-4 cursor-pointer hover:shadow-2xl transition-all" onClick={() => navigate('/sales')}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-orange-50 text-orange-600">
                        <TrendingUp />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-500 font-medium">Total Revenue</h3>
                        <p className="text-2xl font-bold text-base-content">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="card bg-base-100 shadow-xl p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Revenue Overview</h3>
                        <select className="select select-bordered select-sm">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                    {/* Expiring Memberships */}
                    <div className="card bg-base-100 shadow-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <AlertCircle size={20} className="text-warning" />
                                Expiring Soon
                            </h3>
                            <button onClick={() => navigate('/members')} className="btn btn-ghost btn-xs">View All</button>
                        </div>
                        <div className="space-y-4">
                            {expiringMembers.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No memberships expiring soon</p>
                            ) : (
                                expiringMembers.map(member => (
                                    <div key={member._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral-focus text-neutral-content rounded-full w-8 h-8">
                                                    <span className="text-xs">{member.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {member.membership?.endDate ? new Date(member.membership.endDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-xs btn-outline btn-warning"
                                            onClick={() => navigate(`/members/edit/${member._id}`)}
                                        >
                                            Renew
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Today's Appointments */}
                    <div className="card bg-base-100 shadow-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock size={20} className="text-primary" />
                                Today's Schedule
                            </h3>
                            <button onClick={() => navigate('/appointments')} className="btn btn-ghost btn-xs">View All</button>
                        </div>
                        <div className="space-y-4">
                            {todayAppointmentsList.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No appointments today</p>
                            ) : (
                                todayAppointmentsList.map(app => (
                                    <div key={app._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-sm">{app.time} - {app.memberID?.name}</p>
                                            <p className="text-xs text-gray-500">{app.sessionType?.name || app.type || 'General'}</p>
                                        </div>
                                        <div className={`badge ${app.status === 'completed' ? 'badge-success' : 'badge-ghost'} badge-xs`}>
                                            {app.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
