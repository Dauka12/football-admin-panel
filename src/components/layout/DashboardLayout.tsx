import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import LanguageSwitcher from '../LanguageSwitcher';
import PerformanceDebugger from '../debug/PerformanceDebugger';
import { PermissionDebugger } from '../debug/PermissionDebugger';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Check authentication status and redirect if needed
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('mobile-sidebar');
            const toggle = document.getElementById('sidebar-toggle');

            if (
                isMobileSidebarOpen &&
                sidebar &&
                !sidebar.contains(event.target as Node) &&
                toggle &&
                !toggle.contains(event.target as Node)
            ) {
                setIsMobileSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileSidebarOpen]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileSidebarOpen]);

    return (
        <div className="flex h-screen bg-darkest-bg text-white font-inter">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <div className={`sidebar-container ${isMobileSidebarOpen ? 'open' : ''}`}>
                <div
                    id="mobile-sidebar"
                    className={`sidebar-panel ${isMobileSidebarOpen ? 'open' : ''} w-64`}
                >
                    <Sidebar isMobile onClose={() => setIsMobileSidebarOpen(false)} />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top navbar */}
                <header className="bg-card-bg shadow-md h-14 flex items-center px-4">
                    <button
                        id="sidebar-toggle"
                        className="md:hidden mr-4 text-white p-1 rounded-md hover:bg-darkest-bg transition-colors duration-200"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <h1 className="font-semibold flex-1">{t('appTitle')}</h1>

                    {/* Language Switcher */}
                    <LanguageSwitcher />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </div>

            {/* Performance Debugger */}
            <PerformanceDebugger />
            
            {/* Permission Debugger */}
            <PermissionDebugger />
        </div>
    );
};

export default DashboardLayout;
