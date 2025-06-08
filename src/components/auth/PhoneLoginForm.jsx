import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, KeySquare, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
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
    const recaptchaVerifierRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': () => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setAuthErrorExt("reCAPTCHA expired. Please try again.");
                }
            });
            recaptchaVerifierRef.current.render();
        }
    }, [setAuthErrorExt]);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [countdown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setAuthErrorExt('');
        if (!phoneNumber.trim()) {
            setAuthErrorExt("Please enter your phone number.");
            return;
        }
        const appVerifier = recaptchaVerifierRef.current;
        const result = await handleSendOtpExternal(phoneNumber, appVerifier);

        if (result.success) {
            setIsOtpSent(true);
            setCountdown(60);
        }
    };
    
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        await handleVerifyOtpExternal(otp);
    };

    const handleChangeNumber = () => {
        setIsOtpSent(false);
        setPhoneNumber('');
        setOtp('');
        setAuthErrorExt('');
        setCountdown(0);
    };

    return (
        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
            {!isOtpSent ? (
                <>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                        Enter your phone number (with country code, e.g., +63917...) to receive a verification code.
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
                        />
                    </div>
                    <div id="recaptcha-container" className="my-4 flex justify-center"></div>
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
                    <div className="text-sm text-center">
                        <button
                            type="button"
                            onClick={handleChangeNumber}
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-60"
                            disabled={authActionLoading}
                        >
                            Wrong number? Change it.
                        </button>
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
        </form>
    );
};

export default PhoneLoginForm;