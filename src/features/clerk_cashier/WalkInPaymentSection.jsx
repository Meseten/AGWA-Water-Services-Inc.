// src/features/clerk_cashier/WalkInPaymentSection.jsx
import React, { useState, useEffect } from 'react';
import { Banknote, UserCircle, Hash, FileText, CalendarDays, DollarSign, CheckCircle, Printer, Search, Loader2, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'; // Assuming .jsx extension
// import ConfirmationModal from '../../components/ui/ConfirmationModal'; // Not used in current version
import * as DataService from '../../services/dataService.js'; // .js is fine
// Removed unused import: import { billingService } from '../../services/billingService';
import { formatDate } from '../../utils/userUtils.js'; // .js is fine

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";

/**
 * WalkInPaymentSection for clerks to process customer payments.
 * @param {object} props - Component props from DashboardLayout.
 * @param {object} props.db - Firestore instance.
 * @param {object} props.userData - Current clerk's data (for `processedBy`).
 * @param {function} props.showNotification - Function to display notifications.
 */
const WalkInPaymentSection = ({ db, userData: clerkData, showNotification }) => { // Removed billingService/calculateBillDetails prop
    const [accountNumberSearch, setAccountNumberSearch] = useState('');
    const [searchedCustomer, setSearchedCustomer] = useState(null);
    const [customerBills, setCustomerBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [referenceNumber, setReferenceNumber] = useState('');

    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
    const [isLoadingBills, setIsLoadingBills] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccessData, setPaymentSuccessData] = useState(null);

    const [error, setError] = useState('');

    const handleSearchCustomer = async (e) => {
        if (e) e.preventDefault();
        if (!accountNumberSearch.trim()) {
            showNotification("Please enter an Account Number to search.", "warning");
            return;
        }
        setIsLoadingCustomer(true);
        setError('');
        setSearchedCustomer(null);
        setCustomerBills([]);
        setSelectedBill(null);
        setPaymentAmount('');
        setPaymentSuccessData(null);

        try {
            const usersResult = await DataService.getAllUsersProfiles(db);
            if (usersResult.success) {
                const foundUser = usersResult.data.find(
                    user => user.accountNumber?.toLowerCase() === accountNumberSearch.toLowerCase()
                );
                if (foundUser) {
                    setSearchedCustomer(foundUser);
                    fetchCustomerBills(foundUser.id, foundUser.accountNumber);
                } else {
                    setError(`No customer found with Account Number: "${accountNumberSearch}".`);
                    showNotification(`Customer not found.`, "info");
                }
            } else {
                setError(usersResult.error || "Failed to search for customer.");
                showNotification(usersResult.error || "Failed to search for customer.", "error");
            }
        } catch (err) {
            setError("An error occurred during customer search.");
            showNotification("An error occurred during customer search.", "error");
            console.error("Search Customer Error (Clerk):", err);
        }
        setIsLoadingCustomer(false);
    };

    const fetchCustomerBills = async (userId, accNum) => {
        setIsLoadingBills(true);
        const billsResult = await DataService.getBillsForUser(db, userId);
        if (billsResult.success) {
            const unpaidBills = billsResult.data
                .filter(bill => bill.status === 'Unpaid')
                .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
            setCustomerBills(unpaidBills);
            if (unpaidBills.length === 0) {
                showNotification(`No unpaid bills found for Account #${accNum}.`, "info");
            }
        } else {
            showNotification(billsResult.error || "Failed to fetch customer bills.", "error");
        }
        setIsLoadingBills(false);
    };
    
    useEffect(() => {
        if (selectedBill) {
            setPaymentAmount(selectedBill.amount?.toFixed(2) || '');
        } else {
            if (customerBills.length === 0) {
                setPaymentAmount('');
            } else if (customerBills.length > 0 && !customerBills.find(b => b.id === selectedBill?.id)){
                const totalUnpaid = customerBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
                setPaymentAmount(totalUnpaid > 0 ? totalUnpaid.toFixed(2) : '');
            }
        }
    }, [selectedBill, customerBills]);


    const handleProcessPayment = async (e) => {
        e.preventDefault();
        if (!selectedBill && customerBills.length === 0) {
            showNotification("No bill selected or available for payment.", "warning");
            return;
        }
        const amountToPay = parseFloat(paymentAmount);
        if (isNaN(amountToPay) || amountToPay <= 0) {
            showNotification("Please enter a valid payment amount.", "warning");
            return;
        }
        // Adjusted condition for referenceNumber requirement
        if ((paymentMethod === 'Check' || paymentMethod === 'Card (Debit/Credit)' || paymentMethod === 'E-wallet (GCash/Maya)') && !referenceNumber.trim()) {
            showNotification("Reference number is required for this payment method.", "warning");
            return;
        }

        setIsProcessingPayment(true);
        setPaymentSuccessData(null);

        const billToPay = selectedBill || customerBills.find(b => b.status === 'Unpaid');
        if (!billToPay) {
             showNotification("Cannot determine which bill to pay. Please select a bill.", "warning");
             setIsProcessingPayment(false);
             return;
        }

        try {
            const billUpdateResult = await DataService.updateBill(db, billToPay.id, {
                status: 'Paid',
                paymentDate: new Date().toISOString().split('T')[0], // Storing as YYYY-MM-DD string
                paymentTimestamp: DataService.serverTimestamp(), // For more precise querying if needed
                amountPaid: amountToPay,
                paymentMethod: paymentMethod,
                paymentReference: referenceNumber.trim() || `CASH-${Date.now().toString().slice(-8)}`,
                processedByClerkId: clerkData.uid,
                processedByClerkName: clerkData.displayName,
            });

            if (!billUpdateResult.success) {
                throw new Error(billUpdateResult.error || "Failed to update bill status.");
            }

            const receiptData = {
                customerName: searchedCustomer.displayName,
                accountNumber: searchedCustomer.accountNumber,
                billId: billToPay.id,
                billMonthYear: billToPay.monthYear || billToPay.billingPeriod, // Use billingPeriod as fallback
                amountPaid: amountToPay,
                paymentDate: new Date(), // For immediate display
                paymentMethod: paymentMethod,
                referenceNumber: referenceNumber.trim() || `CASH-${Date.now().toString().slice(-8)}`, // Match above
                processedBy: clerkData.displayName,
            };
            setPaymentSuccessData(receiptData);
            showNotification(`Payment of ₱${amountToPay.toFixed(2)} for Bill ID ${billToPay.id} processed successfully!`, "success");

            setPaymentAmount('');
            setReferenceNumber('');
            setSelectedBill(null);
            fetchCustomerBills(searchedCustomer.id, searchedCustomer.accountNumber);

        } catch (err) {
            console.error("Payment Processing Error:", err);
            showNotification(err.message || "An error occurred while processing the payment.", "error");
        }
        setIsProcessingPayment(false);
    };

    const paymentMethods = ['Cash', 'Check', 'Card (Debit/Credit)', 'E-wallet (GCash/Maya)'];

    const handlePrintReceipt = () => {
        const printableContent = document.getElementById('payment-receipt-content');
        if (printableContent) {
            const printWindow = window.open('', '_blank', 'height=600,width=800');
            printWindow.document.write('<html><head><title>AGWA Payment Receipt</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // For Tailwind classes
            // Corrected script tag closing
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; margin: 20px; font-size: 12pt; } .receipt-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ccc;} .receipt-item span:first-child {font-weight: bold; color: #555;} @media print { .no-print { display: none; } body {-webkit-print-color-adjust: exact; print-color-adjust: exact;} }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printableContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 500); // Added timeout for content loading
        } else {
            showNotification("Receipt content not found for printing.", "error");
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <Banknote size={30} className="mr-3 text-green-600" /> Process Walk-in Payment
                </h2>
            </div>

            {!paymentSuccessData && (
                <form onSubmit={handleSearchCustomer} className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
                    <label htmlFor="accountNumberSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Search Customer by Account Number
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                id="accountNumberSearch"
                                value={accountNumberSearch}
                                onChange={(e) => setAccountNumberSearch(e.target.value)}
                                className={`${commonInputClass} pl-9`}
                                placeholder="Enter Account Number"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center sm:w-auto w-full"
                            disabled={isLoadingCustomer}
                        >
                            {isLoadingCustomer ? <Loader2 size={18} className="animate-spin mr-2" /> : <Search size={18} className="mr-2" />}
                            Find Customer
                        </button>
                    </div>
                    {error && !isLoadingCustomer && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </form>
            )}
            
            {isLoadingCustomer && <LoadingSpinner message="Searching for customer..." />}

            {searchedCustomer && !isLoadingCustomer && !paymentSuccessData && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
                        <UserCircle size={20} className="mr-2" /> {searchedCustomer.displayName}
                        <span className="ml-2 text-sm text-gray-600">({searchedCustomer.accountNumber})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Meter No: {searchedCustomer.meterSerialNumber || 'N/A'}</p>
                    
                    {isLoadingBills && <LoadingSpinner message="Loading bills..." />}
                    {!isLoadingBills && customerBills.length === 0 && (
                        <p className="text-sm text-green-600 mt-2">No unpaid bills found for this customer.</p>
                    )}
                    {!isLoadingBills && customerBills.length > 0 && (
                        <div className="mt-3">
                            <label htmlFor="selectBill" className="block text-sm font-medium text-gray-700 mb-1">Select Bill to Pay (or pay total outstanding):</label>
                            <select 
                                id="selectBill" 
                                className={commonInputClass}
                                value={selectedBill ? selectedBill.id : ""}
                                onChange={(e) => {
                                    const bill = customerBills.find(b => b.id === e.target.value);
                                    setSelectedBill(bill || null);
                                }}
                            >
                                <option value="">Pay Total Unpaid / Select Specific Bill</option>
                                {customerBills.map(bill => (
                                    <option key={bill.id} value={bill.id}>
                                        {bill.monthYear || bill.billingPeriod} - ₱{bill.amount?.toFixed(2)} (Due: {formatDate(bill.dueDate, {month: 'short', day: 'numeric'})})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {searchedCustomer && (customerBills.length > 0 || selectedBill) && !paymentSuccessData && (
                <form onSubmit={handleProcessPayment} className="space-y-5 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Payment Details</h3>
                     <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay (PHP) *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className={`${commonInputClass} pl-9`} step="0.01" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                        <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={commonInputClass} required>
                           {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                        </select>
                    </div>
                    {(paymentMethod === 'Check' || paymentMethod === 'Card (Debit/Credit)' || paymentMethod === 'E-wallet (GCash/Maya)') && (
                        <div>
                            <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction No. *</label>
                            <input type="text" id="referenceNumber" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className={commonInputClass} placeholder="e.g., Check No., Card Approval Code" required />
                        </div>
                    )}
                     <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center transition-colors active:scale-95"
                        disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                    >
                        {isProcessingPayment ? <Loader2 size={20} className="animate-spin mr-2" /> : <CheckCircle size={20} className="mr-2" />}
                        {isProcessingPayment ? 'Processing...' : 'Process Payment'}
                    </button>
                </form>
            )}

            {paymentSuccessData && (
                <div className="mt-8 p-6 border-2 border-dashed border-green-500 bg-green-50 rounded-lg animate-fadeIn">
                    <div className="text-center mb-4">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                        <h3 className="text-xl font-semibold text-green-700">Payment Successful!</h3>
                    </div>
                    <div id="payment-receipt-content" className="space-y-1 text-sm mb-6">
                        <h4 className="font-bold text-center text-lg mb-2 text-gray-700">AGWA Payment Receipt</h4>
                        <div className="receipt-item"><span>Customer:</span><span>{paymentSuccessData.customerName}</span></div>
                        <div className="receipt-item"><span>Account No:</span><span>{paymentSuccessData.accountNumber}</span></div>
                        <div className="receipt-item"><span>Bill Period:</span><span>{paymentSuccessData.billMonthYear}</span></div>
                        <div className="receipt-item"><span>Amount Paid:</span><span className="font-bold text-lg">₱{paymentSuccessData.amountPaid.toFixed(2)}</span></div>
                        <div className="receipt-item"><span>Payment Date:</span><span>{formatDate(paymentSuccessData.paymentDate, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span></div>
                        <div className="receipt-item"><span>Payment Method:</span><span>{paymentSuccessData.paymentMethod}</span></div>
                        {paymentSuccessData.referenceNumber && !paymentSuccessData.referenceNumber.startsWith('CASH-') && (
                            <div className="receipt-item"><span>Reference No:</span><span>{paymentSuccessData.referenceNumber}</span></div>
                        )}
                        <div className="receipt-item"><span>Processed By:</span><span>{paymentSuccessData.processedBy}</span></div>
                        <p className="text-xs text-center text-gray-500 mt-4">Thank you for your payment! This is a simulated receipt.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 no-print">
                        <button
                            onClick={handlePrintReceipt}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                           <Printer size={18} className="mr-2"/> Print Receipt
                        </button>
                         <button
                            onClick={() => {
                                setPaymentSuccessData(null);
                                setAccountNumberSearch('');
                                setSearchedCustomer(null);
                                setCustomerBills([]);
                                setSelectedBill(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                           New Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalkInPaymentSection;
