import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { Save, Loader2, Gauge, CalendarDays, ClipboardList, StickyNote } from 'lucide-react';
import { commonInputClass } from '../../styles/authFormStyles.js';

const MeterReadingEditModal = ({ isOpen, onClose, onSave, reading, isSaving, accountNumber }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (reading) {
            const date = reading.readingDate?.toDate ? reading.readingDate.toDate() : new Date(reading.readingDate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            
            setFormData({
                readingValue: reading.readingValue || '',
                readingDate: `${yyyy}-${mm}-${dd}`,
                readingType: reading.readingType || 'Actual',
                notes: reading.notes || '',
            });
        } else {
            setFormData({
                readingValue: '',
                readingDate: new Date().toISOString().split('T')[0],
                readingType: 'Actual',
                notes: '',
            });
        }
    }, [reading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(reading?.id, formData);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reading ? `Edit Reading for ${reading.accountNumber}` : `Create New Reading for ${accountNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="readingValue" className="text-sm font-medium text-gray-700 flex items-center mb-1"><Gauge size={14} className="mr-1.5"/>Reading Value (m³)</label>
                    <input type="number" name="readingValue" value={formData.readingValue} onChange={(e) => setFormData({...formData, readingValue: e.target.value})} className={commonInputClass} step="0.01" required />
                </div>
                <div>
                    <label htmlFor="readingDate" className="text-sm font-medium text-gray-700 flex items-center mb-1"><CalendarDays size={14} className="mr-1.5"/>Reading Date</label>
                    <input type="date" name="readingDate" value={formData.readingDate} onChange={(e) => setFormData({...formData, readingDate: e.target.value})} className={commonInputClass} required />
                </div>
                <div>
                    <label htmlFor="readingType" className="text-sm font-medium text-gray-700 flex items-center mb-1"><ClipboardList size={14} className="mr-1.5"/>Reading Type</label>
                    <select name="readingType" value={formData.readingType} onChange={(e) => setFormData({...formData, readingType: e.target.value})} className={commonInputClass}>
                        <option value="Actual">Actual</option>
                        <option value="Estimated">Estimated</option>
                        <option value="No Reading">No Reading</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center mb-1"><StickyNote size={14} className="mr-1.5"/>Notes</label>
                    <textarea name="notes" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={commonInputClass} />
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

export default MeterReadingEditModal;