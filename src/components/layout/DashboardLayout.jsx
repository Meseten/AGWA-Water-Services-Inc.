import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import PageLoader from '../ui/PageLoader.jsx';
import CustomerDashboardMain from '../../features/customer/CustomerDashboardMain.jsx';
import CustomerBillsSection from '../../features/customer/CustomerBillsSection.jsx';
import MyProfileSection from '../../features/common/MyProfileSection.jsx';
import ReportIssueSection from '../../features/common/ReportIssuesSection.jsx';
import FaqsSection from '../../features/common/FaqsSection.jsx';
import AboutUsSection from '../../features/common/AboutUsSection.jsx';
import ContactUsSection from '../../features/common/ContactUs.jsx';
import AdminDashboardMain from '../../features/admin/AdminDashboardMain.jsx';
import UserManagementSection from '../../features/admin/UserManagementSection.jsx';
import SupportTicketManagementSection from '../../features/admin/SupportTicketManagementSection.jsx';
import SystemSettingsSection from '../../features/admin/SystemSettingsSection.jsx';
import AnnouncementManager from '../../features/admin/AnnouncementManager.jsx';
import StatisticsDashboard from '../../features/admin/StatisticsDashboard.jsx';
import MeterReadingEditor from '../../features/admin/MeterReadingEditor.jsx';
import RouteManagementSection from '../../features/admin/RouteManagementSection.jsx';
import BatchBillingSection from '../../features/admin/BatchBillingSection.jsx';
import MeterReaderDashboardMain from '../../features/meter_reader/MeterReaderDashboardMain.jsx';
import AssignedRoutesSection from '../../features/meter_reader/AssignedRoutesSection.jsx';
import MeterReadingForm from '../../features/meter_reader/MeterReadingForm.jsx';
import SearchCustomerProfileMeterReader from '../../features/meter_reader/SearchCustomerProfileMeterReader.jsx';
import ClerkDashboardMain from '../../features/clerk_cashier/ClerkDashboardMain.jsx';
import WalkInPaymentSection from '../../features/clerk_cashier/WalkInPaymentSection.jsx';
import SearchAccountOrBillSection from '../../features/clerk_cashier/SearchAccountOrBillSection.jsx';
import MyTicketsSection from '../../features/customer/MyTicketsSection.jsx';
import NotFound from '../core/NotFound.jsx';
import ChatbotModal from '../ui/ChatbotModal.jsx';
import { MessageSquare as ChatIcon } from 'lucide-react';
import * as billingService from '../../services/billingService.js';
import * as userUtils from '../../utils/userUtils.js';
import { onSnapshot, doc } from 'firebase/firestore';
import { systemSettingsDocumentPath } from '../../firebase/firestorePaths.js';

const DashboardLayout = ({ user, userData, setUserData, handleLogout, showNotification, auth, db }) => {
    const [activeSection, setActiveSection] = useState('mainDashboard');
    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        if (!db) return;
        const settingsRef = doc(db, systemSettingsDocumentPath());
        const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const settingsData = docSnap.data();
                if (settingsData.isBannerEnabled && settingsData.portalAnnouncement) {
                    setBanner({ text: settingsData.portalAnnouncement });
                } else {
                    setBanner(null);
                }
            } else {
                setBanner(null);
            }
        });
        return () => unsubscribe();
    }, [db]);

    const handleNavigate = (section) => {
        setActiveSection(section);
        if (isSidebarOpenMobile) setIsSidebarOpenMobile(false);
    };

    const navItems = [
        { name: 'Dashboard', iconName: 'Home', section: 'mainDashboard', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
        { name: 'My Profile', iconName: 'UserCog', section: 'myProfile', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
        { name: 'View Announcements', iconName: 'Megaphone', section: 'viewAnnouncements', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
        { name: 'My Bills & Payments', iconName: 'FileText', section: 'myBills', roles: ['customer'] },
        { name: 'My Support Tickets', iconName: 'MessageSquare', section: 'myTickets', roles: ['customer', 'clerk_cashier', 'meter_reader'] },
        { name: 'Report an Issue', iconName: 'AlertTriangle', section: 'reportIssue', roles: ['customer', 'meter_reader', 'clerk_cashier'] },
        { name: 'User Management', iconName: 'Users', section: 'userManagement', roles: ['admin'] },
        { name: 'Batch Billing', iconName: 'FileText', section: 'batchBilling', roles: ['admin'] },
        { name: 'Route Management', iconName: 'Map', section: 'routeManagement', roles: ['admin'] },
        { name: 'Support Tickets', iconName: 'MessageSquare', section: 'supportTickets', roles: ['admin'] },
        { name: 'Manage Announcements', iconName: 'Edit', section: 'manageAnnouncements', roles: ['admin'] },
        { name: 'System Analytics', iconName: 'BarChart3', section: 'systemAnalytics', roles: ['admin'] },
        { name: 'Meter Reading Mgt.', iconName: 'Gauge', section: 'editMeterReadingsAdmin', roles: ['admin'] },
        { name: 'System Settings', iconName: 'Settings', section: 'systemSettings', roles: ['admin'] },
        { name: 'Assigned Routes', iconName: 'Map', section: 'assignedRoutes', roles: ['meter_reader'] },
        { name: 'Submit Reading', iconName: 'ClipboardEdit', section: 'searchAndSubmitReading', roles: ['meter_reader'] },
        { name: 'Search Customer', iconName: 'Search', section: 'searchCustomerMeterReader', roles: ['meter_reader'] },
        { name: 'Process Walk-in Payment', iconName: 'Banknote', section: 'walkInPayments', roles: ['clerk_cashier'] },
        { name: 'Search Account / Bill', iconName: 'FileSearch', section: 'searchAccountOrBill', roles: ['clerk_cashier'] },
        { name: 'FAQs', iconName: 'HelpCircle', section: 'faqs', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
        { name: 'About Us', iconName: 'Info', section: 'aboutUs', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
        { name: 'Contact Us', iconName: 'PhoneCall', section: 'contactUs', roles: ['customer', 'meter_reader', 'admin', 'clerk_cashier'] },
    ];

    const availableNavItems = navItems.filter(item => userData?.role && item.roles.includes(userData.role));
    
    const renderSection = () => {
        const sectionProps = { user, userData, setUserData, auth, db, showNotification, billingService: billingService.calculateBillDetails, determineServiceTypeAndRole: userUtils.determineServiceTypeAndRole, setActiveSection: handleNavigate };

        switch (activeSection) {
            case 'mainDashboard':
                if (userData.role === 'customer') return <CustomerDashboardMain {...sectionProps} />;
                if (userData.role === 'admin') return <AdminDashboardMain {...sectionProps} />;
                if (userData.role === 'meter_reader') return <MeterReaderDashboardMain {...sectionProps} />;
                if (userData.role === 'clerk_cashier') return <ClerkDashboardMain {...sectionProps} />;
                return <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            
            case 'myProfile': return <MyProfileSection {...sectionProps} />;
            case 'reportIssue': return <ReportIssueSection {...sectionProps} />;
            case 'faqs': return <FaqsSection {...sectionProps} />;
            case 'aboutUs': return <AboutUsSection {...sectionProps} />;
            case 'contactUs': return <ContactUsSection {...sectionProps} />;
            case 'viewAnnouncements': return <AnnouncementManager {...sectionProps} viewOnly={true} />;
            case 'myBills': return userData.role === 'customer' ? <CustomerBillsSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'myTickets': return ['customer', 'clerk_cashier', 'meter_reader'].includes(userData.role) ? <MyTicketsSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'userManagement': return userData.role === 'admin' ? <UserManagementSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'batchBilling': return userData.role === 'admin' ? <BatchBillingSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'routeManagement': return userData.role === 'admin' ? <RouteManagementSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'supportTickets': return userData.role === 'admin' ? <SupportTicketManagementSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'manageAnnouncements': return userData.role === 'admin' ? <AnnouncementManager {...sectionProps} viewOnly={false} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'systemAnalytics': return userData.role === 'admin' ? <StatisticsDashboard {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'editMeterReadingsAdmin': return userData.role === 'admin' ? <MeterReadingEditor {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'systemSettings': return userData.role === 'admin' ? <SystemSettingsSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'assignedRoutes': return userData.role === 'meter_reader' ? <AssignedRoutesSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'searchAndSubmitReading': return userData.role === 'meter_reader' ? <MeterReadingForm {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'searchCustomerMeterReader': return userData.role === 'meter_reader' ? <SearchCustomerProfileMeterReader {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'walkInPayments': return userData.role === 'clerk_cashier' ? <WalkInPaymentSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            case 'searchAccountOrBill': return userData.role === 'clerk_cashier' ? <SearchAccountOrBillSection {...sectionProps} /> : <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
            
            default: return <NotFound onNavigateHome={() => handleNavigate('mainDashboard')} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            <Sidebar userData={userData} navItems={availableNavItems} activeSection={activeSection} onNavigate={handleNavigate} onLogout={handleLogout} isMobileOpen={isSidebarOpenMobile} onMobileClose={() => setIsSidebarOpenMobile(false)} />
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <main className="flex-grow overflow-y-auto">
                    {banner && (
                        <div className="sticky top-0 z-20 bg-yellow-400 text-center p-2 text-yellow-900 font-semibold shadow-md text-sm">
                           {banner.text}
                        </div>
                    )}
                    <div className="p-4 sm:p-6 lg:p-8">
                        {renderSection()}
                    </div>
                </main>
            </div>
            <button
                onClick={() => setIsChatbotOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-200 ease-in-out z-50"
                aria-label="Open Chatbot"
            >
                <ChatIcon size={28} />
            </button>
            {isChatbotOpen && (
                <ChatbotModal 
                    isOpen={isChatbotOpen}
                    onClose={() => setIsChatbotOpen(false)}
                    userData={userData}
                    showNotification={showNotification}
                    setActiveDashboardSection={handleNavigate}
                />
            )}
        </div>
    );
};

export default DashboardLayout;