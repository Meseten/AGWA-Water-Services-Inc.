import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Save, Loader2, AlertTriangle, Percent, Megaphone, Clock, Trash2, KeyRound, Wind, UserPlus, Phone, AtSign, Briefcase, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import * as DataService from '../../services/dataService.js';
import { db } from '../../firebase/firebaseConfig.js';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonButtonClass = "flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";

const SettingRow = ({ field, settings, handleChange }) => {
    const Icon = field.icon;
    return (
        <div key={field.name} className="p-4 border rounded-lg bg-gray-50/50">
            <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${field.type !== 'checkbox' ? 'flex items-center' : ''}`}>
                {Icon && <Icon size={16} className="mr-2 text-gray-500" />}
                {field.label}
            </label>
            {field.type === 'textarea' ? (
                <textarea name={field.name} rows={field.rows || 3} value={settings[field.name] || ''} onChange={handleChange} className={commonInputClass} placeholder={field.placeholder}/>
            ) : field.type === 'checkbox' ? (
                <label className="flex items-center space-x-3 cursor-pointer p-2">
                    <input type="checkbox" name={field.name} checked={!!settings[field.name]} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <span className="text-sm text-gray-600 select-none">{field.description || "Enable/Disable"}</span>
                </label>
            ) : (
                <input type={field.type} name={field.name} value={settings[field.name] ?? ''} onChange={handleChange} className={commonInputClass} step="0.01" placeholder={field.placeholder}/>
            )}
        </div>
    );
};

const SystemSettingsSection = ({ showNotification = console.log }) => {
    const [settings, setSettings] = useState({
        portalAnnouncement: '',
        isBannerEnabled: false,
        latePaymentPenaltyPercentage: 2.0,
        latePaymentPenaltyDelayDays: 15,
        reconnectionFee: 500.00,
        fcdaPercentage: 1.29,
        environmentalChargePercentage: 25.0,
        vatPercentage: 12.0,
        maintenanceMode: false,
        isSignupEnabled: true,
        isGoogleLoginEnabled: true,
        isPasswordlessLoginEnabled: true,
        isOnlinePaymentsEnabled: true,
        isChatbotEnabled: true,
        supportHotline: "1627-AGWA",
        supportEmail: "support@agwa-waterservices.com.ph",
        autoCloseTicketsDays: 14,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [confirmAction, setConfirmAction] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const result = await DataService.getSystemSettings(db);
        if (result.success && result.data) {
            setSettings(prevDefaults => ({
                ...prevDefaults,
                ...result.data
            }));
        } else {
            setError("Could not load existing settings. Default values are shown. Click 'Save' to create the settings document.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' && value !== '' ? parseFloat(value) : value)
        }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        const result = await DataService.updateSystemSettings(db, settings);
        if (result.success) {
            showNotification("System settings updated successfully!", "success");
        } else {
            setError(result.error || "Failed to save system settings.");
            showNotification(result.error || "Failed to save system settings.", "error");
        }
        setIsSaving(false);
    };
    
    const handleClearData = async () => {
        if (!confirmAction) return;

        setIsDeleting(true);
        let result;
        let dataType = confirmAction;

        switch (dataType) {
            case 'tickets':
                result = await DataService.deleteAllTickets(db);
                break;
            case 'bills':
                result = await DataService.deleteAllBills(db);
                break;
            case 'readings':
                result = await DataService.deleteAllReadings(db);
                break;
            case 'announcements':
                result = await DataService.deleteAllAnnouncements(db);
                break;
            default:
                result = { success: false, error: 'Unknown data type.' };
        }

        if (result.success) {
            showNotification(`Successfully deleted ${result.count} ${dataType}.`, "success");
        } else {
            showNotification(result.error || `Failed to delete ${dataType}.`, "error");
        }
        
        setIsDeleting(false);
        setConfirmAction(null);
    };

    const generalSettings = [
        { name: 'portalAnnouncement', label: 'Portal-Wide Announcement Banner Text', type: 'textarea', icon: Megaphone, rows: 3 },
        { name: 'isBannerEnabled', label: 'Enable Announcement Banner', type: 'checkbox', icon: Megaphone },
        { name: 'maintenanceMode', label: 'Enable Portal Maintenance Mode', type: 'checkbox', icon: AlertTriangle, description: "If enabled, only Admins can log in." },
    ];
    
    const billingSettings = [
        { name: 'latePaymentPenaltyPercentage', label: 'Late Payment Penalty (%)', type: 'number', icon: Percent },
        { name: 'latePaymentPenaltyDelayDays', label: 'Late Payment Grace Period (Days)', type: 'number', icon: Clock },
        { name: 'reconnectionFee', label: 'Reconnection Fee (PHP)', type: 'number', icon: KeyRound },
        { name: 'fcdaPercentage', label: 'FCDA (%)', type: 'number', icon: Percent },
        { name: 'environmentalChargePercentage', label: 'Environmental Charge (%)', type: 'number', icon: Wind },
        { name: 'vatPercentage', label: 'VAT (%)', type: 'number', icon: Percent },
    ];
    
    const featureSettings = [
        { name: 'isOnlinePaymentsEnabled', label: 'Enable Online Payments', type: 'checkbox', icon: Briefcase },
        { name: 'isSignupEnabled', label: 'Enable New User Sign-ups', type: 'checkbox', icon: UserPlus },
        { name: 'isGoogleLoginEnabled', label: 'Enable Sign-in with Google', type: 'checkbox', icon: UserPlus },
        { name: 'isPasswordlessLoginEnabled', label: 'Enable Passwordless (Email Link) Sign-in', type: 'checkbox', icon: UserPlus },
        { name: 'isChatbotEnabled', label: 'Enable Chatbot', type: 'checkbox', icon: MessageSquare },
    ];

    const communicationSettings = [
        { name: 'supportHotline', label: 'Support Hotline Number', type: 'text', icon: Phone, placeholder: 'e.g., 1627-AGWA' },
        { name: 'supportEmail', label: 'Support Email Address', type: 'email', icon: AtSign, placeholder: 'e.g., support@agwa.com' },
        { name: 'autoCloseTicketsDays', label: 'Auto-close Resolved Tickets After (Days)', type: 'number', icon: Clock },
    ];

    const dangerZoneActions = [
        { label: 'Clear All Support Tickets', action: 'tickets' },
        { label: 'Clear All Bills', action: 'bills' },
        { label: 'Clear All Meter Readings', action: 'readings' },
        { label: 'Clear All Announcements', action: 'announcements' },
    ];

    if (isLoading) {
        return <LoadingSpinner message="Loading system settings..." className="mt-10 h-64" />;
    }

    return (
        <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <Settings size={30} className="mr-3 text-gray-600" /> System Configuration
                </h2>
                 <button type="submit" className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 w-auto mt-4 sm:mt-0`} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm flex items-center">
                    <AlertTriangle size={20} className="mr-2" /> {error}
                </div>
            )}

            <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">General & Maintenance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generalSettings.map(field => <SettingRow key={field.name} field={field} settings={settings} handleChange={handleChange} />)}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Billing & Financial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {billingSettings.map(field => <SettingRow key={field.name} field={field} settings={settings} handleChange={handleChange} />)}
                    </div>
                </section>

                 <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Portal Features & Authentication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featureSettings.map(field => <SettingRow key={field.name} field={field} settings={settings} handleChange={handleChange} />)}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Communication & Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {communicationSettings.map(field => <SettingRow key={field.name} field={field} settings={settings} handleChange={handleChange} />)}
                    </div>
                </section>
            </div>

            <div className="mt-12 pt-6 border-t-2 border-red-300">
                <h3 className="text-xl font-bold text-red-700 flex items-center">
                    <AlertTriangle size={24} className="mr-2"/> Danger Zone
                </h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">These actions are destructive and cannot be undone. This will permanently delete transactional data from the database, effectively resetting parts of your system.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dangerZoneActions.map(action => (
                        <button type="button" key={action.action} onClick={() => setConfirmAction(action.action)} className="p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 hover:border-red-400 transition-colors text-left">
                            <p className="font-semibold text-red-800 flex items-center"><Trash2 size={16} className="mr-2"/>{action.label}</p>
                            <p className="text-xs text-red-600 mt-1">Permanently delete all {action.action} from the database.</p>
                        </button>
                    ))}
                </div>
            </div>

            {confirmAction && (
                <ConfirmationModal
                    isOpen={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={handleClearData}
                    title={`Confirm Deletion of All ${confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)}`}
                    confirmText={`Yes, delete all ${confirmAction}`}
                    isConfirming={isDeleting}
                    iconType="danger"
                >
                    <p>Are you absolutely sure you want to proceed? All <strong>{confirmAction}</strong> data will be permanently erased. This action cannot be undone.</p>
                </ConfirmationModal>
            )}

        </form>
    );
};

export default SystemSettingsSection;