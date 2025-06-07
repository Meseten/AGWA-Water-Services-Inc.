// src/components/auth/PhoneLoginForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, KeySquare, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { commonInputClass, commonButtonClass } from '../../styles/authFormStyles.js';

const phoneButtonClass = "w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 flex items-center justify-center disabled:opacity-60 active:scale-95";

const PhoneLoginForm = ({
    handleSendOtpExternal,
    handleVerifyOtpExternal,
    navigateTo,
    authActionLoading,
    setAuthErrorExt
}) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [countdown]);


    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!phoneNumber.trim()) {
            setAuthErrorExt("Please enter your phone number.");
            return;
        }
        const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

        const result = await handleSendOtpExternal(formattedPhoneNumber, () => {
            setIsOtpSent(true);
            setCountdown(60);
            setAuthErrorExt('');
        });

        if (result && !result.success) {
            setIsOtpSent(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim() || otp.length < 6) {
            setAuthErrorExt("Please enter a valid 6-digit OTP.");
            return;
        }
        await handleVerifyOtpExternal(otp, () => {
            setOtp('');
        });
    };

    const handleResendOtp = () => {
        if (countdown > 0) return;
        setOtp('');
        setAuthErrorExt('');
        handleSendOtp();
    };

    const handleChangeNumber = () => {
        setIsOtpSent(false);
        setOtp('');
        setPhoneNumber('');
        setAuthErrorExt('');
        setCountdown(0);
    };

    return (
        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
            <div id="recaptcha-container" className="my-2 flex justify-center"></div>

            {!isOtpSent ? (
                <>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                        Enter your phone number (with country code, e.g., +639171234567) to receive a verification code.
                    </p>
                    <div className="relative">
                        <PhoneCall className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            placeholder="Phone Number (e.g., +63917...)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`${commonInputClass} pl-11`}
                            required
                            disabled={authActionLoading}
                            aria-label="Phone number for OTP"
                        />
                    </div>
                    <button
                        type="submit"
                        className={phoneButtonClass}
                        disabled={authActionLoading || !phoneNumber.trim()}
                    >
                        {authActionLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {authActionLoading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-600 mb-2 text-center">
                        We've sent an OTP to <strong>{phoneNumber}</strong>. Please enter it below.
                    </p>
                    <div className="relative">
                        <KeySquare className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className={`${commonInputClass} pl-11 tracking-widest text-center`}
                            required
                            disabled={authActionLoading}
                            maxLength="6"
                            aria-label="One-Time Password"
                        />
                    </div>
                    <button
                        type="submit"
                        className={commonButtonClass}
                        disabled={authActionLoading || otp.length < 6}
                    >
                        {authActionLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {authActionLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
                    </button>
                    <div className="text-sm text-center space-y-2 mt-3">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className={`font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed`}
                            disabled={authActionLoading || countdown > 0}
                        >
                            <RefreshCw size={14} className={`inline mr-1.5 ${countdown > 0 ? '' : 'group-hover:animate-spin-once'}`} />
                            Resend OTP {countdown > 0 ? `(${countdown}s)` : ''}
                        </button>
                        <p>
                            <button
                                type="button"
                                onClick={handleChangeNumber}
                                className="text-xs text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-60"
                                disabled={authActionLoading}
                            >
                                Entered wrong number? Change it.
                            </button>
                        </p>
                    </div>

                </>
            )}
            <div className="text-sm text-center mt-6 pt-3 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                    disabled={authActionLoading}
                >
                    <ArrowLeft size={16} className="inline mr-1" /> Back to Main Login
                </button>
            </div>
             <style jsx>{`
                .group-hover\\:animate-spin-once:hover {
                    animation: spin 0.5s linear 1;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </form>
    );
};

export default PhoneLoginForm;