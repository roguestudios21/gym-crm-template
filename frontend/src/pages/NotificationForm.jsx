import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, ArrowLeft, Users } from 'lucide-react';

const NotificationForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [mode, setMode] = useState('single'); // 'single' or 'bulk'

    const [formData, setFormData] = useState({
        recipientID: '',
        type: 'email',
        subject: '',
        message: '',
        scheduledFor: ''
    });

    const [bulkData, setBulkData] = useState({
        criteria: { status: 'active' }, // Default criteria
        type: 'email',
        subject: '',
        message: '',
        scheduledFor: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members?status=active');
            setMembers(res.data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBulkChange = (e) => {
        setBulkData({ ...bulkData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'single') {
                await api.post('/notifications/send', formData);
            } else {
                await api.post('/notifications/bulk-send', bulkData);
            }
            alert("Notification sent/scheduled successfully!");
            navigate('/notifications');
        } catch (error) {
            console.error("Failed to send notification", error);
            alert("Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/notifications')} className="btn btn-outline btn-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">Send Notification</h1>
                </div>
            </div>

            <div className="tabs tabs-boxed mb-6 w-fit">
                <a
                    className={`tab ${mode === 'single' ? 'tab-active' : ''}`}
                    onClick={() => setMode('single')}
                >
                    Single Recipient
                </a>
                <a
                    className={`tab ${mode === 'bulk' ? 'tab-active' : ''}`}
                    onClick={() => setMode('bulk')}
                >
                    Bulk Send
                </a>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 max-w-2xl">
                <div className="space-y-6">
                    {/* Recipient Selection */}
                    {mode === 'single' ? (
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Recipient</span>
                            </label>
                            <select
                                name="recipientID"
                                value={formData.recipientID}
                                onChange={handleChange}
                                required
                                className="select select-bordered w-full"
                            >
                                <option value="">Select Member</option>
                                {members.map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            <Users size={20} />
                            <span>Bulk sending will target all <strong>Active Members</strong> currently.</span>
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Type</span>
                        </label>
                        <select
                            name="type"
                            value={mode === 'single' ? formData.type : bulkData.type}
                            onChange={mode === 'single' ? handleChange : handleBulkChange}
                            className="select select-bordered w-full"
                        >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                    </div>

                    {/* Subject (Email only) */}
                    {(mode === 'single' ? formData.type : bulkData.type) === 'email' && (
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Subject</span>
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={mode === 'single' ? formData.subject : bulkData.subject}
                                onChange={mode === 'single' ? handleChange : handleBulkChange}
                                required
                                className="input input-bordered w-full"
                                placeholder="Email Subject"
                            />
                        </div>
                    )}

                    {/* Message */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Message</span>
                        </label>
                        <textarea
                            name="message"
                            value={mode === 'single' ? formData.message : bulkData.message}
                            onChange={mode === 'single' ? handleChange : handleBulkChange}
                            required
                            className="textarea textarea-bordered h-32"
                            placeholder="Type your message here..."
                        ></textarea>
                    </div>

                    {/* Schedule (Optional) */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Schedule For (Optional)</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="scheduledFor"
                            value={mode === 'single' ? formData.scheduledFor : bulkData.scheduledFor}
                            onChange={mode === 'single' ? handleChange : handleBulkChange}
                            className="input input-bordered w-full"
                        />
                        <label className="label">
                            <span className="label-text-alt">Leave blank to send immediately</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => navigate('/notifications')} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Send size={18} />
                            {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NotificationForm;
