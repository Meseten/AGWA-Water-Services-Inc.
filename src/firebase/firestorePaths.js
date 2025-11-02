export const usersCollectionPath = () => `users`;
export const userProfileDocumentPath = (userId) => `${usersCollectionPath()}/${userId}/profile/data`;

export const publicDataCollectionPath = () => `public/data`;
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
export const serviceInterruptionsCollectionPath = () => `${publicDataCollectionPath()}/service_interruptions`;
export const serviceInterruptionDocumentPath = (id) => `${serviceInterruptionsCollectionPath()}/${id}`;