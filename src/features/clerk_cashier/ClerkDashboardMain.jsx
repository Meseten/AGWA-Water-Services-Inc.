// src/features/clerk_cashier/ClerkDashboardMain.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Banknote, FileSearch, Users, Clock, DollarSign, RotateCcw, Loader2, AlertTriangle, Info } from 'lucide-react';
import DashboardInfoCard from '../../components/ui/DashboardInfoCard.jsx'; // Corrected Path to actual filename
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';

const ClerkDashboardMain = ({ userData, showNotification, setActiveSection }) => {
    // ... component logic remains the same
    const [dashboardStats, setDashboardStats] = useState({
        paymentsTodayCount: 0,
        totalCollectedToday: 0,
        avgPaymentAmount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClerkStats = useCallback(async () => {
        if (!userData || !userData.uid) {
            setIsLoading(false);
            setError("Clerk user data is not available.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const newStats = {};
            let partialError = '';

            // This is a placeholder for a real data service call
            const paymentsResult = { success: true, data: { count: 5, totalAmount: 1250.75 } }; 

            if (paymentsResult.success && paymentsResult.data) {
                newStats.paymentsTodayCount = paymentsResult.data.count;
                newStats.totalCollectedToday = paymentsResult.data.totalAmount;
                newStats.avgPaymentAmount = paymentsResult.data.count > 0 ? paymentsResult.data.totalAmount / paymentsResult.data.count : 0;
            } else {
                partialError += "Today's payment data unavailable. ";
            }

            setDashboardStats(prev => ({ ...prev, ...newStats }));
            if (partialError) {
                setError(partialError.trim());
                showNotification("Some dashboard statistics for the clerk could not be loaded.", "warning");
            }

        } catch {
            const fetchErr = "Could not load clerk dashboard statistics. Please try refreshing.";
            setError(fetchErr);
            showNotification(fetchErr, "error");
        } finally {
            setIsLoading(false);
        }
    }, [userData, showNotification]);

    useEffect(() => {
        fetchClerkStats();
    }, [fetchClerkStats]);

    const quickActionCards = [
        { title: "Process Walk-in Payment", icon: Banknote, section: 'walkInPayments', description: "Record payments for customers paying in person at the counter.", color: "blue" },
        { title: "Search Account / Bill", icon: FileSearch, section: 'searchAccountOrBill', description: "Look up customer account details, outstanding bills, or payment history.", color: "teal" },
    ];

    if (isLoading) {
        return <LoadingSpinner message="Loading clerk dashboard..." className="mt-10 h-48" />;
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">Clerk / Cashier Dashboard</h2>
                        <p className="mt-1 text-indigo-100">Welcome, {userData.displayName || 'Clerk'}! Manage payments and customer inquiries.</p>
                    </div>
                     <button onClick={fetchClerkStats} className="mt-3 sm:mt-0 text-sm flex items-center bg-indigo-400 hover:bg-indigo-300 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-70 self-start sm:self-center" disabled={isLoading} title="Refresh Statistics">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                         <span className="ml-2 hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>
            
            {error && <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md text-center my-4 flex items-center justify-center gap-2"><Info size={16}/> {error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <DashboardInfoCard title="Payments Today" value={dashboardStats.paymentsTodayCount} icon={Banknote} borderColor="border-green-500" iconColor="text-green-500" />
                <DashboardInfoCard title="Total Collected Today" value={`₱${dashboardStats.totalCollectedToday.toFixed(2)}`} icon={DollarSign} borderColor="border-emerald-500" iconColor="text-emerald-500" />
                <DashboardInfoCard title="Avg. Payment Today" value={`₱${dashboardStats.avgPaymentAmount.toFixed(2)}`} icon={DollarSign} borderColor="border-teal-500" iconColor="text-teal-500" />
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-5 mt-8 pt-5 border-t border-gray-200">Primary Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActionCards.map((action) => (
                        <button key={action.section} onClick={() => setActiveSection(action.section)} className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300 ease-in-out text-left focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-opacity-75 group h-full flex flex-col`}>
                            <div className={`p-3 bg-${action.color}-100 rounded-full inline-block mb-3 self-start group-hover:scale-110 transition-transform`}>
                                <action.icon size={28} className={`text-${action.color}-600`} />
                            </div>
                            <h4 className={`text-lg font-semibold text-gray-800 group-hover:text-${action.color}-700 transition-colors`}>{action.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 leading-normal flex-grow">{action.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-5 bg-gray-50 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Clock size={20} className="mr-2 text-gray-500" /> Shift Summary / End-of-Day Tasks
                </h3>
                <p className="text-sm text-gray-500">
                    Remember to reconcile payments and prepare your end-of-day report.
                </p>
            </div>
        </div>
    );
};

export default ClerkDashboardMain;
