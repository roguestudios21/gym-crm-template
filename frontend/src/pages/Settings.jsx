import React, { useState } from 'react';
import { Save, Building, CreditCard, Bell, Shield } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation for Settings */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-4">
                            <ul className="menu bg-base-100 w-full rounded-box">
                                <li>
                                    <a
                                        className={activeTab === 'general' ? 'active' : ''}
                                        onClick={() => setActiveTab('general')}
                                    >
                                        <Building size={18} />
                                        General
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className={activeTab === 'billing' ? 'active' : ''}
                                        onClick={() => setActiveTab('billing')}
                                    >
                                        <CreditCard size={18} />
                                        Billing & Tax
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className={activeTab === 'notifications' ? 'active' : ''}
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <Bell size={18} />
                                        Notifications
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className={activeTab === 'security' ? 'active' : ''}
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <Shield size={18} />
                                        Security
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <form onSubmit={handleSave} className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b pb-2">General Settings</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Gym Name</span></label>
                                            <input type="text" className="input input-bordered w-full" defaultValue="Rogue Studios" />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Contact Email</span></label>
                                            <input type="email" className="input input-bordered w-full" defaultValue="contact@roguestudios.com" />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Phone Number</span></label>
                                            <input type="tel" className="input input-bordered w-full" defaultValue="+1 234 567 890" />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Website</span></label>
                                            <input type="url" className="input input-bordered w-full" defaultValue="https://roguestudios.com" />
                                        </div>
                                        <div className="form-control w-full md:col-span-2">
                                            <label className="label"><span className="label-text font-medium">Address</span></label>
                                            <textarea className="textarea textarea-bordered h-24" defaultValue="123 Fitness Blvd, Workout City, GY 10101"></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b pb-2">Billing & Tax Configuration</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Currency</span></label>
                                            <select className="select select-bordered w-full">
                                                <option>USD ($)</option>
                                                <option>INR (₹)</option>
                                                <option>EUR (€)</option>
                                            </select>
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Tax Name</span></label>
                                            <input type="text" className="input input-bordered w-full" defaultValue="GST" />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Tax Rate (%)</span></label>
                                            <input type="number" className="input input-bordered w-full" defaultValue="18" />
                                        </div>
                                        <div className="form-control w-full">
                                            <label className="label"><span className="label-text font-medium">Invoice Prefix</span></label>
                                            <input type="text" className="input input-bordered w-full" defaultValue="INV-" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b pb-2">Notification Preferences</h2>
                                    <div className="form-control">
                                        <label className="label cursor-pointer justify-start gap-4">
                                            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                            <span className="label-text">Email alerts for new members</span>
                                        </label>
                                    </div>
                                    <div className="form-control">
                                        <label className="label cursor-pointer justify-start gap-4">
                                            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                            <span className="label-text">Email alerts for new sales</span>
                                        </label>
                                    </div>
                                    <div className="form-control">
                                        <label className="label cursor-pointer justify-start gap-4">
                                            <input type="checkbox" className="toggle toggle-primary" />
                                            <span className="label-text">SMS alerts for appointments</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b pb-2">Security Settings</h2>
                                    <div className="form-control w-full max-w-md">
                                        <label className="label"><span className="label-text font-medium">Change Password</span></label>
                                        <input type="password" placeholder="Current Password" className="input input-bordered w-full mb-3" />
                                        <input type="password" placeholder="New Password" className="input input-bordered w-full mb-3" />
                                        <input type="password" placeholder="Confirm New Password" className="input input-bordered w-full" />
                                    </div>
                                </div>
                            )}

                            <div className="card-actions justify-end mt-6 pt-4 border-t">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
