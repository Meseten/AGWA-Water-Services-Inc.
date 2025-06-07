// src/components/ui/Tooltip.jsx
import React, { useState } from 'react';

/**
 * A simple, reusable Tooltip component.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The element that triggers the tooltip on hover/focus.
 * @param {string} props.text - The text content of the tooltip.
 * @param {'top' | 'bottom' | 'left' | 'right'} [props.position='top'] - Position of the tooltip relative to the child.
 * @param {string} [props.className=''] - Additional Tailwind classes for the tooltip bubble itself.
 * @param {number} [props.delay=100] - Delay in milliseconds before showing the tooltip.
 */
const Tooltip = ({ children, text, position = 'top', className = '', delay = 100 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const showTooltip = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800',
        bottom: 'absolute left-1/2 -translate-x-1/2 bottom-full h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800',
        left: 'absolute top-1/2 -translate-y-1/2 left-full h-0 w-0 border-y-4 border-y-transparent border-l-4 border-l-gray-800',
        right: 'absolute top-1/2 -translate-y-1/2 right-full h-0 w-0 border-y-4 border-y-transparent border-r-4 border-r-gray-800',
    };

    if (!text) return <>{children}</>; // Don't render tooltip if no text

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip} // For accessibility with keyboard navigation
            onBlur={hideTooltip}
            tabIndex={0} // Make the div focusable if children isn't inherently
        >
            {children}
            {isVisible && (
                <div
                    role="tooltip"
                    className={`absolute z-50 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-md shadow-lg transition-opacity duration-150 ease-in-out opacity-100 ${positionClasses[position]} ${className}`}
                >
                    {text}
                    <div className={arrowClasses[position]} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
