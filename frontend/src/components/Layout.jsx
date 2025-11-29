import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

import logo from '../assets/cindral_watermark_user.png';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-base-200 relative">
            <Sidebar />
            <main className="flex-1 p-8 overflow-x-hidden relative z-10">
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Watermark */}
            <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none z-0">
                <img src={logo} alt="Cindral Watermark" className="h-24 w-auto grayscale" />
            </div>
        </div>
    );
};

export default Layout;
