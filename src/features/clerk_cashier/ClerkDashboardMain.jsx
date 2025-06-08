import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Banknote, FileSearch, Clock, DollarSign, RotateCcw, Loader2, AlertTriangle, Info, Printer } from 'lucide-react';
import DashboardInfoCard from '../../components/ui/DashboardInfoCard.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';

const ClerkDashboardMain = ({ userData, showNotification, setActiveSection, db }) => {
    const [dashboardStats, setDashboardStats] = useState({
        paymentsTodayCount: 0,
        totalCollectedToday: 0,
        avgPaymentAmount: 0,
    });
    const [todaysTransactions, setTodaysTransactions] = useState([]);
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
            const paymentsResult = await DataService.getPaymentsByClerkForToday(db, userData.uid);
            if (paymentsResult.success && paymentsResult.data) {
                const { paymentsTodayCount, totalCollectedToday, transactions } = paymentsResult.data;
                setDashboardStats({
                    paymentsTodayCount,
                    totalCollectedToday,
                    avgPaymentAmount: paymentsTodayCount > 0 ? totalCollectedToday / paymentsTodayCount : 0,
                });
                setTodaysTransactions(transactions);
            } else {
                setError(paymentsResult.error || "Today's payment data unavailable.");
            }
        } catch {
            const fetchErr = "Could not load clerk dashboard statistics. Please try refreshing.";
            setError(fetchErr);
        } finally {
            setIsLoading(false);
        }
    }, [userData, db]);

    useEffect(() => {
        fetchClerkStats();
    }, [fetchClerkStats]);

    const handlePrintReport = () => {
        const reportContent = document.getElementById('eod-report-content').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=1000');
        printWindow.document.write('<html><head><title>End-of-Day Report</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<style>body {font-family: Arial, sans-serif;} @media print {.no-print{display:none;}}</style>');
        printWindow.document.write('</head><body class="p-4">');
        printWindow.document.write(reportContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const quickActionCards = [
        { title: "Process Walk-in Payment", icon: Banknote, section: 'walkInPayments', description: "Record payments for customers paying in person at the counter.", color: "blue" },
        { title: "Search Account / Bill", icon: FileSearch, section: 'searchAccountOrBill', description: "Look up customer account details, outstanding bills, or payment history.", color: "teal" },
    ];

    if (isLoading) {
        return <LoadingSpinner message="Loading clerk dashboard..." className="mt-10 h-48" />;
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl no-print">
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
            
            {error && <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md text-center my-4 flex items-center justify-center gap-2 no-print"><Info size={16}/> {error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 no-print">
                <DashboardInfoCard title="Payments Today" value={dashboardStats.paymentsTodayCount} icon={Banknote} borderColor="border-green-500" iconColor="text-green-500" onClick={() => document.getElementById('eod-report-wrapper')?.scrollIntoView({behavior:'smooth'})} />
                <DashboardInfoCard title="Total Collected Today" value={`₱${dashboardStats.totalCollectedToday.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={DollarSign} borderColor="border-emerald-500" iconColor="text-emerald-500" />
                <DashboardInfoCard title="Avg. Payment Today" value={`₱${dashboardStats.avgPaymentAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={DollarSign} borderColor="border-teal-500" iconColor="text-teal-500" />
            </div>

            <div className="no-print">
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

            <div id="eod-report-wrapper" className="mt-8 p-5 bg-gray-50 rounded-xl shadow">
                <div className="flex justify-between items-center mb-4 no-print">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <Clock size={20} className="mr-2 text-gray-500" /> Shift Summary / End-of-Day Report
                    </h3>
                    <button onClick={handlePrintReport} className="flex items-center bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                        <Printer size={14} className="mr-1.5" /> Print Report
                    </button>
                </div>
                <div id="eod-report-content" className="bg-white p-6 rounded-lg border">
                    <div className="flex justify-between items-start pb-4 border-b-2 border-gray-700">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">End-of-Day Clerk Report</h1>
                            <p className="text-sm text-gray-500">AGWA Water Services, Inc.</p>
                        </div>
                        <div className="text-right text-sm">
                            <p><span className="font-semibold">Cashier:</span> {userData.displayName}</p>
                            <p><span className="font-semibold">Date:</span> {formatDate(new Date(), {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 my-4 text-center">
                        <div className="bg-gray-100 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase">Total Transactions</p>
                            <p className="text-xl font-bold">{dashboardStats.paymentsTodayCount}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded">
                            <p className="text-xs text-green-700 uppercase">Total Collected</p>
                            <p className="text-xl font-bold text-green-800">₱{dashboardStats.totalCollectedToday.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                    </div>
                    {todaysTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <h3 className="text-md font-semibold text-gray-700 my-3">Transaction Details</h3>
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600">Time</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600">Account #</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600">Method</th>
                                        <th className="px-4 py-2 text-right font-medium text-gray-600">Amount (PHP)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {todaysTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(tx.paymentTimestamp?.toDate(), {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</td>
                                            <td className="px-4 py-2 whitespace-nowrap font-mono">{tx.accountNumber}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{tx.paymentMethod}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{tx.amountPaid?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">No payments have been processed yet today.</p>
                    )}
                     <div className="mt-12 pt-8">
                        <div className="w-1/3 border-t-2 border-gray-300 text-center mx-auto pt-2">
                            <p className="text-xs text-gray-500">Signature Over Printed Name</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClerkDashboardMain;