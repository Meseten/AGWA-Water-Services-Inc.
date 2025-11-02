import React, { useState, useEffect } from 'react';
import { Hash, Link, Loader2, LogOut } from 'lucide-react';
import Modal from '../ui/Modal';
import { commonInputClass, getCommonButtonClasses } from '../../styles/authFormStyles';

const LinkAccountModal = ({ isOpen, onLink, isLinking, error, onLogout }) => {
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setAccountNumber('');
        }
    }, [isOpen]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (accountNumber.trim()) {
           onLink(accountNumber.trim());
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}}
            title="Link Your AGWA Account"
            hideCloseButton={true}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-center text-gray-600">
                    To access services, please link your official AGWA account number.
                    This is a one-time step for accounts created with Google or an Email Link.
                </p>

                {error && (
                    <div className="text-center p-2 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="AGWA Account Number (e.g., RES-12345)"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className={`${commonInputClass} pl-11`}
                        required
                        disabled={isLinking}
                        aria-label="AGWA Account Number"
                        autoFocus
                    />
                </div>

                <button type="submit" className={getCommonButtonClasses(isLinking || !accountNumber.trim())} disabled={isLinking || !accountNumber.trim()}>
                    {isLinking ? <Loader2 className="animate-spin inline mr-2" size={18} /> : <Link className="inline mr-2" size={18}/>}
                    {isLinking ? 'Linking...' : 'Link My Account'}
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="text-sm font-medium text-gray-500 hover:text-red-600 hover:underline"
                    >
                        <LogOut size={14} className="inline mr-1" /> Not you? Logout
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LinkAccountModal;