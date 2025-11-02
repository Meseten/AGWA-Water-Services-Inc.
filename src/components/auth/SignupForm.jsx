import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff, UserCircle, Hash, Loader2 } from 'lucide-react';
import { commonInputClass, getCommonButtonClasses, getGoogleButtonClasses } from '../../styles/authFormStyles.js';

const SignupForm = ({
    navigateTo,
    authActionLoading,
    handleSignupExternal,
    handleGoogleSignIn,
    setAuthError,
    showNotification,
    systemSettings = {}
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSignupSubmit = async (e) => {
        e.preventDefault();
        setAuthError(""); // Clear previous errors
        if (!displayName.trim()) { setAuthError("Full Name is required."); showNotification("Full Name is required.", "warning"); return; }
        if (!accountNumber.trim()) { setAuthError("AGWA Account Number is required (e.g., RES-12345, ADM-001)."); showNotification("AGWA Account Number is required.", "warning"); return; }
        if (password.length < 6) { setAuthError("Password must be at least 6 characters long."); showNotification("Password too short (min. 6 chars).", "warning"); return; }
        if (password !== confirmPassword) { setAuthError("Passwords do not match."); showNotification("Passwords don't match.", "warning"); return; }
        await handleSignupExternal(email, password, displayName, accountNumber);
    };

    const onGoogleSignupClick = async () => {
        await handleGoogleSignIn();
    };
    
    const { isGoogleLoginEnabled = true } = systemSettings;

    return (
        <form onSubmit={onSignupSubmit} className="space-y-5">
            <div className="relative">
                <UserCircle className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Full Name *" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`${commonInputClass} pl-11`} required disabled={authActionLoading} aria-label="Full Name"/>
            </div>
            <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="AGWA Account Number (e.g., RES-12345) *" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={`${commonInputClass} pl-11`} required disabled={authActionLoading} aria-label="AGWA Account Number"/>
            </div>
            <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className={`${commonInputClass} pl-11`} required disabled={authActionLoading} aria-label="Email Address"/>
            </div>
            <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="Password (min. 6 chars) *" value={password} onChange={(e) => setPassword(e.target.value)} className={`${commonInputClass} pl-11`} required disabled={authActionLoading} aria-label="Password"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"} disabled={authActionLoading}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password *" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${commonInputClass} pl-11`} required disabled={authActionLoading} aria-label="Confirm Password"/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} disabled={authActionLoading}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            <button type="submit" className={getCommonButtonClasses(authActionLoading)} disabled={authActionLoading}>
                {authActionLoading && <Loader2 className="animate-spin inline mr-2" size={18} />}
                {authActionLoading ? 'Creating Account...' : 'Create My Account'}
            </button>
            {isGoogleLoginEnabled && (
                <>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign up with</span></div>
                    </div>
                    <button type="button" onClick={onGoogleSignupClick} className={getGoogleButtonClasses(authActionLoading)} disabled={authActionLoading}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" onError={(e) => e.target.style.display='none'}/>
                        <span>Sign up with Google</span>
                    </button>
                </>
            )}
            <p className="text-sm text-center text-gray-600 mt-5">
                Already have an account?{' '}
                <button type="button" onClick={() => navigateTo('login')} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-70" disabled={authActionLoading}>
                    Login
                </button>
            </p>
        </form>
    );
};

export default SignupForm;