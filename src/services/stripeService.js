import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/firebaseConfig';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

export const createCheckoutSession = async (billId, amount, userEmail, userId, accountNumber) => {
    try {
        const functions = getFunctions(app);
        const createSession = httpsCallable(functions, 'createStripeCheckoutSession');
        
        const amountInCents = Math.round(amount * 100);

        const response = await createSession({
            billId: billId,
            amount: amountInCents,
            userEmail: userEmail,
            userId: userId,
            accountNumber: accountNumber,
            successUrl: `${window.location.origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/dashboard?payment=cancel`,
        });

        const data = response.data;

        if (!data || !data.sessionId) {
            throw new Error('Failed to create a checkout session.');
        }

        return data.sessionId;

    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Could not connect to payment service.');
    }
};