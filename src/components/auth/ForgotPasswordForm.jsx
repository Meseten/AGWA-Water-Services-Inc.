// src/components/auth/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { commonInputClass, commonButtonClass } from '../../styles/authFormStyles.js';

const ForgotPasswordForm = ({ handleForgotPasswordExternal, navigateTo, authActionLoading }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            alert("Please enter your email address.");
            return;
        }
        const success = await handleForgotPasswordExternal(email);
        if (success) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-5 text-center">
                <Mail size={48} className="mx-auto text-green-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">Password Reset Email Sent</h3>
                <p className="text-sm text-gray-600">
                    If an account exists for <strong>{email}</strong>, you will receive an email with instructions to reset your password. Please check your inbox (and spam folder).
                </p>
                <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className={`${commonButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500 mt-4`}
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-600 mb-4 text-center">
                Enter your email address below, and we'll send you a link to reset your password.
            </p>
            <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="email"
                    placeholder="Enter your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${commonInputClass} pl-11`}
                    required
                    disabled={authActionLoading}
                    aria-label="Email for password reset"
                />
            </div>
            <button
                type="submit"
                className={commonButtonClass}
                disabled={authActionLoading || !email.trim()}
            >
                {authActionLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                {authActionLoading ? 'Sending Link...' : 'Send Password Reset Link'}
            </button>
            <div className="text-sm text-center mt-6">
                <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                    disabled={authActionLoading}
                >
                    <ArrowLeft size={16} className="inline mr-1" /> Remembered your password? Login
                </button>
            </div>
        </form>
    );
};

export default ForgotPasswordForm;