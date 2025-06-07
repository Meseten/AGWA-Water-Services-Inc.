import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Users, MessageSquare, FileText, AlertTriangle, RotateCcw, Megaphone, Loader2, Info } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import DashboardInfoCard from "../../components/ui/DashboardInfoCard.jsx";
import * as DataService from "../../services/dataService.js";
import { db } from "../../firebase/firebaseConfig.js";

const StatisticsDashboard = ({ showNotification = console.log }) => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // DEFINITIVE FIX: Use Promise.allSettled to allow partial data loading.
            const results = await Promise.allSettled([
                DataService.getUsersStats(db),
                DataService.getTicketsStats(db),
                DataService.getAnnouncementsStats(db),
                // This service is complex and might not be implemented, so handle its failure gracefully.
                DataService.getBillingCycleStats(db, new Date().getFullYear(), new Date().getMonth() + 1),
            ]);

            const [usersResult, ticketsResult, announcementsResult, billsResult] = results;
            
            const newStats = {};
            const failedSources = [];

            if (usersResult.status === 'fulfilled' && usersResult.value.success) {
                newStats.totalUsers = usersResult.value.data.total;
                newStats.usersByRole = usersResult.value.data.byRole;
            } else {
                failedSources.push('Users');
                console.error("Failed to fetch users stats:", usersResult.reason || usersResult.value.error);
            }
            
            if (ticketsResult.status === 'fulfilled' && ticketsResult.value.success) {
                newStats.openTickets = ticketsResult.value.data.open;
            } else {
                failedSources.push('Tickets');
                 console.error("Failed to fetch tickets stats:", ticketsResult.reason || ticketsResult.value.error);
            }
            
            if (announcementsResult.status === 'fulfilled' && announcementsResult.value.success) {
                newStats.activeAnnouncements = announcementsResult.value.data.active;
            } else {
                failedSources.push('Announcements');
                console.error("Failed to fetch announcements stats:", announcementsResult.reason || announcementsResult.value.error);
            }

            if (billsResult.status === 'fulfilled' && billsResult.value.success) {
                newStats.totalBilled = billsResult.value.data.totalBilled;
            } else {
                failedSources.push('Billing');
                console.error("Failed to fetch billing stats:", billsResult.reason || billsResult.value.error);
            }

            // DEFINITIVE FIX: Set error state only if some data sources failed to load.
            if (failedSources.length > 0) {
                 const errorMessage = `Could not load data for: ${failedSources.join(', ')}. Displaying available data.`;
                 setError(errorMessage);
                 showNotification(errorMessage, "warning");
            }

            setStats(newStats);

        } catch (e) {
            const criticalError = "A critical error occurred while fetching statistics.";
            setError(criticalError);
            showNotification(criticalError, "error");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    if (isLoading) {
        return <LoadingSpinner message="Loading system analytics..." className="mt-10 h-64" />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <BarChart3 size={30} className="mr-3 text-orange-600" /> System Analytics
                </h2>
                <button onClick={fetchStatistics} disabled={isLoading} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg border border-gray-300">
                    {isLoading ? <Loader2 size={16} className="animate-spin mr-2"/> : <RotateCcw size={16} className="mr-2" />}
                     Refresh
                </button>
            </div>
            
            {/* DEFINITIVE FIX: The error div will now correctly display when there's a partial data failure. */}
            {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 flex items-center" role="alert"><Info size={20} className="mr-3" /><p>{error}</p></div>}

            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardInfoCard title="Total Users" value={stats.totalUsers ?? 'N/A'} icon={Users} borderColor="border-blue-500" iconColor="text-blue-500" />
                    <DashboardInfoCard title="Open Tickets" value={stats.openTickets ?? 'N/A'} icon={AlertTriangle} borderColor="border-red-500" iconColor="text-red-500" />
                    <DashboardInfoCard title="Active Announcements" value={stats.activeAnnouncements ?? 'N/A'} icon={Megaphone} borderColor="border-teal-500" iconColor="text-teal-500" />
                    <DashboardInfoCard title="Billed This Cycle" value={stats.totalBilled ? `₱${stats.totalBilled.toFixed(2)}` : 'N/A'} icon={FileText} borderColor="border-green-500" iconColor="text-green-500" />
                </div>
            ) : !isLoading && !error ? (
                <div className="text-center py-10 text-gray-500">No statistics available.</div>
            ) : null}
            
            {stats?.usersByRole && (
                 <div className="mt-8 pt-6 border-t border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4">Users by Role</h3>
                     <div className="flex flex-wrap gap-4">
                         {Object.entries(stats.usersByRole).map(([role, count]) => (
                             <div key={role} className="flex-1 min-w-[150px] bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                 <p className="text-sm text-gray-500 capitalize">{role.replace('_', ' ')}</p>
                                 <p className="text-2xl font-bold text-gray-800">{count}</p>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
        </div>
    );
};

export default StatisticsDashboard;