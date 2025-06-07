// src/utils/userUtils.js

export const determineServiceTypeAndRole = (accNum) => {
    if (!accNum || typeof accNum !== 'string') {
        return { serviceType: 'Residential', role: 'customer' };
    }
    const upperAccNum = accNum.toUpperCase().trim();
    if (upperAccNum.startsWith('ADM')) return { serviceType: 'Admin', role: 'admin' };
    if (upperAccNum.startsWith('PER')) return { serviceType: 'Meter Reading Personnel', role: 'meterReader' };
    if (upperAccNum.startsWith('CLK')) return { serviceType: 'Clerk Operations', role: 'clerk_cashier' };
    if (upperAccNum.startsWith('RES-LI')) return { serviceType: 'Residential Low-Income', role: 'customer' };
    if (upperAccNum.startsWith('RES')) return { serviceType: 'Residential', role: 'customer' };
    if (upperAccNum.startsWith('COM')) return { serviceType: 'Commercial', role: 'customer' };
    if (upperAccNum.startsWith('IND')) return { serviceType: 'Industrial', role: 'customer' };
    return { serviceType: 'Residential', role: 'customer' };
};

export const generatePlaceholderPhotoURL = (displayName) => {
    const initial = displayName ? displayName.charAt(0).toUpperCase() : 'A';
    return `https://placehold.co/100x100/3b82f6/FFFFFF?text=${initial}`;
};

export const formatDate = (timestamp, options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) => {
    if (!timestamp) return 'N/A';
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else {
        return 'Invalid Date';
    }
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    try {
        return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (e) {
        return 'Invalid Date';
    }
};