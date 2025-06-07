// src/components/layout/Sidebar.jsx
import React from 'react';
import {
    Home, UserCog, FileText, AlertTriangle, Users, MessageSquare, Settings, HelpCircle, Info, PhoneCall,
    LogOut, ShieldCheck, Megaphone, BarChart3, Edit, Gauge, Map, ClipboardEdit, Search, Banknote, FileSearch
} from 'lucide-react';

const iconMap = {
    Home, UserCog, FileText, AlertTriangle, Users, MessageSquare, Settings, HelpCircle, Info, PhoneCall,
    LogOut, ShieldCheck, Megaphone, BarChart3, Edit, Gauge, Map, ClipboardEdit, Search, Banknote, FileSearch,
};

const Sidebar = ({
    userData,
    navItems,
    activeSection,
    onNavigate,
    onLogout,
    isMobileOpen,
    onMobileClose
}) => {
    const placeholderPhoto = `https://placehold.co/40x40/FFFFFF/3B82F6?text=${(userData.displayName || userData.email || 'U').charAt(0).toUpperCase()}`;

    const sidebarContent = (
        <div className="h-full flex flex-col bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-2xl">
            <div className="p-5 pt-6 text-center border-b border-blue-600">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">AGWA</h1>
                <p className="text-xs text-blue-200 font-light mt-0.5 italic">Ensuring Clarity, Sustaining Life.</p>
            </div>

            <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
                {navItems.map(item => {
                    const IconComponent = iconMap[item.iconName] || HelpCircle;
                    const isActive = activeSection === item.section;
                    return (
                        <button
                            key={item.name}
                            onClick={() => onNavigate(item.section)}
                            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-sky-300
                                ${isActive
                                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                                    : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:pl-4'
                                }`}
                            title={item.name}
                        >
                            <IconComponent size={20} className={`${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                            <span className="truncate">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-blue-600">
                <div className="flex items-center mb-3 p-2.5 bg-blue-700/60 rounded-lg shadow">
                    <img
                        src={userData.photoURL || placeholderPhoto}
                        alt="User"
                        className="h-10 w-10 rounded-full border-2 border-blue-400 object-cover bg-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderPhoto; }}
                    />
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold leading-tight truncate text-white" title={userData.displayName || userData.email}>
                            {userData.displayName || userData.email}
                        </p>
                        <p className="text-xs text-blue-200 leading-tight capitalize truncate" title={`Role: ${userData.role}`}>
                           Role: {userData.role?.replace('_', ' ') || 'N/A'}
                        </p>
                         <p className="text-xs text-blue-300 leading-tight truncate" title={`Account: ${userData.accountNumber}`}>
                            Acc: {userData.accountNumber || 'N/A'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div
                className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out lg:hidden
                    ${isMobileOpen ? 'translate-x-0 bg-black bg-opacity-50' : '-translate-x-full'}`}
                onClick={onMobileClose}
            >
                <div
                    className="w-64 h-full shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {sidebarContent}
                </div>
            </div>
            <aside className="hidden lg:block w-64 fixed top-0 left-0 h-full z-30">
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;