import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updateProfile as updateFirebaseProfile,
} from 'firebase/auth';

export const formatAuthError = (error) => {
    let message = error.message || "An unknown authentication error occurred.";
    if (error.code) {
        message = error.code.replace('auth/', '').replace(/-/g, ' ');
        message = message.charAt(0).toUpperCase() + message.slice(1) + '.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') message = 'Invalid credentials. Please check your email and password.';
        if (error.code === 'auth/email-already-in-use') message = 'This email address is already registered. Please try logging in.';
    }
    console.error("Auth Service Error:", error.code, error.message);
    return message;
};

export const signUpWithEmail = async (authInstance, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        return { success: true, userCredential };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export const signInWithEmail = async (authInstance, email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
        return { success: true, userCredential };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export const signInWithGoogle = async (authInstance) => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(authInstance, provider);
        return { success: true, userCredential: result };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export const sendSignInEmailLinkService = async (authInstance, email, actionCodeSettings) => {
    try {
        await sendSignInLinkToEmail(authInstance, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        return { success: true, message: `Sign-in link sent to ${email}!` };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export { isSignInWithEmailLink };

export const handleSignInWithEmailLink = async (authInstance, email, href) => {
    if (isSignInWithEmailLink(authInstance, href)) {
        try {
            const userCredential = await signInWithEmailLink(authInstance, email, href);
            window.localStorage.removeItem('emailForSignIn');
            return { success: true, userCredential };
        } catch (error) {
            return { success: false, error: formatAuthError(error) };
        }
    }
    return { success: false, error: "Not a valid sign-in-with-email-link request." };
};

export const sendPasswordResetService = async (authInstance, email) => {
    try {
        await sendPasswordResetEmail(authInstance, email);
        return { success: true, message: "Password reset email sent!" };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export const logoutUserService = async (authInstance) => {
    try {
        await signOut(authInstance);
        return { success: true, message: "Logged out successfully." };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};

export const updateUserFirebaseAuthProfile = async (authInstance, profileUpdates) => {
    if (!authInstance.currentUser) {
        return { success: false, error: "No user is currently signed in." };
    }
    try {
        await updateFirebaseProfile(authInstance.currentUser, profileUpdates);
        return { success: true, message: "Firebase Auth profile updated." };
    } catch (error) {
        return { success: false, error: formatAuthError(error) };
    }
};