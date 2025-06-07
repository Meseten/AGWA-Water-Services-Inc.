import React, { useState, useEffect } from 'react';
import { UserCog, Edit3, Save, Loader2, Mail, Hash, MapPin, Camera, ShieldCheck, Briefcase, Droplets, UserCircle, Gauge, AlertTriangle } from 'lucide-react';
import * as DataService from '../../services/dataService.js';
import * as AuthService from '../../services/authService.js';
import { generatePlaceholderPhotoURL } from '../../utils/userUtils.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonDisabledClass = "bg-gray-200 cursor-not-allowed text-gray-500";

// DEFINITIVE FIX: Component now accepts props instead of using a hook.
const MyProfileSection = ({ user, userData, setUserData, auth, db, showNotification }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileDataForm, setProfileDataForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userData) {
            setProfileDataForm({ ...userData });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileDataForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError('');
        if (!profileDataForm.displayName?.trim()) {
            setError("Display Name cannot be empty.");
            return;
        }
        if (!user || !auth || !db) {
            setError("Session invalid. Cannot save profile.");
            return;
        }

        setIsSaving(true);
        const dataToUpdateInFirestore = {
            displayName: profileDataForm.displayName.trim(),
            photoURL: profileDataForm.photoURL?.trim() || '',
            serviceAddress: profileDataForm.serviceAddress?.trim() || '',
            meterSize: profileDataForm.meterSize || userData.meterSize,
        };

        const firestoreUpdateResult = await DataService.updateUserProfile(db, user.uid, dataToUpdateInFirestore);

        if (!firestoreUpdateResult.success) {
            showNotification(firestoreUpdateResult.error || "Failed to update profile in database.", "error");
            setIsSaving(false);
            return;
        }

        const authUpdates = {};
        if (profileDataForm.displayName.trim() !== user.displayName) {
            authUpdates.displayName = profileDataForm.displayName.trim();
        }
        if ((profileDataForm.photoURL?.trim() || '') !== (user.photoURL || '')) {
            authUpdates.photoURL = profileDataForm.photoURL?.trim() || '';
        }

        if (Object.keys(authUpdates).length > 0) {
            const authUpdateResult = await AuthService.updateUserFirebaseAuthProfile(auth, authUpdates);
            if (!authUpdateResult.success) {
                showNotification(authUpdateResult.error || "Partially updated: Could not update auth profile.", "warning");
            }
        }
        
        setUserData(prev => ({ ...prev, ...dataToUpdateInFirestore }));
        showNotification("Profile updated successfully!", "success");
        setIsEditing(false);
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (userData) {
             setProfileDataForm({ ...userData });
        }
        setError('');
    };
    
    const meterSizeOptions = [
        '1/2"', '15mm', '3/4"', '20mm', '1"', '25mm', '1 1/4"', '32mm', '1 1/2"', '40mm', 
        '2"', '50mm', '3"', '75mm', '4"', '100mm', '6"', '150mm', '8"', '200mm', 'Other'
    ];

    const InfoField = ({ label, value, icon: Icon, isEditable = false, name, onChange, type = "text", placeholder = "", options = [] }) => (
        <div>
            <label htmlFor={name} className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                {Icon && <Icon size={14} className="mr-1.5 text-gray-400" />}
                {label}
            </label>
            {isEditing && isEditable ? (
                type === "select" ? (
                    <select name={name} id={name} value={value} onChange={onChange} className={commonInputClass}>
                        <option value="">{placeholder || `Select ${label}...`}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                <input type={type} name={name} id={name} value={value || ''} onChange={onChange} className={commonInputClass} placeholder={placeholder} />
                )
            ) : (
                <p className={`text-sm text-gray-800 px-3 py-2.5 rounded-md ${commonDisabledClass} truncate`} title={value}>{value || 'N/A'}</p>
            )}
        </div>
    );

    if (!userData) {
        return <LoadingSpinner message="Loading profile..." />;
    }
    const effectivePhotoURL = profileDataForm.photoURL || generatePlaceholderPhotoURL(profileDataForm.displayName);

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <UserCog size={30} className="mr-3 text-blue-600" /> My Profile
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-3 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all active:scale-95"
                    >
                        <Edit3 size={18} className="mr-2" /> Edit Profile
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                    <AlertTriangle size={20} className="mr-2" /> {error}
                </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex flex-col items-center mb-6 space-y-3">
                    <div className="relative">
                        <img
                            src={effectivePhotoURL}
                            alt="Profile"
                            className="h-28 w-28 rounded-full object-cover border-4 border-blue-200 shadow-md bg-gray-200"
                            onError={(e) => { e.target.onerror = null; e.target.src = generatePlaceholderPhotoURL(profileDataForm.displayName); }}
                        />
                         {isEditing && (
                            <label htmlFor="photoURLInput" className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow transition-all">
                                <Camera size={14} />
                            </label>
                        )}
                    </div>
                    {isEditing && (
                         <input type="url" name="photoURL" id="photoURLInput" value={profileDataForm.photoURL || ''} onChange={handleChange} className={`${commonInputClass} text-xs w-full max-w-sm text-center`} placeholder="Image URL (e.g., https://...)" />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoField label="Full Name" value={profileDataForm.displayName} icon={UserCircle} isEditable={true} name="displayName" onChange={handleChange} />
                    <InfoField label="Email Address" value={profileDataForm.email} icon={Mail} />
                    <InfoField label="AGWA Account No." value={profileDataForm.accountNumber} icon={Hash} />
                    <InfoField label="Meter Serial No." value={profileDataForm.meterSerialNumber} icon={Briefcase} />
                    <InfoField label="Account Status" value={profileDataForm.accountStatus} icon={ShieldCheck} />
                    <InfoField label="User Role" value={profileDataForm.role?.replace(/_/g, ' ')} icon={UserCog} valueClass="capitalize" />
                    <InfoField label="Service Type" value={profileDataForm.serviceType} icon={Droplets} />
                    <InfoField 
                        label="Meter Size" 
                        value={profileDataForm.meterSize} 
                        icon={Gauge}
                        isEditable={true}
                        name="meterSize"
                        onChange={handleChange}
                        type="select"
                        options={meterSizeOptions}
                        placeholder="Select Meter Size"
                    />
                    <div className="md:col-span-2">
                        <InfoField label="Service Address" value={profileDataForm.serviceAddress} icon={MapPin} isEditable={true} name="serviceAddress" onChange={handleChange} placeholder="Your service location" />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-5">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition active:scale-95 w-full sm:w-auto"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition active:scale-95 disabled:opacity-60 w-full sm:w-auto flex items-center justify-center"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MyProfileSection;