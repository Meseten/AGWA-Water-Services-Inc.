import clsx from 'clsx';

export const commonInputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed";

export const getCommonButtonClasses = (isLoading) => clsx(
    "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:scale-95 flex items-center justify-center",
    {
        'opacity-60 cursor-not-allowed': isLoading
    }
);

export const getGoogleButtonClasses = (isLoading) => clsx(
    "w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 flex items-center justify-center space-x-2 active:scale-95",
    {
        'opacity-50 cursor-not-allowed': isLoading
    }
);

export const getLinkButtonClasses = (isLoading) => clsx(
    "w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 flex items-center justify-center space-x-2 active:scale-95",
    {
        'opacity-50 cursor-not-allowed': isLoading
    }
);