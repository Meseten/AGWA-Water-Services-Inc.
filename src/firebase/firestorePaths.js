
export const APP_ID_FOR_FIRESTORE_PATHS = 'c_0e480e34ffaa3f81_agwa_water_services_app-268';

export const getAppId = () => {
    if (typeof __app_id !== 'undefined' && __app_id !== null && __app_id !== '') {
        return __app_id;
    }
    return APP_ID_FOR_FIRESTORE_PATHS;
};

const appId = getAppId();

export const usersCollectionPath = () => `artifacts/${appId}/users`;
export const userProfileDocumentPath = (userId) => `${usersCollectionPath()}/${userId}/profile/data`;

export const publicDataCollectionPath = () => `artifacts/${appId}/public/data`;
export const profilesCollectionPath = () => `${publicDataCollectionPath()}/profiles`;
export const supportTicketsCollectionPath = () => `${publicDataCollectionPath()}/support_tickets`;
export const supportTicketDocumentPath = (ticketId) => `${supportTicketsCollectionPath()}/${ticketId}`;
export const announcementsCollectionPath = () => `${publicDataCollectionPath()}/announcements`;
export const announcementDocumentPath = (announcementId) => `${announcementsCollectionPath()}/${announcementId}`;
export const systemSettingsDocumentPath = () => `${publicDataCollectionPath()}/system_config/settings`;
export const allBillsCollectionPath = () => `${publicDataCollectionPath()}/all_bills`;
export const allBillDocumentPath = (billId) => `${allBillsCollectionPath()}/${billId}`;
export const allMeterReadingsCollectionPath = () => `${publicDataCollectionPath()}/all_meter_readings`;
export const allMeterReadingDocumentPath = (readingId) => `${allMeterReadingsCollectionPath()}/${readingId}`;
export const meterRoutesCollectionPath = () => `${publicDataCollectionPath()}/meter_routes`;