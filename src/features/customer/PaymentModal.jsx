import React, { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { CreditCard, Loader2, X, Landmark } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, billToPay, onConfirmPayment, isProcessingPayment, userData }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [amount, setAmount] = useState(billToPay?.amount.toFixed(2) || '0.00');

    const paymentMethods = [
        { name: 'Credit/Debit Card', icon: CreditCard, custom: false },
        { name: 'Bank Transfer', icon: Landmark, custom: false },
        { name: 'GCash', custom: true, bgColor: '#0E62FE', textColor: '#FFFFFF' },
        { name: 'Maya', custom: true, bgColor: '#00C27C', textColor: '#FFFFFF' },
    ];
    
    const handlePayment = () => {
        if (!selectedMethod) {
            alert('Please select a payment method.');
            return;
        }
        onConfirmPayment({
            billId: billToPay.id,
            paymentMethod: selectedMethod,
            amountPaid: parseFloat(amount),
            paymentReference: `SIM-${Date.now()}`
        });
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Secure Payment" size="md">
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700">You are paying for bill:</p>
                    <p className="font-bold text-lg text-blue-800">{billToPay.monthYear}</p>
                    <div className="mt-2 text-3xl font-bold text-gray-800">
                        ₱{parseFloat(amount).toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Select Payment Method:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map(method => (
                             <button 
                                key={method.name} 
                                onClick={() => setSelectedMethod(method.name)}
                                className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 h-24 ${selectedMethod === method.name ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
                                style={method.custom ? { backgroundColor: method.bgColor } : {}}
                            >
                               {method.custom ? (
                                    <span className="font-bold text-lg" style={{ color: method.textColor }}>{method.name}</span>
                                ) : (
                                    <>
                                        <method.icon className="w-8 h-8 mb-1 text-gray-600"/>
                                        <span className="text-xs sm:text-sm font-medium text-center text-gray-700">{method.name}</span>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                    <button 
                        onClick={handlePayment} 
                        className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                        disabled={!selectedMethod || isProcessingPayment}
                    >
                        {isProcessingPayment 
                            ? <><Loader2 className="animate-spin mr-2"/> Processing...</>
                            : <> <span className="mr-1 font-bold">₱</span> Confirm Payment</>
                        }
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;