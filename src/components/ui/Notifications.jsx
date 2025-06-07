// src/components/ui/Notification.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

// Memoized for performance if props don't change often
export const Notification = React.memo(({ message, type, onClose }) => {
  useEffect(() => {
    // Auto close after 5 seconds
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose, message, type]); // Re-run effect if message or type changes to reset timer

  if (!message) return null;

  let bgColorClass = 'bg-red-500'; // Default to error
  let IconComponent = AlertTriangle;

  if (type === 'success') {
    bgColorClass = 'bg-green-500';
    IconComponent = CheckCircle;
  } else if (type === 'warning') {
    bgColorClass = 'bg-yellow-500';
    IconComponent = AlertTriangle;
  } else if (type === 'info') {
    bgColorClass = 'bg-blue-500';
    IconComponent = AlertTriangle; // Or a specific Info icon
  }

  return (
    <div
      className={`fixed top-5 right-5 ${bgColorClass} text-white p-4 rounded-lg shadow-xl flex items-center space-x-3 z-[200] animate-slide-in-right`}
      role="alert"
    >
      <IconComponent size={24} aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>
    </div>
  );
});

// To prevent display name lint error
Notification.displayName = 'Notification';
