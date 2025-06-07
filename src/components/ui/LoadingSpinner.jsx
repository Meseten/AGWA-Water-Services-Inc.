// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * A simple, reusable loading spinner component.
 * @param {object} props - Component props.
 * @param {string} [props.size='h-8 w-8'] - Tailwind classes for spinner size.
 * @param {string} [props.color='text-blue-600'] - Tailwind class for spinner color.
 * @param {string} [props.className=''] - Additional Tailwind classes for the container.
 * @param {string} [props.message=''] - Optional message to display below the spinner.
 * @param {string} [props.messageClassName='text-sm text-gray-500 mt-2'] - Tailwind classes for the message.
 */
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
