import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
    size = 'h-8 w-8',
    color = 'text-blue-600',
    className = '',
    message = '',
    messageClassName = 'text-sm text-gray-500 mt-2'
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Loader2 className={`animate-spin ${size} ${color}`} />
            {message && <p className={messageClassName}>{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
