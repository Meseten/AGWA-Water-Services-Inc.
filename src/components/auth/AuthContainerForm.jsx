import React from 'react';

export const commonInputClass = "w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-200 text-gray-900 placeholder-gray-500 text-sm";
export const commonButtonClass = "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 active:scale-95 text-sm";
export const googleButtonClass = "w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 flex items-center justify-center space-x-2 disabled:opacity-60 active:scale-95 text-sm";
export const linkButtonClass = "w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 flex items-center justify-center space-x-2 disabled:opacity-60 active:scale-95 text-sm";
export const phoneButtonClass = "w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 flex items-center justify-center space-x-2 disabled:opacity-60 active:scale-95 text-sm";


const AuthFormContainer = React.memo(({ children, authError, appIdForPaths }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-800 flex flex-col justify-center items-center p-4 font-sans selection:bg-blue-300 selection:text-blue-900">
    <div className="bg-white p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-500 ease-out animate-fadeInUp">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-blue-600 tracking-tight">AGWA</h1>
        <p className="text-sm text-gray-500 mt-1 italic">Ensuring Clarity, Sustaining Life.</p>
      </div>

      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center animate-shake" role="alert">
          {authError}
        </div>
      )}

      {children}
    </div>

    {appIdForPaths && (
        <p className="text-center text-xs text-blue-200 mt-8">
            App ID (DB): <span className="font-semibold opacity-80">{appIdForPaths}</span>
        </p>
    )}
    <p className="text-center text-xs text-blue-300 mt-2">
      &copy; {new Date().getFullYear()} AGWA Water Services, Inc.
    </p>

    <div id="recaptcha-container" className="my-2 mx-auto"></div>

    <style>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      .animate-shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
    `}</style>
  </div>
));

AuthFormContainer.displayName = 'AuthFormContainer';
export default AuthFormContainer;