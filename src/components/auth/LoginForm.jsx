import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff, Loader2, Link as LinkIcon } from 'lucide-react';
import { commonInputClass, getCommonButtonClasses, getGoogleButtonClasses, getLinkButtonClasses } from '../../styles/authFormStyles.js';

const LoginForm = ({
    navigateTo,
    authActionLoading,
    handleLoginExternal,
    handleGoogleSignIn,
    setAuthError,
    systemSettings = {}
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            if(setAuthError) setAuthError("Please enter both email and password.");
            return;
        }
        if(setAuthError) setAuthError('');
        await handleLoginExternal(email, password);
    };

    const onGoogleLoginClick = async () => {
        if(setAuthError) setAuthError('');
        await handleGoogleSignIn();
    };

    const { isGoogleLoginEnabled = true, isPasswordlessLoginEnabled = true, isSignupEnabled = true } = systemSettings;

    return (
        <form onSubmit={onLoginSubmit} className="space-y-5">
            <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${commonInputClass} pl-11`}
                    required
                    disabled={authActionLoading}
                    aria-label="Email Address"
                />
            </div>
            <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${commonInputClass} pl-11`}
                    required
                    disabled={authActionLoading}
                    aria-label="Password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={authActionLoading}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            <button type="submit" className={getCommonButtonClasses(authActionLoading)} disabled={authActionLoading}>
                {authActionLoading && <Loader2 className="animate-spin inline mr-2" size={18} />}
                {authActionLoading ? 'Logging In...' : 'Login'}
            </button>
            {(isGoogleLoginEnabled || isPasswordlessLoginEnabled) && (
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>
            )}
            {isGoogleLoginEnabled && (
                <button type="button" onClick={onGoogleLoginClick} className={getGoogleButtonClasses(authActionLoading)} disabled={authActionLoading}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" onError={(e) => e.target.style.display='none'} />
                    <span>Sign in with Google</span>
                </button>
            )}
            {isPasswordlessLoginEnabled && (
                <button type="button" onClick={() => navigateTo('passwordlessLogin')} className={getLinkButtonClasses(authActionLoading)} disabled={authActionLoading}>
                    <LinkIcon size={18} className="mr-2"/>
                    <span>Sign in with Email Link</span>
                </button>
            )}
            <div className="text-sm text-center mt-5 space-y-1.5">
                {isSignupEnabled && (
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => navigateTo('signup')} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-70" disabled={authActionLoading}>
                            Sign Up
                        </button>
                    </p>
                )}
                <p className="text-gray-600">
                    <button type="button" onClick={() => navigateTo('forgotPassword')} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-70" disabled={authActionLoading}>
                        Forgot Password?
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;