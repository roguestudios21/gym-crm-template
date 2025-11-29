import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, Calendar,
    ShoppingCart, FileText, HelpCircle, Package,
    TrendingUp, BarChart2, Bell, Settings
} from 'lucide-react';

import logo from '../assets/cindral_logo_user.png';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/members', icon: Users, label: 'Members' },
        { path: '/staff', icon: UserCheck, label: 'Staff' },
        { path: '/attendance', icon: UserCheck, label: 'Attendance' },
        { path: '/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/classes', icon: Calendar, label: 'Classes' },
        { path: '/products', icon: Package, label: 'Products' },
        { path: '/sales', icon: ShoppingCart, label: 'Sales' },
        { path: '/invoices', icon: FileText, label: 'Invoices' },
        { path: '/payments', icon: TrendingUp, label: 'Payments' },
        { path: '/reports', icon: BarChart2, label: 'Reports' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/enquiries', icon: HelpCircle, label: 'Enquiries' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="bg-base-100 w-64 min-h-screen border-r border-base-200 flex flex-col">
            <div className="p-6 border-b border-base-200">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Cindral" className="h-10 w-auto" />
                    <h1 className="text-xl font-bold text-primary flex items-center gap-1">
                        <span className="bg-primary text-primary-content px-2 py-0.5 rounded-lg text-sm">GYM</span> CRM
                    </h1>
                </div>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="menu bg-base-100 w-full p-0 gap-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                        ? 'bg-primary text-primary-content font-semibold shadow-sm'
                                        : 'hover:bg-base-200/70 text-base-content/80 hover:text-base-content'
                                    }`}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-base-200 text-xs text-base-content/50 text-center">
                &copy; 2025 Gym CRM
            </div>
        </div>
    );
};

export default Sidebar;
