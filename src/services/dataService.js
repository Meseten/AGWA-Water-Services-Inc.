import {
    doc, setDoc, getDoc, addDoc, collection, updateDoc,
    deleteDoc, query, where, getDocs, serverTimestamp,
    Timestamp, orderBy, writeBatch, getCountFromServer, arrayUnion, limit
} from 'firebase/firestore';
import {
    userProfileDocumentPath,
    supportTicketsCollectionPath, supportTicketDocumentPath,
    announcementsCollectionPath, announcementDocumentPath,
    systemSettingsDocumentPath,
    allBillsCollectionPath, allBillDocumentPath,
    allMeterReadingsCollectionPath, allMeterReadingDocumentPath,
    publicDataCollectionPath, 
    profilesCollectionPath,
    meterRoutesCollectionPath
} from '../firebase/firestorePaths.js'; 
import * as billingService from './billingService.js';
import { determineServiceTypeAndRole } from '../utils/userUtils.js';

const handleFirestoreError = (functionName, error) => {
    console.error(`Firestore Error in ${functionName}:`, error.code, error.message);
    const userFriendlyMessage = `An error occurred in ${functionName}. Code: ${error.code}. Please check Firestore rules and indexes. If the error is 'failed-precondition', you likely need to create a database index in the Firebase console.`;
    return { success: false, error: userFriendlyMessage };
};

export const batchUpdateTicketStatus = async (dbInstance, ticketIds, newStatus) => {
    try {
        const batch = writeBatch(dbInstance);
        ticketIds.forEach(ticketId => {
            const ticketRef = doc(dbInstance, supportTicketDocumentPath(ticketId));
            batch.update(ticketRef, { status: newStatus, lastUpdatedAt: serverTimestamp() });
        });
        await batch.commit();
        return { success: true };
    } catch (error) {
        return handleFirestoreError('batchUpdateTicketStatus', error);
    }
};

export const deleteUserProfile = async (dbInstance, userId) => {
    try {
        const batch = writeBatch(dbInstance);
        const flatProfileRef = doc(dbInstance, profilesCollectionPath(), userId);
        const nestedProfileRef = doc(dbInstance, userProfileDocumentPath(userId));
        
        batch.delete(flatProfileRef);
        batch.delete(nestedProfileRef);
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        return handleFirestoreError('deleteUserProfile', error);
    }
};

const deleteAllFromCollection = async (dbInstance, collectionPath) => {
    try {
        const snapshot = await getDocs(collection(dbInstance, collectionPath));
        const batchSize = 500;
        let i = 0;
        let batch = writeBatch(dbInstance);
        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            i++;
            if (i % batchSize === 0) {
                await batch.commit();
                batch = writeBatch(dbInstance);
            }
        }
        if (i % batchSize !== 0) {
            await batch.commit();
        }
        return { success: true, count: i };
    } catch (error) {
        return handleFirestoreError(`deleteAllFromCollection: ${collectionPath}`, error);
    }
};

export const deleteAllTickets = (dbInstance) => deleteAllFromCollection(dbInstance, supportTicketsCollectionPath());
export const deleteAllBills = (dbInstance) => deleteAllFromCollection(dbInstance, allBillsCollectionPath());
export const deleteAllReadings = (dbInstance) => deleteAllFromCollection(dbInstance, allMeterReadingsCollectionPath());
export const deleteAllAnnouncements = (dbInstance) => deleteAllFromCollection(dbInstance, announcementsCollectionPath());

export const linkAccountNumberToProfile = async (dbInstance, userId, accountNumber) => {
    if (!accountNumber || !userId) {
        return { success: false, error: "User ID and Account Number are required." };
    }

    try {
        const upperCaseAccountNumber = accountNumber.toUpperCase();
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const q = query(profilesRef, where("accountNumber", "==", upperCaseAccountNumber));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: "This Account Number was not found in our records. Please check and try again." };
        }

        const masterAccountDoc = snapshot.docs[0];
        const masterAccountData = masterAccountDoc.data();

        if (masterAccountData.uid && masterAccountData.uid !== userId) {
            return { success: false, error: "This account is already linked to another user. Please contact support." };
        }
        
        const { role, serviceType } = determineServiceTypeAndRole(upperCaseAccountNumber);

        const profileUpdates = {
            accountNumber: upperCaseAccountNumber,
            role,
            serviceType,
            meterSerialNumber: masterAccountData.meterSerialNumber || '',
            serviceAddress: masterAccountData.serviceAddress || { street: '', barangay: '', district: '', landmark: '' }
        };
        
        return await updateUserProfile(dbInstance, userId, profileUpdates);

    } catch (error) {
        return handleFirestoreError('linkAccountNumberToProfile', error);
    }
};

export const getUniqueServiceLocations = async (dbInstance) => {
    try {
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const snapshot = await getDocs(profilesRef);
        const locations = new Set();
        snapshot.docs.forEach(doc => {
            const barangay = doc.data().serviceAddress?.barangay;
            if (barangay) {
                locations.add(barangay);
            }
        });
        return { success: true, data: Array.from(locations).sort() };
    } catch (error) {
        return handleFirestoreError('getUniqueServiceLocations', error);
    }
};

export const getAccountsByLocation = async (dbInstance, location) => {
    try {
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const q = query(profilesRef, where("serviceAddress.barangay", "==", location));
        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => doc.data().accountNumber).filter(Boolean);
        return { success: true, data: accounts };
    } catch (error) {
        return handleFirestoreError('getAccountsByLocation', error);
    }
};

export const createOrUpdateMeterRoute = async (dbInstance, routeData, routeId = null) => {
    try {
        if (routeId) {
            const routeRef = doc(dbInstance, meterRoutesCollectionPath(), routeId);
            await updateDoc(routeRef, { ...routeData, updatedAt: serverTimestamp() });
        } else {
            await addDoc(collection(dbInstance, meterRoutesCollectionPath()), { ...routeData, createdAt: serverTimestamp() });
        }
        return { success: true };
    } catch (error) {
        return handleFirestoreError('createOrUpdateMeterRoute', error);
    }
};

export const getAllMeterRoutes = async (dbInstance) => {
    try {
        const q = query(collection(dbInstance, meterRoutesCollectionPath()), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getAllMeterRoutes', error);
    }
};

export const deleteMeterRoute = async (dbInstance, routeId) => {
    try {
        await deleteDoc(doc(dbInstance, meterRoutesCollectionPath(), routeId));
        return { success: true };
    } catch (error) {
        return handleFirestoreError('deleteMeterRoute', error);
    }
};

export const getAllMeterReaders = async (dbInstance) => {
    try {
        const q = query(collection(dbInstance, profilesCollectionPath()), where("role", "==", "meter_reader"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getAllMeterReaders', error);
    }
};

export const getRevenueStats = async (dbInstance) => {
    try {
        const paidBillsQuery = query(collection(dbInstance, allBillsCollectionPath()), where("status", "==", "Paid"));
        const snapshot = await getDocs(paidBillsQuery);
        const monthlyRevenue = {};
        snapshot.forEach(doc => {
            const bill = doc.data();
            const paymentDate = bill.paymentDate?.toDate ? bill.paymentDate.toDate() : new Date();
            const monthYear = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + (bill.amountPaid || 0);
        });
        const sortedRevenue = Object.entries(monthlyRevenue)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12);
        return { success: true, data: Object.fromEntries(sortedRevenue) };
    } catch (error) {
        return handleFirestoreError('getRevenueStats', error);
    }
};

export const getDailyRevenueStats = async (dbInstance, days = 30) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const paidBillsQuery = query(
            collection(dbInstance, allBillsCollectionPath()),
            where("status", "==", "Paid"),
            where("paymentDate", ">=", startDate)
        );
        const snapshot = await getDocs(paidBillsQuery);
        const dailyRevenue = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dayKey = date.toISOString().split('T')[0];
            dailyRevenue[dayKey] = 0;
        }
        snapshot.forEach(doc => {
            const bill = doc.data();
            const paymentDate = bill.paymentDate?.toDate ? bill.paymentDate.toDate() : new Date();
            const dayKey = paymentDate.toISOString().split('T')[0];
            if(dailyRevenue[dayKey] !== undefined) {
               dailyRevenue[dayKey] += (bill.amountPaid || 0);
            }
        });
        return { success: true, data: dailyRevenue };
    } catch (error) {
        return handleFirestoreError('getDailyRevenueStats', error);
    }
};

export const getPaymentDayOfWeekStats = async (dbInstance) => {
    try {
        const paidBillsQuery = query(collection(dbInstance, allBillsCollectionPath()), where("status", "==", "Paid"));
        const snapshot = await getDocs(paidBillsQuery);
        const dayCounts = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
        snapshot.forEach(doc => {
            const bill = doc.data();
            const paymentDate = bill.paymentDate?.toDate ? bill.paymentDate.toDate() : null;
            if (paymentDate) {
                const dayIndex = paymentDate.getDay();
                const dayName = Object.keys(dayCounts)[dayIndex];
                dayCounts[dayName]++;
            }
        });
        return { success: true, data: dayCounts };
    } catch (error) {
        return handleFirestoreError('getPaymentDayOfWeekStats', error);
    }
};

export const getReadingsCountByReaderForDate = async (dbInstance, readerId, dateString) => {
    try {
        const readingsRef = collection(dbInstance, allMeterReadingsCollectionPath());
        const q = query(readingsRef, 
            where("readerId", "==", readerId),
            where("readingDateString", "==", dateString)
        );
        
        const snapshot = await getCountFromServer(q);
        return { success: true, data: { count: snapshot.data().count } };
    } catch (error) {
        return handleFirestoreError('getReadingsCountByReaderForDate', error);
    }
};

export const getAccountsInRoute = async (dbInstance, route) => {
    if (!route || !route.accountNumbers || route.accountNumbers.length === 0) {
        return { success: true, data: [] };
    }
    try {
        const accountNumbers = route.accountNumbers;
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const fetchedProfiles = [];

        for (let i = 0; i < accountNumbers.length; i += 30) {
            const chunk = accountNumbers.slice(i, i + 30);
            const q = query(profilesRef, where('accountNumber', 'in', chunk));
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => fetchedProfiles.push({ id: doc.id, ...doc.data() }));
        }
        
        return { success: true, data: fetchedProfiles };
    } catch (error) {
        return handleFirestoreError('getAccountsInRoute', error);
    }
};

export const getUserProfile = async (dbInstance, userId) => {
    try {
        const docRef = doc(dbInstance, profilesCollectionPath(), userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        } else {
            return { success: false, error: "User profile not found." };
        }
    } catch (error) {
        return handleFirestoreError('getUserProfile', error);
    }
};

export const searchUserProfiles = async (dbInstance, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
        return { success: false, error: "Search term cannot be empty." };
    }
    const term = searchTerm.toLowerCase();
    try {
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const queries = [
            query(profilesRef, where('accountNumber', '==', searchTerm.toUpperCase())),
            query(profilesRef, where('email', '==', term)),
            query(profilesRef, where('meterSerialNumber', '==', term)),
            query(profilesRef, where('displayNameLower', '>=', term), where('displayNameLower', '<=', term + '\uf8ff'))
        ];
        
        const results = await Promise.all(queries.map(q => getDocs(q)));
        
        const foundUsers = new Map();
        results.forEach(snapshot => {
            snapshot.forEach(doc => {
                if (!foundUsers.has(doc.id)) {
                    foundUsers.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
        });

        return { success: true, data: Array.from(foundUsers.values()) };

    } catch (error) {
        return handleFirestoreError('searchUserProfiles', error);
    }
};

export const generateBillForUser = async (dbInstance, userId, userProfile) => {
    try {
        const readingsQuery = query(
            collection(dbInstance, allMeterReadingsCollectionPath()),
            where("userId", "==", userId),
            orderBy("readingDate", "desc"),
            limit(2)
        );
        const readingsSnapshot = await getDocs(readingsQuery);

        if (readingsSnapshot.docs.length < 2) {
            return { success: false, error: "Cannot generate bill. At least two meter readings are required to calculate consumption." };
        }

        const latestReading = readingsSnapshot.docs[0].data();
        const previousReading = readingsSnapshot.docs[1].data();

        const consumption = latestReading.readingValue - previousReading.readingValue;
        if (consumption < 0) {
            return { success: false, error: "Cannot generate bill. The latest reading value is less than the previous one." };
        }

        const billMonthYear = new Date(latestReading.readingDate.toDate()).toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const existingBillQuery = query(
            collection(dbInstance, allBillsCollectionPath()),
            where("userId", "==", userId),
            where("monthYear", "==", billMonthYear)
        );
        const existingBillSnapshot = await getDocs(existingBillQuery);
        if (!existingBillSnapshot.empty) {
            return { success: false, error: `A bill for ${billMonthYear} already exists for this user.` };
        }
        
        const settingsResult = await getSystemSettings(dbInstance);
        const systemSettings = settingsResult.success ? settingsResult.data : {};
        
        const charges = billingService.calculateBillDetails(consumption, userProfile.serviceType, userProfile.meterSize, systemSettings);
        
        const billDate = latestReading.readingDate.toDate();
        const dueDate = new Date(billDate);
        dueDate.setDate(dueDate.getDate() + 15);

        const newBill = {
            userId: userId,
            accountNumber: userProfile.accountNumber,
            userName: userProfile.displayName,
            billingPeriod: `${formatDate(previousReading.readingDate.toDate())} - ${formatDate(latestReading.readingDate.toDate())}`,
            monthYear: billMonthYear,
            billDate: Timestamp.fromDate(billDate),
            dueDate: Timestamp.fromDate(dueDate),
            previousReading: previousReading.readingValue,
            currentReading: latestReading.readingValue,
            consumption: consumption,
            ...charges,
            amount: charges.totalCalculatedCharges,
            previousUnpaidAmount: 0, 
            totalAmountDue: charges.totalCalculatedCharges,
            status: 'Unpaid',
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(dbInstance, allBillsCollectionPath()), newBill);
        
        return { success: true, message: `Bill for ${billMonthYear} generated successfully!` };

    } catch (error) {
        return handleFirestoreError('generateBillForUser', error);
    }
};

export const getBillableAccountsInLocation = async (dbInstance, location) => {
    try {
        const accountsInLocQuery = query(collection(dbInstance, profilesCollectionPath()), where("serviceAddress.barangay", "==", location));
        const usersSnapshot = await getDocs(accountsInLocQuery);
        if (usersSnapshot.empty) return { success: true, data: [] };

        const billableAccounts = [];
        for (const userDoc of usersSnapshot.docs) {
            const userProfile = { id: userDoc.id, ...userDoc.data() };
            const readingsQuery = query(collection(dbInstance, allMeterReadingsCollectionPath()), where("userId", "==", userProfile.id), orderBy("readingDate", "desc"), limit(2));
            const readingsSnapshot = await getDocs(readingsQuery);
            
            if (readingsSnapshot.docs.length < 2) continue;

            const latestReading = readingsSnapshot.docs[0].data();
            const billMonthYear = new Date(latestReading.readingDate.toDate()).toLocaleString('default', { month: 'long', year: 'numeric' });
            
            const existingBillQuery = query(collection(dbInstance, allBillsCollectionPath()), where("userId", "==", userProfile.id), where("monthYear", "==", billMonthYear));
            const existingBillSnapshot = await getDocs(existingBillQuery);

            if (existingBillSnapshot.empty) {
                billableAccounts.push(userProfile);
            }
        }
        return { success: true, data: billableAccounts };
    } catch (error) {
        return handleFirestoreError('getBillableAccountsInLocation', error);
    }
};

export const generateBillsForMultipleAccounts = async (dbInstance, accounts) => {
    const logs = [];
    for (const account of accounts) {
        const result = await generateBillForUser(dbInstance, account.id, account);
        if(result.success) {
            logs.push({ success: true, message: `SUCCESS: Bill generated for ${account.accountNumber} - ${result.message}` });
        } else {
            logs.push({ success: false, message: `FAILED: Bill for ${account.accountNumber} - ${result.error}` });
        }
    }
    return logs;
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-US');

export const createUserProfile = async (dbInstance, userId, profileData) => {
    try {
        const batch = writeBatch(dbInstance);
        if (profileData.accountNumber) {
            profileData.accountNumber = profileData.accountNumber.toUpperCase();
        }
        const dataForDb = { 
            ...profileData, 
            uid: userId, 
            createdAt: serverTimestamp(), 
            lastLoginAt: serverTimestamp(),
            displayNameLower: profileData.displayName ? profileData.displayName.toLowerCase() : ''
        };
        
        const nestedProfileRef = doc(dbInstance, userProfileDocumentPath(userId));
        batch.set(nestedProfileRef, dataForDb);
        
        const flatProfileRef = doc(dbInstance, profilesCollectionPath(), userId);
        batch.set(flatProfileRef, dataForDb);
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        return handleFirestoreError('createUserProfile', error);
    }
};

export const updateUserProfile = async (dbInstance, userId, profileUpdates) => {
    try {
        const batch = writeBatch(dbInstance);
        if (profileUpdates.accountNumber) {
            profileUpdates.accountNumber = profileUpdates.accountNumber.toUpperCase();
        }
        if (profileUpdates.displayName) {
            profileUpdates.displayNameLower = profileUpdates.displayName.toLowerCase();
        }
        const dataForUpdate = { ...profileUpdates, updatedAt: serverTimestamp() };
        
        batch.update(doc(dbInstance, userProfileDocumentPath(userId)), dataForUpdate);
        batch.update(doc(dbInstance, profilesCollectionPath(), userId), dataForUpdate);
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateUserProfile', error);
    }
};

export const getAllUsersProfiles = async (dbInstance) => {
    try {
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const snapshot = await getDocs(profilesRef);
        return { success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
    } catch (error) {
        return handleFirestoreError('getAllUsersProfiles', error);
    }
};

export const createSupportTicket = async (dbInstance, ticketData) => {
    try {
        const collectionRef = collection(dbInstance, supportTicketsCollectionPath());
        const docRef = await addDoc(collectionRef, { ...ticketData, status: 'Open', submittedAt: serverTimestamp(), conversation: [] });
        return { success: true, id: docRef.id };
    } catch (error) {
        return handleFirestoreError('createSupportTicket', error);
    }
};

export const deleteSupportTicket = async (dbInstance, ticketId) => {
    try {
        await deleteDoc(doc(dbInstance, supportTicketDocumentPath(ticketId)));
        return { success: true };
    } catch (error) {
        return handleFirestoreError('deleteSupportTicket', error);
    }
};

export const addTicketReply = async (dbInstance, ticketId, replyData) => {
    try {
        const ticketRef = doc(dbInstance, supportTicketDocumentPath(ticketId));
        const updates = {
            conversation: arrayUnion(replyData),
            lastUpdatedAt: serverTimestamp(),
        };
        if (replyData.authorRole !== 'admin') {
            updates.status = 'In Progress'; 
        }
        await updateDoc(ticketRef, updates);
        return { success: true };
    } catch (error) {
        return handleFirestoreError('addTicketReply', error);
    }
};

export const getAllSupportTickets = async (dbInstance) => {
    try {
        const q = query(collection(dbInstance, supportTicketsCollectionPath()), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getAllSupportTickets', error);
    }
};

export const getTicketsByReporter = async (dbInstance, reporterId) => {
    try {
        const q = query(collection(dbInstance, supportTicketsCollectionPath()), where("userId", "==", reporterId), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getTicketsByReporter', error);
    }
};

export const updateSupportTicket = async (dbInstance, ticketId, updates) => {
    try {
        const ticketRef = doc(dbInstance, supportTicketDocumentPath(ticketId));
        await updateDoc(ticketRef, { ...updates, lastUpdatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateSupportTicket', error);
    }
};

export const createAnnouncement = async (dbInstance, data) => {
    try {
        await addDoc(collection(dbInstance, announcementsCollectionPath()), { ...data, createdAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('createAnnouncement', error);
    }
};

export const getAllAnnouncements = async (dbInstance, onlyActive = false) => {
    try {
        const collectionRef = collection(dbInstance, announcementsCollectionPath());
        const constraints = onlyActive 
            ? [where("status", "==", "active"), orderBy("createdAt", "desc")]
            : [orderBy("createdAt", "desc")];
        const q = query(collectionRef, ...constraints);
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getAllAnnouncements', error);
    }
};

export const updateAnnouncement = async (dbInstance, id, updates) => {
    try {
        await updateDoc(doc(dbInstance, announcementDocumentPath(id)), { ...updates, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateAnnouncement', error);
    }
};

export const deleteAnnouncement = async (dbInstance, id) => {
    try {
        await deleteDoc(doc(dbInstance, announcementDocumentPath(id)));
        return { success: true };
    } catch (error) {
        return handleFirestoreError('deleteAnnouncement', error);
    }
};

export const getSystemSettings = async (dbInstance) => {
    try {
        const docSnap = await getDoc(doc(dbInstance, systemSettingsDocumentPath()));
        return { success: true, data: docSnap.exists() ? docSnap.data() : {} };
    } catch (error) {
        return handleFirestoreError('getSystemSettings', error);
    }
};

export const updateSystemSettings = async (dbInstance, settingsData) => {
    try {
        await setDoc(doc(dbInstance, systemSettingsDocumentPath()), settingsData, { merge: true });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateSystemSettings', error);
    }
};

export const getBillsForUser = async (dbInstance, userId) => {
    try {
        const q = query(collection(dbInstance, allBillsCollectionPath()), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getBillsForUser', error);
    }
};

export const updateBill = async (dbInstance, billId, updates) => {
    try {
        await updateDoc(doc(dbInstance, allBillDocumentPath(billId)), { ...updates, lastUpdatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateBill', error);
    }
};

export const addMeterReading = async (dbInstance, readingData) => {
    try {
        const readingDateObj = new Date(readingData.readingDate);
        const dataToSave = {
             ...readingData,
             readingDate: Timestamp.fromDate(readingDateObj),
             readingDateString: readingData.readingDate,
             recordedAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(dbInstance, allMeterReadingsCollectionPath()), dataToSave);
        return { success: true, id: docRef.id };
    } catch (error) {
        return handleFirestoreError('addMeterReading', error);
    }
};

export const updateMeterReading = async (dbInstance, readingId, updates) => {
    try {
        const readingRef = doc(dbInstance, allMeterReadingDocumentPath(readingId));
        if(updates.readingDate && typeof updates.readingDate === 'string') {
            updates.readingDate = Timestamp.fromDate(new Date(updates.readingDate));
        }
        await updateDoc(readingRef, { ...updates, lastUpdatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return handleFirestoreError('updateMeterReading', error);
    }
};

export const deleteMeterReading = async (dbInstance, readingId) => {
    try {
        await deleteDoc(doc(dbInstance, allMeterReadingDocumentPath(readingId)));
        return { success: true };
    } catch (error) {
        return handleFirestoreError('deleteMeterReading', error);
    }
};

export const getMeterReadingsForAccount = async (dbInstance, accountNumber) => {
    try {
        const q = query(collection(dbInstance, allMeterReadingsCollectionPath()), where("accountNumber", "==", accountNumber), orderBy("readingDate", "desc"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getMeterReadingsForAccount', error);
    }
};

export const getRoutesForReader = async (dbInstance, readerId) => {
    try {
        const q = query(collection(dbInstance, meterRoutesCollectionPath()), where("assignedReaderId", "==", readerId), orderBy("name"));
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError('getRoutesForReader', error);
    }
};

export const getDocuments = async (dbInstance, collectionPath, queryConstraints = []) => {
    try {
        const q = query(collection(dbInstance, collectionPath), ...queryConstraints);
        const snapshot = await getDocs(q);
        return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (error) {
        return handleFirestoreError(`getDocuments from ${collectionPath}`, error);
    }
};

export const getUsersStats = async (dbInstance) => {
    try {
        const profilesRef = collection(dbInstance, profilesCollectionPath());
        const snapshot = await getCountFromServer(profilesRef);
        const allProfiles = await getDocs(profilesRef);
        const byRole = allProfiles.docs.reduce((acc, doc) => {
            const role = doc.data().role || 'unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});
        return { success: true, data: { total: snapshot.data().count, byRole } };
    } catch(e) {
        return handleFirestoreError('getUsersStats', e);
    }
};

export const getTicketsStats = async (dbInstance) => {
    try {
        const ticketsRef = collection(dbInstance, supportTicketsCollectionPath());
        const totalSnapshot = await getCountFromServer(ticketsRef);
        
        const openQuery = query(ticketsRef, where('status', '==', 'Open'));
        const inProgressQuery = query(ticketsRef, where('status', '==', 'In Progress'));
        const resolvedQuery = query(ticketsRef, where('status', '==', 'Resolved'));
        const closedQuery = query(ticketsRef, where('status', '==', 'Closed'));

        const [openSnapshot, inProgressSnapshot, resolvedSnapshot, closedSnapshot] = await Promise.all([
            getCountFromServer(openQuery),
            getCountFromServer(inProgressQuery),
            getCountFromServer(resolvedQuery),
            getCountFromServer(closedQuery)
        ]);

        return { 
            success: true, 
            data: { 
                total: totalSnapshot.data().count, 
                open: openSnapshot.data().count,
                inProgress: inProgressSnapshot.data().count,
                resolved: resolvedSnapshot.data().count,
                closed: closedSnapshot.data().count
            } 
        };
    } catch(e) {
        return handleFirestoreError('getTicketsStats', e);
    }
};

export const getAnnouncementsStats = async (dbInstance) => {
    try {
        const annRef = collection(dbInstance, announcementsCollectionPath());
        const totalSnapshot = await getCountFromServer(annRef);
        const activeQuery = query(annRef, where('status', '==', 'active'));
        const activeSnapshot = await getCountFromServer(activeQuery);
        return { success: true, data: { total: totalSnapshot.data().count, active: activeSnapshot.data().count } };
    } catch(e) {
        return handleFirestoreError('getAnnouncementsStats', e);
    }
};


export const getBillingStatsForCurrentCycle = async (dbInstance) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const billsRef = collection(dbInstance, allBillsCollectionPath());
        const q = query(billsRef,
            where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
            where('createdAt', '<=', Timestamp.fromDate(endOfMonth))
        );
        
        const snapshot = await getCountFromServer(q);
        return { success: true, data: { count: snapshot.data().count } };
    } catch (e) {
        return handleFirestoreError('getBillingStatsForCurrentCycle', e);
    }
};

export const getPaymentsByClerkForToday = async (dbInstance, clerkId) => {
    try {
        const today = new Date();
        const startOfDay = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
        const endOfDay = Timestamp.fromDate(new Date(new Date().setHours(23, 59, 59, 999)));

        const paymentsRef = collection(dbInstance, allBillsCollectionPath());
        const q = query(paymentsRef, 
            where("processedByClerkId", "==", clerkId),
            where("paymentTimestamp", ">=", startOfDay),
            where("paymentTimestamp", "<=", endOfDay)
        );
        
        const snapshot = await getDocs(q);
        let totalCollected = 0;
        const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            totalCollected += data.amountPaid || 0;
            return {
                id: doc.id,
                ...data
            };
        });

        const stats = {
            paymentsTodayCount: snapshot.size,
            totalCollectedToday: totalCollected,
            transactions: transactions.sort((a,b) => b.paymentTimestamp.toDate() - a.paymentTimestamp.toDate())
        };
        
        return { success: true, data: stats };
    } catch (error) {
        return handleFirestoreError('getPaymentsByClerkForToday', error);
    }
};
export { serverTimestamp, Timestamp };