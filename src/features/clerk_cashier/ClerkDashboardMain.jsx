import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Banknote, FileSearch, Clock, RotateCcw, Loader2, AlertTriangle, Info, Printer } from 'lucide-react';
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
                const paymentMethodSummary = transactions.reduce((acc, tx) => {
                    const method = tx.paymentMethod || 'Other';
                    acc[method] = (acc[method] || 0) + (tx.amountPaid || 0);
                    return acc;
                }, {});

                setDashboardStats({
                    paymentsTodayCount,
                    totalCollectedToday,
                    avgPaymentAmount: paymentsTodayCount > 0 ? totalCollectedToday / paymentsTodayCount : 0,
                    paymentMethodSummary
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
        printWindow.document.write('<style>body {font-family: Arial, sans-serif;-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;} @media print {.no-print{display:none;} .printable-area { padding: 1rem; } }</style>');
        printWindow.document.write('</head><body><div class="printable-area">');
        printWindow.document.write(reportContent);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const quickActionCards = [
        { title: "Process Walk-in Payment", icon: Banknote, section: 'walkInPayments', description: "Record payments for customers paying in person at the counter.", color: "blue" },
        { title: "Search Account / Bill", icon: FileSearch, section: 'searchAccountOrBill', description: "Look up customer account details, outstanding bills, or payment history.", color: "teal" },
    ];
    
    const PesoIcon = () => <span className="font-bold">₱</span>;

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
                <DashboardInfoCard title="Total Collected Today" value={`₱${dashboardStats.totalCollectedToday.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={PesoIcon} borderColor="border-emerald-500" iconColor="text-emerald-500" />
                <DashboardInfoCard title="Avg. Payment Today" value={`₱${dashboardStats.avgPaymentAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={PesoIcon} borderColor="border-teal-500" iconColor="text-teal-500" />
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
                <div id="eod-report-content" className="bg-white p-6 rounded-lg border text-gray-800">
                    <header className="flex justify-between items-start pb-4 border-b-2 border-gray-700">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-700">AGWA</h1>
                            <p className="text-sm text-gray-500 italic">End-of-Day Clerk Report</p>
                        </div>
                        <div className="text-right text-sm">
                            <p><span className="font-semibold">Cashier:</span> {userData.displayName}</p>
                            <p><span className="font-semibold">Date:</span> {formatDate(new Date(), {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                            <p><span className="font-semibold">Report Generated:</span> {formatDate(new Date(), {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                    </header>
                    
                    <section className="my-6">
                        <h2 className="text-lg font-semibold mb-3 text-center">Shift Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-blue-700 uppercase font-semibold">Total Collected</p>
                                <p className="text-2xl font-bold text-blue-800">₱{dashboardStats.totalCollectedToday.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600 uppercase font-semibold">Total Transactions</p>
                                <p className="text-2xl font-bold">{dashboardStats.paymentsTodayCount}</p>
                            </div>
                             <div className="bg-gray-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600 uppercase font-semibold">Average Transaction</p>
                                <p className="text-2xl font-bold">₱{dashboardStats.avgPaymentAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                        {dashboardStats.paymentMethodSummary && Object.keys(dashboardStats.paymentMethodSummary).length > 0 &&
                            <div className="mt-4 p-4 border rounded-lg">
                                <h3 className="text-sm font-semibold mb-2">Collection by Payment Method:</h3>
                                <div className="text-xs space-y-1">
                                    {Object.entries(dashboardStats.paymentMethodSummary).map(([method, amount]) => (
                                        <div key={method} className="flex justify-between">
                                            <span>{method}:</span>
                                            <span className="font-medium">₱{amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold mb-3 text-center">Transaction Details</h2>
                        {todaysTransactions.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Time</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Account #</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Ref #</th>
                                            <th className="px-4 py-2 text-right font-semibold text-gray-600">Amount (PHP)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {todaysTransactions.map(tx => (
                                            <tr key={tx.id}>
                                                <td className="px-4 py-2 whitespace-nowrap">{formatDate(tx.paymentTimestamp?.toDate(), {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</td>
                                                <td className="px-4 py-2 whitespace-nowrap font-mono">{tx.accountNumber}</td>
                                                <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{tx.paymentReference}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">₱{tx.amountPaid?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-md">No payments have been processed yet today.</p>
                        )}
                    </section>
                     <footer className="mt-12 pt-8">
                        <div className="w-1/2 sm:w-1/3 border-t-2 border-gray-400 text-center mx-auto pt-2">
                            <p className="text-xs text-gray-600">Cashier's Signature</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default ClerkDashboardMain;