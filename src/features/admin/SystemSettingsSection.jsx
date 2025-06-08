import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Save, Loader2, AlertTriangle, Percent, Megaphone, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { db } from '../../firebase/firebaseConfig.js';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonButtonClass = "flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";

const SystemSettingsSection = ({ showNotification = console.log }) => {
    const [settings, setSettings] = useState({
        portalAnnouncement: '',
        isBannerEnabled: false,
        fcdaPercentage: 1.29,
        latePaymentPenaltyPercentage: 2.0,
        environmentalChargePercentage: 25.0,
        sewerageChargePercentageCommercial: 32.85,
        governmentTaxPercentage: 2.0,
        vatPercentage: 12.0,
        maintenanceMode: false,
        defaultBillingCycleStartDay: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const result = await DataService.getSystemSettings(db);
        if (result.success && result.data) {
            setSettings(prevDefaults => ({
                ...prevDefaults,
                ...result.data
            }));
        } else if (result.error) {
            setError("Failed to load system settings. Default values are shown.");
            showNotification(result.error, "error");
        }
        setIsLoading(false);
    }, [showNotification]);

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

        if (settings.latePaymentPenaltyPercentage < 0 || settings.latePaymentPenaltyPercentage > 50) {
            showNotification("Late Payment Penalty must be between 0 and 50.", "warning");
            setIsSaving(false);
            return;
        }

        const result = await DataService.updateSystemSettings(db, settings);
        if (result.success) {
            showNotification("System settings updated successfully!", "success");
        } else {
            setError(result.error || "Failed to save system settings.");
            showNotification(result.error || "Failed to save system settings.", "error");
        }
        setIsSaving(false);
    };
    
    const settingFields = [
        { name: 'portalAnnouncement', label: 'Portal-Wide Announcement Banner Text', type: 'textarea', icon: Megaphone, placeholder: "E.g., Scheduled system maintenance tonight from 10 PM to 11 PM.", rows: 3 },
        { name: 'isBannerEnabled', label: 'Enable Announcement Banner', type: 'checkbox', icon: Megaphone, info: "Check this to show the announcement banner to all logged-in users." },
        { name: 'fcdaPercentage', label: 'FCDA Percentage (%)', type: 'number', icon: Percent, step: "0.01", min: "0", max: "100", info: "Foreign Currency Differential Adjustment rate." },
        { name: 'latePaymentPenaltyPercentage', label: 'Late Payment Penalty (%)', type: 'number', icon: Clock, step: "0.1", min: "0", max: "50", info: "Penalty rate applied to overdue bills." },
        { name: 'vatPercentage', label: 'VAT (%)', type: 'number', icon: Percent, step: "0.01", min: "0", max: "100", info: "Value Added Tax percentage for billing calculations." },
        { name: 'maintenanceMode', label: 'Enable Portal Maintenance Mode', type: 'checkbox', icon: AlertTriangle, info: "Puts the portal in a limited-access mode for non-admin users." },
    ];

    if (isLoading) {
        return <LoadingSpinner message="Loading system settings..." className="mt-10 h-64" />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <Settings size={30} className="mr-3 text-gray-600" /> System Configuration
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                    <AlertTriangle size={20} className="mr-2" /> {error}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
                {settingFields.map(field => {
                    const Icon = field.icon;
                    return (
                        <div key={field.name} className="p-4 border rounded-lg bg-gray-50/50">
                            <label htmlFor={field.name} className={`block text-sm font-medium text-gray-700 mb-1.5 ${field.type !== 'checkbox' ? 'flex items-center' : ''}`}>
                                {Icon && <Icon size={16} className="mr-2 text-gray-500" />}
                                {field.label}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea id={field.name} name={field.name} rows={field.rows || 3} value={settings[field.name] || ''} onChange={handleChange} className={commonInputClass} placeholder={field.placeholder}/>
                            ) : field.type === 'checkbox' ? (
                                <label className="flex items-center space-x-3 cursor-pointer p-2">
                                    <input type="checkbox" id={field.name} name={field.name} checked={!!settings[field.name]} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                    <span className="text-sm text-gray-600 select-none">{field.info || 'Enable/Disable'}</span>
                                </label>
                            ) : (
                                <input type={field.type} id={field.name} name={field.name} value={settings[field.name] ?? ''} onChange={handleChange} className={commonInputClass} step={field.step} min={field.min} max={field.max} placeholder={field.placeholder}/>
                            )}
                            {field.info && field.type !== 'checkbox' && <p className="text-xs text-gray-500 mt-1 pl-1">{field.info}</p>}
                        </div>
                    );
                })}

                <div className="pt-5 border-t border-gray-200 flex justify-end">
                    <button type="submit" className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`} disabled={isSaving || isLoading}>
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save System Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemSettingsSection;