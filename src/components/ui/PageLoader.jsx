import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-800 flex flex-col justify-center items-center p-4 font-inter text-white selection:bg-blue-300 selection:text-blue-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-2 animate-pulse">AGWA</h1>
        <p className="text-blue-200 text-lg italic mb-8">Ensuring Clarity, Sustaining Life.</p>
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-300" />
        <p className="text-blue-300 text-sm mt-4">{message}</p>
      </div>
      <p className="text-center text-xs text-blue-400 mt-12 absolute bottom-6">
        &copy; {new Date().getFullYear()} AGWA Water Services, Inc.
      </p>
    </div>
  );
};

export default PageLoader;
