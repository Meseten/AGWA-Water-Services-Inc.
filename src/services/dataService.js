import {
    doc, setDoc, getDoc, addDoc, collection, updateDoc,
    deleteDoc, query, where, getDocs, serverTimestamp,
    Timestamp, orderBy, writeBatch, getCountFromServer
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

const handleFirestoreError = (functionName, error) => {
    console.error(`Firestore Error in ${functionName}:`, error.code, error.message);
    const userFriendlyMessage = `An error occurred in ${functionName}. Code: ${error.code}. Please check Firestore rules and indexes. If the error is 'failed-precondition', you likely need to create a database index in the Firebase console.`;
    return { success: false, error: userFriendlyMessage };
};

export const createUserProfile = async (dbInstance, userId, profileData) => {
    try {
        const batch = writeBatch(dbInstance);
        if (profileData.accountNumber) {
            profileData.accountNumber = profileData.accountNumber.toUpperCase();
        }
        const dataForDb = { ...profileData, uid: userId, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() };
        
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
        const docRef = await addDoc(collectionRef, { ...ticketData, status: 'Open', submittedAt: serverTimestamp() });
        return { success: true, id: docRef.id };
    } catch (error) {
        return handleFirestoreError('createSupportTicket', error);
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
        const q = query(collection(dbInstance, allBillsCollectionPath()), where("userId", "==", userId), orderBy("billDate", "desc"));
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
        const openQuery = query(ticketsRef, where('status', 'in', ['Open', 'In Progress']));
        const openSnapshot = await getCountFromServer(openQuery);
        return { success: true, data: { total: totalSnapshot.data().count, open: openSnapshot.data().count } };
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

export const getPaymentsByClerkForToday = async (dbInstance, clerkId) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const paymentsRef = collection(dbInstance, allBillsCollectionPath());
        const q = query(paymentsRef, 
            where("processedByClerkId", "==", clerkId),
            where("paymentTimestamp", ">=", startOfDay),
            where("paymentTimestamp", "<=", endOfDay)
        );

        const snapshot = await getDocs(q);
        let totalCollected = 0;
        snapshot.forEach(doc => {
            totalCollected += doc.data().amountPaid || 0;
        });

        const stats = {
            paymentsTodayCount: snapshot.size,
            totalCollectedToday: totalCollected,
        };
        
        return { success: true, data: stats };
    } catch (error) {
        return handleFirestoreError('getPaymentsByClerkForToday', error);
    }
};

export { serverTimestamp, Timestamp };