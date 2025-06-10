import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Users, MessageSquare, AlertTriangle, RotateCcw, Loader2, Info, Printer, Calendar, CheckCircle } from "lucide-react";
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from "../../services/dataService.js";
import { db } from "../../firebase/firebaseConfig.js";

const HorizontalBarChart = ({ data, title, color = "bg-blue-500" }) => {
    if (!data || Object.keys(data).length === 0) return <p className="text-sm text-gray-500 text-center py-4">No data available for {title}.</p>;
    
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    if (total === 0) return <p className="text-sm text-gray-500 text-center py-4">No data available for {title}.</p>;

    const sortedData = Object.entries(data).sort(([,a],[,b]) => b - a);

    return (
        <div className="space-y-2">
            <h4 className="text-md font-semibold text-gray-700">{title}</h4>
            {sortedData.map(([label, value]) => {
                const percentage = total > 0 ? (value / total) * 100 : 0;
                return (
                    <div key={label} className="text-xs">
                        <div className="flex justify-between mb-0.5">
                            <span className="font-medium text-gray-600 capitalize">{label.replace('_', ' ')}</span>
                            <span>{value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                );
            })}
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
                DataService.getPaymentDayOfWeekStats(db)
            ]);

            const [usersResult, ticketsResult, revenueResult, paymentDayResult] = results;
            
            const newStats = {};
            if (usersResult.status === 'fulfilled' && usersResult.value.success) {
                newStats.usersByRole = usersResult.value.data.byRole;
                newStats.totalUsers = usersResult.value.data.total;
            }
            if (ticketsResult.status === 'fulfilled' && ticketsResult.value.success) newStats.ticketStats = ticketsResult.value.data;
            if (revenueResult.status === 'fulfilled' && revenueResult.value.success) newStats.monthlyRevenue = revenueResult.value.data;
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
        printWindow.document.write('<style>body {font-family: sans-serif;-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;} @media print { .no-print { display: none !important; } .print-section { page-break-inside: avoid; margin-bottom: 2rem; } }</style>');
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const totalRevenue = stats?.monthlyRevenue ? Object.values(stats.monthlyRevenue).reduce((sum, val) => sum + val, 0) : 0;
    const avgMonthlyRevenue = totalRevenue / (stats?.monthlyRevenue ? Object.keys(stats.monthlyRevenue).length : 1);

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

            {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 my-4 flex items-center" role="alert"><Info size={20} className="mr-3" /><p>{error}</p></div>}
            
            <div id="stats-print-area">
                <header className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700">AGWA System Analytics Report</h1>
                    <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </header>

                <div className="space-y-8">
                    <section className="print-section">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center"><span className="font-bold text-2xl mr-2 text-green-600">₱</span>Revenue Analysis</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Total collected revenue over the displayed period is <strong>₱{totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>,
                            with a monthly average of <strong>₱{avgMonthlyRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>.
                        </p>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Monthly Collected Revenue (PHP)</h4>
                            <div className="flex justify-between items-end h-[180px] space-x-2">
                                {stats?.monthlyRevenue && Object.entries(stats.monthlyRevenue).map(([key, value]) => {
                                    const maxValue = Math.max(...Object.values(stats.monthlyRevenue), 1);
                                    const barHeight = (value / maxValue) * 150;
                                    const [y, m] = key.split('-');
                                    return (
                                        <div key={key} className="flex flex-col items-center flex-1 h-full justify-end group">
                                            <div className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">₱{Math.round(value/1000)}k</div>
                                            <div className="w-full bg-green-500 hover:bg-green-600 transition-all duration-200 rounded-t-sm" style={{ height: `${barHeight}px` }} title={`₱${value.toFixed(2)}`}></div>
                                            <div className="text-xs font-medium text-gray-500 mt-1 border-t border-gray-300 w-full text-center pt-1">{`${monthNames[m-1]} '${y.slice(-2)}`}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                    
                    <section className="print-section grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Users size={22} className="mr-2 text-blue-600"/>User Analysis</h3>
                             <p className="text-sm text-gray-600 mb-4">There are currently <strong>{stats?.totalUsers || 0}</strong> registered users in the system.</p>
                             <HorizontalBarChart data={stats?.usersByRole} title="Users by Role" color="bg-blue-500"/>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><MessageSquare size={22} className="mr-2 text-purple-600"/>Support Ticket Analysis</h3>
                             <p className="text-sm text-gray-600 mb-4">A total of <strong>{stats?.ticketStats?.total || 0}</strong> tickets have been created.</p>
                             <HorizontalBarChart data={stats?.ticketStats} title="Tickets by Status" color="bg-purple-500"/>
                        </div>
                    </section>

                     <section className="print-section pt-6 border-t">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Calendar size={22} className="mr-2 text-teal-600"/>Payment Day Analysis</h3>
                             <p className="text-sm text-gray-600 mb-4">This chart shows which days of the week are most popular for making payments.</p>
                             <HorizontalBarChart data={stats?.paymentDayStats} title="Peak Payment Days" color="bg-teal-500"/>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;