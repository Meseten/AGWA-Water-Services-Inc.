// src/features/customer/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { DollarSign, CreditCard, CheckCircle, Loader2, Landmark, Zap, Smartphone } from 'lucide-react'; // Zap for E-wallet, Smartphone for mobile payments like GCash/Maya

/**
 * PaymentModal for customers to simulate bill payments.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {object} props.billToPay - The bill object selected for payment.
 * @param {function} props.onConfirmPayment - Function to call when payment is confirmed.
 * Receives ({ billId, paymentMethod, amountPaid, paymentReference }).
 * @param {boolean} props.isProcessingPayment - Indicates if payment processing is ongoing.
 * @param {object} props.userData - Current customer's data.
 */
const PaymentModal = ({
    isOpen,
    onClose,
    billToPay,
    onConfirmPayment,
    isProcessingPayment,
    userData
}) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentNotes, setPaymentNotes] = useState(''); // Optional notes for the payment

    useEffect(() => {
        if (billToPay) {
            setPaymentAmount(billToPay.amount || 0);
            setSelectedPaymentMethod(''); // Reset method when bill changes
            setPaymentNotes(`Payment for bill: ${billToPay.monthYear || billToPay.invoiceNumber}`);
        }
    }, [billToPay]);

    if (!isOpen || !billToPay) return null;

    const paymentOptions = [
        { name: 'GCash', icon: Smartphone, category: 'E-Wallet', className: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' },
        { name: 'Maya', icon: Zap, category: 'E-Wallet', className: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400' },
        { name: 'Credit/Debit Card', icon: CreditCard, category: 'Card', className: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500' },
        { name: 'Online Bank Transfer', icon: Landmark, category: 'Bank', className: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500' },
        // { name: 'Over-the-Counter', icon: Building, category: 'OTC', className: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400' }
    ];

    const handlePaymentConfirm = () => {
        if (!selectedPaymentMethod) {
            // This should be handled by disabling the button, but as a fallback:
            alert("Please select a payment method."); // Replace with a proper notification if possible
            return;
        }
        const paymentReference = `${selectedPaymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`;
        onConfirmPayment({
            billId: billToPay.id,
            paymentMethod: selectedPaymentMethod,
            amountPaid: paymentAmount,
            paymentReference: paymentReference,
            notes: paymentNotes,
        });
    };
    
    const commonButtonClass = "w-full flex items-center justify-center text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 active:scale-95 text-sm sm:text-base";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Pay Bill: ${billToPay.monthYear || billToPay.invoiceNumber}`} size="lg">
            <div className="space-y-5">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700">You are about to pay:</p>
                    <p className="text-3xl font-bold text-blue-600 my-1">
                        ₱{parseFloat(paymentAmount).toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-500">For Account: {userData.accountNumber}</p>
                    <p className="text-xs text-blue-500">Bill Period: {billToPay.billingPeriod || billToPay.monthYear}</p>
                </div>

                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Payment Method (Simulated):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paymentOptions.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => setSelectedPaymentMethod(opt.name)}
                                    className={`${commonButtonClass} ${opt.className} ${selectedPaymentMethod === opt.name ? 'ring-4 ring-offset-1 ring-yellow-400 scale-105' : 'opacity-90 hover:opacity-100'}`}
                                    disabled={isProcessingPayment}
                                >
                                    <Icon size={20} className="mr-2.5" />
                                    {opt.name}
                                </button>
                            );
                        })}
                    </div>
                    {selectedPaymentMethod && (
                         <p className="text-xs text-gray-500 mt-2 text-center">You selected: <strong>{selectedPaymentMethod}</strong></p>
                    )}
                </div>

                {/* Optional: Payment notes or reference for simulation */}
                {/* <div>
                    <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Notes (Optional):
                    </label>
                    <input
                        type="text"
                        id="paymentNotes"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        placeholder="e.g., For invoice #123"
                        disabled={isProcessingPayment}
                    />
                </div> */}

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-center text-gray-500 mb-3">
                        This is a simulated payment process for demonstration purposes. No real transaction will occur.
                    </p>
                    <button
                        type="button"
                        onClick={handlePaymentConfirm}
                        className={`${commonButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full`}
                        disabled={!selectedPaymentMethod || isProcessingPayment}
                    >
                        {isProcessingPayment ? (
                            <Loader2 size={20} className="animate-spin mr-2" />
                        ) : (
                            <CheckCircle size={20} className="mr-2" />
                        )}
                        {isProcessingPayment ? 'Processing Payment...' : `Confirm Payment of ₱${parseFloat(paymentAmount).toFixed(2)}`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;
