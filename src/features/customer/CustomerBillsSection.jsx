import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Sparkles, Loader2, Info, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import PaymentModal from './PaymentModal.jsx';
import InvoiceView from '../../components/ui/InvoiceView.jsx';
import * as DataService from '../../services/dataService.js';
import { callGeminiAPI } from '../../services/geminiService.js';
import { formatDate } from '../../utils/userUtils.js';

const CustomerBillsSection = ({ user, userData, db, showNotification, billingService }) => {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [billToPay, setBillToPay] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const [billToExplain, setBillToExplain] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    
    const [billToView, setBillToView] = useState(null);
    const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);

    const fetchBills = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const result = await DataService.getBillsForUser(db, user.uid);
        if (result.success) {
            const sortedBills = result.data.sort((a, b) => {
                const dateA = a.billDate?.toDate ? a.billDate.toDate() : new Date(0);
                const dateB = b.billDate?.toDate ? b.billDate.toDate() : new Date(0);
                return dateB - dateA;
            });
            
            const billsWithDetails = sortedBills.map(bill => {
                const charges = billingService(bill.consumption, userData.serviceType, userData.meterSize);
                const totalAmount = charges.totalCalculatedCharges + (bill.previousUnpaidAmount || 0) - (bill.seniorCitizenDiscount || 0);
                return { ...bill, amount: totalAmount, calculatedCharges: charges };
            });

            setBills(billsWithDetails);
        } else {
            setError(result.error || "Failed to fetch your bills.");
            showNotification(result.error || "Failed to fetch bills.", "error");
        }
        setIsLoading(false);
    }, [db, user.uid, showNotification, billingService, userData.serviceType, userData.meterSize]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handlePayBillClick = (bill) => {
        setBillToPay(bill);
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = async ({ billId, paymentMethod, amountPaid, paymentReference }) => {
        setIsProcessingPayment(true);
        const result = await DataService.updateBill(db, billId, {
            status: 'Paid',
            paymentDate: new Date(),
            amountPaid: amountPaid,
            paymentMethod: paymentMethod,
            paymentReference: paymentReference,
        });
        setIsProcessingPayment(false);
        if (result.success) {
            showNotification("Payment successful! Your bill status has been updated.", "success");
            setIsPaymentModalOpen(false);
            setBillToPay(null);
            fetchBills();
        } else {
            showNotification(result.error || "Payment processing failed.", "error");
        }
    };

    const handleExplainBill = async (bill) => {
        setBillToExplain(bill);
        setExplanation('');
        setIsExplaining(true);
        try {
            const charges = bill.calculatedCharges;
            const prompt = `
                Explain this water bill to a customer named ${userData.displayName}. 
                Be friendly, clear, and encouraging. Use markdown for formatting like **bolding**.
                
                Bill Details:
                - Bill Period: ${bill.monthYear}
                - Total Amount Due: **₱${bill.amount.toFixed(2)}**
                - Due Date: ${formatDate(bill.dueDate)}
                - Water Consumption: **${bill.consumption} cubic meters**

                Explain the breakdown clearly:
                1.  **Basic Charge (₱${charges.basicCharge.toFixed(2)})**: This is the main cost for the ${bill.consumption} cubic meters of water you used, based on your '${userData.serviceType}' tariff rate.
                2.  **Other Charges**: Briefly explain what these are for.
                    - FCDA (₱${charges.fcda.toFixed(2)}): A small adjustment for foreign currency costs.
                    - Environmental Charge (₱${charges.environmentalCharge.toFixed(2)}): This funds wastewater treatment and protects our environment.
                    - Maintenance Service Charge (₱${charges.maintenanceServiceCharge.toFixed(2)}): A fixed fee for meter upkeep.
                3.  **Taxes (₱${charges.vat.toFixed(2)})**: This is the 12% Value Added Tax required by the government.
                4.  **Previous Unpaid Balance**: Mention if there is a previous balance of ₱${(bill.previousUnpaidAmount || 0).toFixed(2)}.

                Conclude by summarizing how all these add up to the Total Amount Due and gently remind them of the due date.
            `;
            
            const aiExplanation = await callGeminiAPI(prompt);
            setExplanation(aiExplanation);
        } catch {
            setExplanation("Sorry, I couldn't generate an explanation right now. The detailed breakdown is available on the full invoice.");
            showNotification("AI explanation failed.", "error");
        } finally {
            setIsExplaining(false);
        }
    };
    
    const handleViewInvoice = (bill) => {
        setBillToView(bill);
        setIsInvoiceViewOpen(true);
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading your bills..." />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center mb-6 pb-4 border-b border-gray-200">
                <FileText size={30} className="mr-3 text-blue-600" /> My Bills & Payment History
            </h2>
            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-center">{error}</div>}
            
            {bills.length === 0 && !error && (
                <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <Info size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No billing history found.</p>
                </div>
            )}

            <div className="space-y-4">
                {bills.map(bill => (
                    <div key={bill.id} className={`p-4 rounded-lg shadow-md border-l-4 ${bill.status === 'Paid' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{bill.monthYear}</h3>
                                <p className="text-sm text-gray-600">Due: {formatDate(bill.dueDate, {month: 'long', day: 'numeric'})}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-700">₱{bill.amount.toFixed(2)}</p>
                                <p className={`text-sm font-semibold ${bill.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                    {bill.status}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200/80 flex flex-wrap gap-2 justify-end">
                            <button onClick={() => handleViewInvoice(bill)} className="text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md transition flex items-center"><Eye size={14} className="mr-1"/>View Invoice</button>
                            <button onClick={() => handleExplainBill(bill)} className="text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md transition flex items-center" disabled={isExplaining && billToExplain?.id === bill.id}>
                                {isExplaining && billToExplain?.id === bill.id ? <Loader2 size={14} className="animate-spin mr-1"/> : <Sparkles size={14} className="mr-1"/>} Explain Bill
                            </button>
                            {bill.status === 'Unpaid' && (
                                <button onClick={() => handlePayBillClick(bill)} className="text-xs font-bold bg-green-500 text-white hover:bg-green-600 px-4 py-1.5 rounded-md transition flex items-center">
                                    <span className="mr-1 font-bold">₱</span> Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={!!billToExplain} onClose={() => setBillToExplain(null)} title={`Explanation for ${billToExplain?.monthYear} Bill`} size="lg">
                {isExplaining ? <LoadingSpinner message="Agie is analyzing your bill..."/> : <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed p-2" dangerouslySetInnerHTML={{ __html: billToExplain ? explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : explanation }} />}
            </Modal>

            {isPaymentModalOpen && (
                <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} billToPay={billToPay} onConfirmPayment={handleConfirmPayment} isProcessingPayment={isProcessingPayment} userData={userData}/>
            )}
            
            {isInvoiceViewOpen && (
                <InvoiceView isOpen={isInvoiceViewOpen} onClose={() => setIsInvoiceViewOpen(false)} bill={billToView} userData={userData} calculateBillDetails={billingService} />
            )}
        </div>
    );
};

export default CustomerBillsSection;