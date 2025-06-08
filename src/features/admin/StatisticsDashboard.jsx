import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Users, MessageSquare, FileText, AlertTriangle, RotateCcw, Megaphone, Loader2, Info, Printer, DollarSign, Calendar, CheckCircle } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import DashboardInfoCard from "../../components/ui/DashboardInfoCard.jsx";
import * as DataService from "../../services/dataService.js";
import { db } from "../../firebase/firebaseConfig.js";

const Chart = ({ data, title, formatLabel, dataKey, color = "bg-blue-500", hoverColor = "hover:bg-blue-600" }) => {
    if(!data || Object.keys(data).length === 0) {
        return (
            <div className="w-full p-4 bg-gray-50 rounded-lg border flex items-center justify-center h-full min-h-[262px]">
                <p className="text-sm text-gray-500">{title} - No data available.</p>
            </div>
        );
    }

    const values = Object.values(data);
    const maxValue = Math.max(...values, 1);
    const chartHeight = 150;

    return (
        <div className="w-full p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
            <div className="flex justify-between items-end h-[180px] space-x-2">
                {Object.entries(data).map(([key, value]) => {
                    const barHeight = (value / maxValue) * chartHeight;
                    return (
                        <div key={key} className="flex flex-col items-center flex-1 h-full justify-end group">
                            <div className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">{dataKey === 'currency' ? `₱${Math.round(value)}` : value}</div>
                            <div 
                                className={`w-full ${color} ${hoverColor} transition-all duration-200 rounded-t-sm`}
                                style={{ height: `${barHeight}px` }}
                                title={`${formatLabel(key)}: ${dataKey === 'currency' ? `₱${value.toFixed(2)}` : value}`}
                            ></div>
                            <div className="text-xs font-medium text-gray-500 mt-1 border-t border-gray-300 w-full text-center pt-1">{formatLabel(key)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatisticsDashboard = ({ showNotification = console.log, userData }) => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const results = await Promise.allSettled([
                DataService.getUsersStats(db),
                DataService.getTicketsStats(db),
                DataService.getRevenueStats(db),
                DataService.getDailyRevenueStats(db, 30),
                DataService.getPaymentDayOfWeekStats(db)
            ]);

            const [usersResult, ticketsResult, revenueResult, dailyRevenueResult, paymentDayResult] = results;
            
            const newStats = {};
            if (usersResult.status === 'fulfilled' && usersResult.value.success) newStats.usersByRole = usersResult.value.data.byRole;
            if (ticketsResult.status === 'fulfilled' && ticketsResult.value.success) newStats.ticketStats = ticketsResult.value.data;
            if (revenueResult.status === 'fulfilled' && revenueResult.value.success) newStats.monthlyRevenue = revenueResult.value.data;
            if (dailyRevenueResult.status === 'fulfilled' && dailyRevenueResult.value.success) newStats.dailyRevenue = dailyRevenueResult.value.data;
            if (paymentDayResult.status === 'fulfilled' && paymentDayResult.value.success) newStats.paymentDayStats = paymentDayResult.value.data;
            
            setStats(newStats);
        } catch (e) {
            setError("A critical error occurred while fetching statistics.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const handlePrintReport = () => {
        const printContent = document.getElementById('stats-print-area').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=1000');
        printWindow.document.write('<html><head><title>AGWA System Analytics Report</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<style>body { font-family: sans-serif; } @media print { .no-print { display: none !important; } .print-section { page-break-inside: avoid; } }</style>');
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (isLoading) {
        return <LoadingSpinner message="Loading system analytics..." className="mt-10 h-64" />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 no-print">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <BarChart3 size={30} className="mr-3 text-orange-600" /> System Analytics & Reports
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={fetchStatistics} disabled={isLoading} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg border border-gray-300">
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2"/> : <RotateCcw size={16} className="mr-2" />}
                        Refresh
                    </button>
                    <button onClick={handlePrintReport} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg">
                        <Printer size={16} className="mr-2"/> Print Report
                    </button>
                </div>
            </div>

            <div id="stats-print-area">
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold">AGWA System Analytics Report</h1>
                    <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </div>

                {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 flex items-center" role="alert"><Info size={20} className="mr-3" /><p>{error}</p></div>}
                
                <div className="space-y-10">
                    <div className="print-section">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><DollarSign size={22} className="mr-2 text-green-600"/>Revenue Analysis</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Chart data={stats?.monthlyRevenue} title="Monthly Collected Revenue (PHP)" dataKey="currency" formatLabel={(key) => { const [y, m] = key.split('-'); return `${monthNames[m-1]} '${y.slice(-2)}`; }} />
                            <Chart data={stats?.dailyRevenue} title="Daily Collected Revenue (Last 30 Days)" dataKey="currency" color="bg-green-500" hoverColor="hover:bg-green-600" formatLabel={(key) => key.slice(-2)}/>
                        </div>
                    </div>
                     <div className="print-section">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-8 pt-6 border-t flex items-center"><MessageSquare size={22} className="mr-2 text-purple-600"/>Support Ticket Analysis</h3>
                        {stats?.ticketStats ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <DashboardInfoCard title="Total Tickets" value={stats.ticketStats.total} icon={FileText} />
                                <DashboardInfoCard title="Open" value={stats.ticketStats.open} icon={AlertTriangle} borderColor="border-red-500" iconColor="text-red-500"/>
                                <DashboardInfoCard title="In Progress" value={stats.ticketStats.inProgress} icon={Loader2} borderColor="border-yellow-500" iconColor="text-yellow-500"/>
                                <DashboardInfoCard title="Resolved" value={stats.ticketStats.resolved} icon={CheckCircle} borderColor="border-blue-500" iconColor="text-blue-500"/>
                                <DashboardInfoCard title="Closed" value={stats.ticketStats.closed} icon={CheckCircle} borderColor="border-gray-500" iconColor="text-gray-500"/>
                            </div>
                        ) : <p className="text-gray-500">Ticket data unavailable.</p>}
                    </div>

                    <div className="print-section">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-8 pt-6 border-t flex items-center"><Calendar size={22} className="mr-2 text-teal-600"/>User & Payment Patterns</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <Chart data={stats?.paymentDayStats} title="Peak Payment Days (By # of Payments)" dataKey="count" color="bg-teal-500" hoverColor="hover:bg-teal-600" formatLabel={(key) => key}/>
                           {stats?.usersByRole && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">Users by Role</h4>
                                    <div className="space-y-2">
                                        {Object.entries(stats.usersByRole).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                                                <p className="text-gray-600 capitalize font-medium">{role.replace('_', ' ')}</p>
                                                <p className="font-bold text-gray-800">{count}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;