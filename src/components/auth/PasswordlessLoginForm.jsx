import React, { useState } from 'react';
import { Mail, Link as LinkIcon, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { commonInputClass, getLinkButtonClasses } from '../../styles/authFormStyles.js';

const PasswordlessLoginForm = ({ handlePasswordlessSignInExternal, navigateTo, authActionLoading }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            alert("Please enter your email address.");
            return;
        }
        const result = await handlePasswordlessSignInExternal(email);
        if (result && result.success) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-5 text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">Sign-in Link Sent!</h3>
                <p className="text-sm text-gray-600">
                    A magic sign-in link has been sent to <strong>{email}</strong>.
                    Please check your email and click the link to sign in. The link is valid for a limited time.
                </p>
                <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center mt-4`}
                >
                    <ArrowLeft size={18} className="mr-2" /> Okay, Got It!
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-600 mb-4 text-center">
                Enter your email address, and we'll send you a magic link to sign in instantly. No password needed!
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
                    aria-label="Email for passwordless sign-in"
                />
            </div>
            <button
                type="submit"
                className={getLinkButtonClasses(authActionLoading || !email.trim())}
                disabled={authActionLoading || !email.trim()}
            >
                {authActionLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <LinkIcon size={20} className="mr-2" />}
                {authActionLoading ? 'Sending Link...' : 'Send Sign-in Link'}
            </button>
            <div className="text-sm text-center mt-6">
                <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                    disabled={authActionLoading}
                >
                     <ArrowLeft size={16} className="inline mr-1" /> Prefer a password? Login
                </button>
            </div>
        </form>
    );
};

export default PasswordlessLoginForm;