import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { User, Mail, Hash, Shield, Briefcase, Save, Loader2, MapPin, Gauge } from 'lucide-react';
import * as geoService from '../../services/geoService';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonDisabledClass = "bg-gray-200 cursor-not-allowed text-gray-500";

const UserEditModal = ({ user, isOpen, onClose, onSave, isSaving, determineServiceTypeAndRole }) => {
    const [formData, setFormData] = useState({});
    const [addressForm, setAddressForm] = useState({ district: '', barangay: '', street: '', landmark: '' });
    const [districts, setDistricts] = useState([]);
    const [barangays, setBarangays] = useState([]);

    useEffect(() => {
        setDistricts(geoService.getDistricts());
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email || '',
                accountNumber: user.accountNumber || '',
                accountStatus: user.accountStatus || 'Active',
                role: user.role || 'customer',
                serviceType: user.serviceType || 'Residential',
                meterSerialNumber: user.meterSerialNumber || '',
                meterSize: user.meterSize || '1/2"',
            });
             if (user.serviceAddress && typeof user.serviceAddress === 'object') {
                const currentDistrict = user.serviceAddress.district || '';
                setAddressForm(user.serviceAddress);
                if (currentDistrict) {
                    setBarangays(geoService.getBarangaysInDistrict(currentDistrict));
                }
            } else {
                 setAddressForm({ district: '', barangay: '', street: '', landmark: '' });
            }
        }
    }, [user]);
    
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => {
            const newAddress = { ...prev, [name]: value };
            if (name === 'district') {
                newAddress.barangay = '';
                setBarangays(geoService.getBarangaysInDistrict(value));
            }
            return newAddress;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'accountNumber' && determineServiceTypeAndRole) {
            const { role, serviceType } = determineServiceTypeAndRole(value);
            newFormData = { ...newFormData, role, serviceType };
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, serviceAddress: addressForm });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user.displayName || user.email}`} size="3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className={commonInputClass} placeholder="Full Name" />
                    <input type="email" name="email" value={formData.email} className={`${commonInputClass} ${commonDisabledClass}`} disabled />
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={commonInputClass} placeholder="Account Number" />
                    <select name="accountStatus" value={formData.accountStatus} onChange={handleChange} className={commonInputClass}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                    <select name="role" value={formData.role} onChange={handleChange} className={`${commonInputClass} capitalize`}>
                         {['customer', 'admin', 'meter_reader', 'clerk_cashier'].map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                    </select>
                    <input type="text" name="serviceType" value={formData.serviceType} className={`${commonInputClass} ${commonDisabledClass}`} disabled />
                    <input type="text" name="meterSerialNumber" value={formData.meterSerialNumber} onChange={handleChange} className={commonInputClass} placeholder="Meter Serial Number" />
                    <input type="text" name="meterSize" value={formData.meterSize} onChange={handleChange} className={commonInputClass} placeholder="Meter Size" />
                </div>
                 <div className="pt-4 mt-4 border-t">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Service Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="district" value={addressForm.district} onChange={handleAddressChange} className={commonInputClass}>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select name="barangay" value={addressForm.barangay} onChange={handleAddressChange} className={commonInputClass} disabled={!addressForm.district}>
                            <option value="">Select Barangay</option>
                            {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="md:col-span-2">
                             <input type="text" name="street" value={addressForm.street} onChange={handleAddressChange} className={commonInputClass} placeholder="Street Name, Building, House No." />
                        </div>
                        <div className="md:col-span-2">
                             <input type="text" name="landmark" value={addressForm.landmark} onChange={handleAddressChange} className={commonInputClass} placeholder="Landmark" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border" disabled={isSaving}>Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg flex items-center" disabled={isSaving}>
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;