import React, { useState } from 'react';
import { Hash, Link, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { commonInputClass, commonButtonClass } from '../../styles/authFormStyles';

const LinkAccountModal = ({ isOpen, onLink, isLinking, error }) => {
    const [accountNumber, setAccountNumber] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLink(accountNumber);
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
                    To access your bills and other services, please link your AGWA account by providing your account number below.
                </p>

                {error && (
                    <div className="text-center p-2 bg-red-100 text-red-700 rounded-md text-sm">
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
                    />
                </div>
                
                <button type="submit" className={commonButtonClass} disabled={isLinking || !accountNumber.trim()}>
                    {isLinking ? <Loader2 className="animate-spin inline mr-2" size={18} /> : <Link className="inline mr-2" size={18}/>}
                    {isLinking ? 'Linking Account...' : 'Link My Account'}
                </button>
            </form>
        </Modal>
    );
};

export default LinkAccountModal;