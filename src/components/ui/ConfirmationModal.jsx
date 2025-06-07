// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import Modal from './Modal'; // Assuming Modal.jsx is in the same directory
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * A modal for confirming actions (e.g., delete, proceed).
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onConfirm - Function to execute on confirmation.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content/message of the modal.
 * @param {string} [props.confirmText='Confirm'] - Text for the confirm button.
 * @param {string} [props.cancelText='Cancel'] - Text for the cancel button.
 * @param {string} [props.confirmButtonClass='bg-red-600 hover:bg-red-700'] - Tailwind class for confirm button (default danger).
 * @param {string} [props.cancelButtonClass='bg-gray-200 hover:bg-gray-300 text-gray-800'] - Tailwind class for cancel button.
 * @param {string} [props.iconType='warning'] - 'warning', 'success', or 'danger' for the icon.
 * @param {boolean} [props.isConfirming=false] - If true, shows a loading state on the confirm button.
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    cancelButtonClass = 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400',
    iconType = 'warning', // 'warning', 'success', 'danger'
    isConfirming = false,
}) => {
    if (!isOpen) return null;

    let IconComponent;
    let iconColorClass = '';

    switch (iconType) {
        case 'success':
            IconComponent = CheckCircle;
            iconColorClass = 'text-green-500';
            break;
        case 'danger':
            IconComponent = XCircle;
            iconColorClass = 'text-red-500';
            break;
        case 'warning':
        default:
            IconComponent = AlertTriangle;
            iconColorClass = 'text-yellow-500';
            break;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
            <div className="text-center">
                {IconComponent && (
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${iconType === 'warning' ? 'yellow' : iconType === 'success' ? 'green' : 'red'}-100 mb-4`}>
                        <IconComponent className={`h-6 w-6 ${iconColorClass}`} aria-hidden="true" />
                    </div>
                )}
                <div className="text-sm text-gray-600 mb-6">
                    {children}
                </div>
            </div>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${confirmButtonClass} ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onConfirm}
                    disabled={isConfirming}
                >
                    {isConfirming ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {isConfirming ? 'Processing...' : confirmText}
                </button>
                <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${cancelButtonClass}`}
                    onClick={onClose}
                    disabled={isConfirming}
                >
                    {cancelText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
