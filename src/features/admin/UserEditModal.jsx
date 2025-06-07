// src/features/admin/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { User, Mail, Hash, Shield, Briefcase, Save, Loader2, MapPin, Gauge } from 'lucide-react';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonDisabledClass = "bg-gray-200 cursor-not-allowed text-gray-500";

const UserEditModal = ({ user, isOpen, onClose, onSave, isSaving, determineServiceTypeAndRole, showNotification }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email || '',
                accountNumber: user.accountNumber || '',
                accountStatus: user.accountStatus || 'Active',
                role: user.role || 'customer',
                serviceType: user.serviceType || 'Residential',
                meterSerialNumber: user.meterSerialNumber || '',
                serviceAddress: user.serviceAddress || '',
                meterSize: user.meterSize || '1/2"',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'accountNumber' && determineServiceTypeAndRole) {
            const { role, serviceType } = determineServiceTypeAndRole(value);
            newFormData = { ...newFormData, role, serviceType };
            if(showNotification) showNotification(`Role automatically set to '${role}' and Service Type to '${serviceType}' based on Account No. prefix.`, 'info');
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
    };

    const roleOptions = ['customer', 'admin', 'meterReader', 'clerk_cashier'];
    const statusOptions = ['Active', 'Inactive', 'Suspended', 'Profile Missing'];

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user.displayName || user.email}`} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="displayName" className="text-sm font-medium text-gray-700 flex items-center mb-1"><User size={14} className="mr-1.5"/>Full Name</label>
                        <input type="text" name="displayName" id="displayName" value={formData.displayName} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Mail size={14} className="mr-1.5"/>Email</label>
                        <input type="email" name="email" id="email" value={formData.email} className={`${commonInputClass} ${commonDisabledClass}`} disabled />
                    </div>
                    <div>
                        <label htmlFor="accountNumber" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Hash size={14} className="mr-1.5"/>Account Number</label>
                        <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleChange} className={commonInputClass} />
                    </div>
                    <div>
                        <label htmlFor="accountStatus" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Shield size={14} className="mr-1.5"/>Account Status</label>
                        <select name="accountStatus" id="accountStatus" value={formData.accountStatus} onChange={handleChange} className={commonInputClass}>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Briefcase size={14} className="mr-1.5"/>Role</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} className={`${commonInputClass} capitalize`}>
                             {roleOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="serviceType" className="text-sm font-medium text-gray-700 flex items-center mb-1"><User size={14} className="mr-1.5"/>Service Type</label>
                        <input type="text" name="serviceType" id="serviceType" value={formData.serviceType} className={`${commonInputClass} ${commonDisabledClass}`} disabled />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="serviceAddress" className="text-sm font-medium text-gray-700 flex items-center mb-1"><MapPin size={14} className="mr-1.5"/>Service Address</label>
                        <input type="text" name="serviceAddress" id="serviceAddress" value={formData.serviceAddress} onChange={handleChange} className={commonInputClass} />
                    </div>
                     <div>
                        <label htmlFor="meterSerialNumber" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Gauge size={14} className="mr-1.5"/>Meter Serial Number</label>
                        <input type="text" name="meterSerialNumber" id="meterSerialNumber" value={formData.meterSerialNumber} onChange={handleChange} className={commonInputClass} />
                    </div>
                     <div>
                        <label htmlFor="meterSize" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Gauge size={14} className="mr-1.5"/>Meter Size</label>
                        <input type="text" name="meterSize" id="meterSize" value={formData.meterSize} onChange={handleChange} className={commonInputClass} />
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border" disabled={isSaving}>Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center" disabled={isSaving}>
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;
