import React from 'react';
import { Compass, Home } from 'lucide-react';

const NotFound = ({ onNavigateHome }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg shadow-md m-4">
            <Compass size={48} className="text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-2">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-4 max-w-md">
                The page you are looking for does not exist or has been moved.
            </p>
            {onNavigateHome && (
                 <button
                    onClick={onNavigateHome}
                    className="flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    <Home size={16} className="mr-2" />
                    Go to Dashboard
                </button>
            )}
        </div>
    );
};

export default NotFound;