import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth as fbAuth, db as fbDb } from './firebase/firebaseConfig';
import { userProfileDocumentPath, systemSettingsDocumentPath } from './firebase/firestorePaths.js';
import * as AuthService from './services/authService.js';
import { createUserProfile } from './services/dataService.js';
import { determineServiceTypeAndRole } from './utils/userUtils.js';

import { Notification } from './components/ui/Notifications.jsx';
import PageLoader from './components/ui/PageLoader.jsx';
import AuthFormContainer from './components/auth/AuthContainerForm.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import SignupForm from './components/auth/SignupForm.jsx';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm.jsx';
import PasswordlessLoginForm from './components/auth/PasswordlessLoginForm.jsx';
import PhoneLoginForm from './components/auth/PhoneLoginForm.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { HardHat } from 'lucide-react';
import './index.css';

const MaintenancePage = () => (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
        <HardHat size={64} className="text-yellow-400 mb-4 animate-bounce" />
        <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
        <p className="text-gray-400">The AGWA portal is currently undergoing scheduled maintenance to improve our services.</p>
        <p className="text-gray-400">We apologize for any inconvenience and expect to be back online shortly.</p>
    </div>
);

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authUser, setAuthUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [systemSettings, setSystemSettings] = useState({ maintenanceMode: false });
    const [authActionLoading, setAuthActionLoading] = useState(false);
    const [formSpecificError, setFormSpecificError] = useState('');
    const [currentPage, setCurrentPage] = useState('login');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const recaptchaVerifierRef = useRef(null);

    const showNotification = useCallback((message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    }, []);

    const clearNotification = useCallback(() => setNotification({ message: '', type: '' }), []);

    useEffect(() => {
        const settingsRef = doc(fbDb, systemSettingsDocumentPath());
        const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                setSystemSettings(docSnap.data());
            }
        }, (error) => {
            console.error("Error fetching system settings:", error);
            showNotification("Could not load system settings.", "warning");
        });

        const unsubscribeAuth = onAuthStateChanged(fbAuth, async (user) => {
            setIsLoading(true);
            setAuthError(null);
            try {
                if (user) {
                    const userDocRef = doc(fbDb, userProfileDocumentPath(user.uid));
                    const userDoc = await getDoc(userDocRef);
                    let finalProfileData = null;
                    if (userDoc.exists()) {
                        finalProfileData = { uid: user.uid, ...userDoc.data() };
                    } else if (localStorage.getItem('signupDisplayName')) {
                        const displayName = localStorage.getItem('signupDisplayName') || user.displayName;
                        const accountNumber = localStorage.getItem('signupAccountNumber') || '';
                        const { role, serviceType } = determineServiceTypeAndRole(accountNumber);
                        const profileData = { email: user.email, displayName, accountNumber, role, serviceType, accountStatus: 'Active', photoURL: user.photoURL || '' };
                        await createUserProfile(fbDb, user.uid, profileData);
                        finalProfileData = { uid: user.uid, ...profileData };
                        localStorage.removeItem('signupDisplayName');
                        localStorage.removeItem('signupAccountNumber');
                    } else {
                        throw new Error("Your account is authenticated, but your user profile could not be found. Please contact support.");
                    }
                    setAuthUser(user);
                    setUserProfile(finalProfileData);
                } else {
                    setAuthUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Authentication state change error:", error);
                setAuthError(error.message);
                setAuthUser(user); 
                setUserProfile(null);
            } finally {
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeSettings();
        };
    }, [showNotification]);
    
    const navigateTo = useCallback((page) => {
        setFormSpecificError('');
        setCurrentPage(page);
    }, []);
    
    const handleAuthAction = async (action, ...args) => {
        setAuthActionLoading(true);
        setFormSpecificError('');
        try {
            const result = await action(fbAuth, ...args);
            if (!result.success) { setFormSpecificError(result.error); }
            return result;
        } catch(error) {
            setFormSpecificError("An unexpected error occurred.");
            return {success: false, error: "An unexpected error occurred."};
        } finally {
            setAuthActionLoading(false);
        }
    };
    
    const handleLogin = (email, password) => handleAuthAction(AuthService.signInWithEmail, email, password);
    const handleGoogleSignIn = () => handleAuthAction(AuthService.signInWithGoogle);
    const handleLogout = () => handleAuthAction(AuthService.logoutUserService);
    const handleSignup = async (email, password, displayName, accountNumber) => {
        setAuthActionLoading(true);
        setFormSpecificError('');
        localStorage.setItem('signupDisplayName', displayName);
        localStorage.setItem('signupAccountNumber', accountNumber);
        const result = await AuthService.signUpWithEmail(fbAuth, email, password);
        if (!result.success) {
            setFormSpecificError(result.error);
            localStorage.removeItem('signupDisplayName');
            localStorage.removeItem('signupAccountNumber');
        }
        setAuthActionLoading(false);
    };
    const handleForgotPassword = async (email) => {
        const result = await handleAuthAction(AuthService.sendPasswordResetService, email);
        if (result.success) { showNotification(result.message, "success"); }
        return result.success;
    };
    const handlePasswordlessSignIn = async (email) => {
        const actionCodeSettings = { url: window.location.origin, handleCodeInApp: true };
        const result = await handleAuthAction(AuthService.sendSignInEmailLinkService, email, actionCodeSettings);
        if(result.success) showNotification(result.message, "success");
        return result;
    };
    const handleSendOtp = async (phoneNumber, onOtpSentUiCallback) => {
        setAuthActionLoading(true);
        setFormSpecificError('');
        try {
            if (recaptchaVerifierRef.current) { recaptchaVerifierRef.current.clear(); }
            const appVerifier = await AuthService.setupRecaptcha(fbAuth, 'recaptcha-container');
            recaptchaVerifierRef.current = appVerifier;
            const result = await AuthService.sendOtpToPhoneService(fbAuth, phoneNumber, appVerifier);
            if (result.success) {
                showNotification(result.message, "success");
                if (onOtpSentUiCallback) onOtpSentUiCallback();
            } else {
                setFormSpecificError(result.error);
            }
             return result;
        } catch (error) {
            setFormSpecificError(AuthService.formatAuthError(error));
             return { success: false, error: AuthService.formatAuthError(error) };
        } finally {
            setAuthActionLoading(false);
        }
    };
    const handleVerifyOtp = async (otp, onVerificationFailedUiCallback) => {
        setAuthActionLoading(true);
        setFormSpecificError('');
        const result = await AuthService.verifyOtpAndSignInService(otp);
        if (result.success) {
            showNotification("Phone sign-in successful!", "success");
        } else {
            setFormSpecificError(result.error);
            if (onVerificationFailedUiCallback) onVerificationFailedUiCallback();
        }
        setAuthActionLoading(false);
    };

    if (isLoading) {
        return <PageLoader loadingMessage="Verifying session..." />;
    }

    if (authUser) {
        if (!userProfile) {
            return <PageLoader loadingMessage="Authentication Error" error={authError || "User profile could not be loaded."} />;
        }
        
        if (systemSettings.maintenanceMode && userProfile.role !== 'admin') {
            return <MaintenancePage />;
        }

        return (
            <>
                <DashboardLayout
                    user={authUser}
                    userData={userProfile}
                    setUserData={setUserProfile}
                    handleLogout={handleLogout}
                    showNotification={showNotification}
                    auth={fbAuth}
                    db={fbDb}
                />
                <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
            </>
        );
    }

    const authPages = {
        login: <LoginForm handleLoginExternal={handleLogin} handleGoogleSignIn={handleGoogleSignIn} navigateTo={navigateTo} authActionLoading={authActionLoading} setAuthError={setFormSpecificError} />,
        signup: <SignupForm handleSignupExternal={handleSignup} handleGoogleSignIn={handleGoogleSignIn} navigateTo={navigateTo} authActionLoading={authActionLoading} setAuthError={setFormSpecificError} showNotification={showNotification}/>,
        forgotPassword: <ForgotPasswordForm handleForgotPasswordExternal={handleForgotPassword} navigateTo={navigateTo} authActionLoading={authActionLoading} />,
        passwordlessLogin: <PasswordlessLoginForm handlePasswordlessSignInExternal={handlePasswordlessSignIn} navigateTo={navigateTo} authActionLoading={authActionLoading} />,
        phoneLogin: <PhoneLoginForm handleSendOtpExternal={handleSendOtp} handleVerifyOtpExternal={handleVerifyOtp} navigateTo={navigateTo} authActionLoading={authActionLoading} setAuthErrorExt={setFormSpecificError} />,
    };

    return (
        <>
            <AuthFormContainer authError={formSpecificError || authError}>
                {authPages[currentPage] || authPages.login}
            </AuthFormContainer>
            <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
        </>
    );
};

export default App;