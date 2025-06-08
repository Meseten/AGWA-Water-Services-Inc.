import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = React.memo(({
    isOpen,
    onClose,
    title = '',
    children,
    size = "md",
    hideCloseButton = false,
    modalDialogClassName = '',
    contentClassName = ''
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        full: "max-w-full h-full rounded-none sm:rounded-lg", 
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[100] p-4 overflow-y-auto animate-fadeIn"
            onClick={onClose} // Close on overlay click
        >
            <div
                className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear flex flex-col max-h-[90vh] ${modalDialogClassName}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
            >
                {title && (
                    <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
                        {!hideCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>
                )}
                <div className={`p-4 sm:p-6 flex-grow overflow-y-auto ${contentClassName}`}>
                    {children}
                </div>
            </div>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes modal-appear {
                    0% { transform: scale(0.95) translateY(10px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-modal-appear {
                    animation: modal-appear 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
                }
            `}</style>
        </div>
    );
});

export default Modal;
