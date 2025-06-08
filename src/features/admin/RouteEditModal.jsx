import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Save, Loader2, List, Info } from 'lucide-react';
import * as DataService from '../../services/dataService';
import * as geoService from '../../services/geoService';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-150 text-sm";

const RouteEditModal = ({ isOpen, onClose, onSave, route, readers, isSaving, db }) => {
    const [formData, setFormData] = useState({
        name: '',
        areaCode: '',
        description: '',
        assignedReaderId: '',
        district: '',
        barangay: ''
    });
    const [accountNumbers, setAccountNumbers] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDistricts(geoService.getDistricts());
            if (route) {
                const initialDistrict = route.district || '';
                setFormData({
                    name: route.name || '',
                    areaCode: route.areaCode || '',
                    description: route.description || '',
                    assignedReaderId: route.assignedReaderId || '',
                    district: initialDistrict,
                    barangay: route.barangay || ''
                });
                if (initialDistrict) {
                    setBarangays(geoService.getBarangaysInDistrict(initialDistrict));
                }
                setAccountNumbers(route.accountNumbers || []);
            } else {
                setFormData({ name: '', areaCode: '', description: '', assignedReaderId: '', district: '', barangay: '' });
                setAccountNumbers([]);
                setBarangays([]);
            }
        }
    }, [route, isOpen]);
    
    const handleDistrictChange = (e) => {
        const district = e.target.value;
        setFormData(prev => ({ ...prev, district, barangay: '' }));
        setBarangays(geoService.getBarangaysInDistrict(district));
        setAccountNumbers([]);
    };

    const handleBarangayChange = async (e) => {
        const barangay = e.target.value;
        setFormData(prev => ({ ...prev, barangay }));
        if (barangay) {
            setIsFetchingAccounts(true);
            const result = await DataService.getAccountsByLocation(db, barangay);
            if (result.success) {
                setAccountNumbers(result.data);
            }
            setIsFetchingAccounts(false);
        } else {
            setAccountNumbers([]);
        }
    };
    
    const generateAreaCode = (routeName) => {
        if (!routeName) return '';
        return routeName.split(' ').map(w => w[0]).join('').toUpperCase();
    }

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({ ...prev, name, areaCode: generateAreaCode(name) }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            areaCode: formData.areaCode,
            description: formData.description,
            assignedReaderId: formData.assignedReaderId,
            district: formData.district,
            barangay: formData.barangay,
            accountNumbers
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={route ? 'Edit Meter Route' : 'Create New Meter Route'} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Route Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleNameChange} className={commonInputClass} required />
                    </div>
                    <div>
                        <label htmlFor="areaCode" className="block text-sm font-medium mb-1">Generated Area Code</label>
                        <input type="text" name="areaCode" value={formData.areaCode} className={`${commonInputClass} bg-gray-200`} readOnly />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium mb-1">District</label>
                        <select name="district" value={formData.district} onChange={handleDistrictChange} className={commonInputClass} required>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="barangay" className="block text-sm font-medium mb-1">Barangay</label>
                        <select name="barangay" value={formData.barangay} onChange={handleBarangayChange} className={commonInputClass} required disabled={!formData.district}>
                            <option value="">Select Barangay</option>
                            {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="assignedReaderId" className="block text-sm font-medium mb-1">Assign to Meter Reader</label>
                    <select name="assignedReaderId" value={formData.assignedReaderId} onChange={handleChange} className={commonInputClass}>
                        <option value="">Unassigned</option>
                        {readers.map(reader => (
                            <option key={reader.id} value={reader.id}>{reader.displayName} ({reader.email})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className={commonInputClass}></textarea>
                </div>
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 flex items-center"><List size={16} className="mr-2"/>Auto-Assigned Accounts</p>
                    {isFetchingAccounts ? <div className="flex items-center text-sm text-gray-500"><Loader2 className="animate-spin h-4 w-4 mr-2"/>Searching for accounts...</div> :
                        (formData.barangay && accountNumbers.length > 0 ? (
                            <p className="text-sm text-gray-700">{accountNumbers.length} accounts found for {formData.barangay} and will be assigned.</p>
                        ) : formData.barangay && accountNumbers.length === 0 ? (
                            <p className="text-sm text-orange-700 bg-orange-100 p-2 rounded-md flex items-center"><Info size={14} className="mr-2"/>No accounts found for this location. You cannot save an empty route.</p>
                        ) : (
                            <p className="text-xs text-gray-500">Select a location to find and assign real accounts from your database.</p>
                        ))
                    }
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg" disabled={isSaving}>Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={isSaving || isFetchingAccounts || accountNumbers.length === 0}>
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Route'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RouteEditModal;