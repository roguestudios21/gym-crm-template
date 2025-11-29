import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, [filterType]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            let url = '/notifications/history';
            // Note: Backend might need query param support for filtering, 
            // but we can filter client-side for now if needed.
            // Backend returns { notifications: [], pagination: {} }
            const res = await api.get(url);
            let data = res.data.notifications || [];
            if (filterType) {
                data = data.filter(n => n.type === filterType);
            }
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircle size={16} className="text-success" />;
            case 'failed': return <XCircle size={16} className="text-error" />;
            case 'pending': return <Clock size={16} className="text-warning" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Communications</h1>
                <button
                    onClick={() => navigate('/notifications/new')}
                    className="btn btn-primary gap-2"
                >
                    <Send size={20} />
                    Send Notification
                </button>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                    <span className="font-medium">Filter by Type:</span>
                    <div className="btn-group">
                        <button
                            className={`btn btn-sm ${filterType === '' ? 'btn-active' : ''}`}
                            onClick={() => setFilterType('')}
                        >
                            All
                        </button>
                        <button
                            className={`btn btn-sm ${filterType === 'email' ? 'btn-active' : ''}`}
                            onClick={() => setFilterType('email')}
                        >
                            Email
                        </button>
                        <button
                            className={`btn btn-sm ${filterType === 'sms' ? 'btn-active' : ''}`}
                            onClick={() => setFilterType('sms')}
                        >
                            SMS
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="card bg-base-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Subject / Message</th>
                                <th>Recipient</th>
                                <th>Scheduled / Sent</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-base-content/60">
                                        No notifications found
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif._id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {notif.type === 'email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                                                <span className="uppercase text-xs font-bold">{notif.type}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-semibold">{notif.subject || '(No Subject)'}</div>
                                            <div className="text-xs opacity-60 truncate max-w-xs">{notif.message}</div>
                                        </td>
                                        <td>
                                            {notif.recipientID ? (
                                                <div>
                                                    <div className="font-medium">{notif.recipientID.name}</div>
                                                    <div className="text-xs opacity-50">{notif.recipientID.email || notif.recipientID.contact1}</div>
                                                </div>
                                            ) : (
                                                <span className="italic opacity-50">Unknown Recipient</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                {new Date(notif.sentAt || notif.scheduledFor).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(notif.status)}
                                                <span className="capitalize">{notif.status}</span>
                                            </div>
                                            {notif.errorMessage && (
                                                <div className="text-xs text-error mt-1 max-w-xs truncate" title={notif.errorMessage}>
                                                    {notif.errorMessage}
                                                </div>
                                            )}
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

export default Notifications;
