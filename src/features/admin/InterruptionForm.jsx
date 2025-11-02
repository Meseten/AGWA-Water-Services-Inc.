import React, { useState, useEffect } from 'react';
import { Loader2, Save, AlertTriangle, Type, CalendarDays, CheckSquare, XSquare, MessageSquare, MapPin, Clock, PauseCircle, ChevronDown } from 'lucide-react';
import RichTextEditor from '../../components/ui/RichTextEditor.jsx';
import * as geoService from '../../services/geoService.js';
import DOMPurify from 'dompurify';

const InterruptionForm = ({ initialData = null, onSubmit, onCancel, isSaving, showNotification }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Maintenance');
    const [status, setStatus] = useState('Scheduled');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [estimatedEndDate, setEstimatedEndDate] = useState('');
    const [estimatedEndTime, setEstimatedEndTime] = useState('17:00');
    const [affectedAreas, setAffectedAreas] = useState([]);
    const [isBillingPaused, setIsBillingPaused] = useState(false);
    const [formError, setFormError] = useState('');

    const [districtBarangays, setDistrictBarangays] = useState({});
    const [allBarangays, setAllBarangays] = useState([]);

    useEffect(() => {
        const districts = geoService.getDistricts();
        const allBrgys = [];
        const districtMap = districts.reduce((acc, district) => {
            const brgys = geoService.getBarangaysInDistrict(district).sort();
            acc[district] = brgys;
            allBrgys.push(...brgys);
            return acc;
        }, {});
        setDistrictBarangays(districtMap);
        setAllBarangays(allBrgys.sort());
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setType(initialData.type || 'Maintenance');
            setStatus(initialData.status || 'Scheduled');
            setAffectedAreas(initialData.affectedAreas || []);
            setIsBillingPaused(initialData.isBillingPaused || false);

            const startDT = initialData.startDate?.toDate ? initialData.startDate.toDate() : null;
            const endDT = initialData.estimatedEndDate?.toDate ? initialData.estimatedEndDate.toDate() : null;

            setStartDate(startDT ? startDT.toISOString().split('T')[0] : '');
            setStartTime(startDT ? `${String(startDT.getHours()).padStart(2, '0')}:${String(startDT.getMinutes()).padStart(2, '0')}` : '08:00');
            setEstimatedEndDate(endDT ? endDT.toISOString().split('T')[0] : '');
            setEstimatedEndTime(endDT ? `${String(endDT.getHours()).padStart(2, '0')}:${String(endDT.getMinutes()).padStart(2, '0')}` : '17:00');

        } else {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            setTitle('');
            setDescription('');
            setType('Maintenance');
            setStatus('Scheduled');
            setStartDate(today);
            setStartTime('08:00');
            setEstimatedEndDate(today);
            setEstimatedEndTime('17:00');
            setAffectedAreas([]);
            setIsBillingPaused(false);
        }
    }, [initialData]);

    const handleDescriptionChange = (value) => {
        setDescription(value);
         if (formError && value.replace(/<[^>]*>?/gm, '').trim()) setFormError('');
    };

    const handleAreaChange = (barangay) => {
        setAffectedAreas(prev =>
            prev.includes(barangay)
                ? prev.filter(b => b !== barangay)
                : [...prev, barangay]
        );
         if (formError && affectedAreas.length > 0) setFormError('');
    };

    const handleSelectAllAreas = () => {
        if (affectedAreas.length === allBarangays.length) {
            setAffectedAreas([]);
        } else {
            setAffectedAreas([...allBarangays]);
            if (formError) setFormError('');
        }
    };
    
    const handleSelectDistrict = (district, brgys) => {
        const allInDistrict = brgys.every(b => affectedAreas.includes(b));
        if (allInDistrict) {
            setAffectedAreas(prev => prev.filter(b => !brgys.includes(b)));
        } else {
            setAffectedAreas(prev => [...new Set([...prev, ...brgys])]);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        const plainTextDescription = description.replace(/<[^>]*>?/gm, '').trim();

        if (!title.trim() || !plainTextDescription || !startDate || !startTime || affectedAreas.length === 0) {
            setFormError("Title, Description, Affected Area(s), Start Date/Time are required.");
            return;
        }

        const startDateTime = new Date(`${startDate}T${startTime}`);
        if (isNaN(startDateTime)) {
            setFormError("Invalid Start Date or Time.");
            return;
        }

        let endDateTime = null;
        if (estimatedEndDate && estimatedEndTime) {
            endDateTime = new Date(`${estimatedEndDate}T${estimatedEndTime}`);
             if (isNaN(endDateTime)) {
                setFormError("Invalid Estimated End Date or Time.");
                return;
            }
            if (endDateTime <= startDateTime) {
                setFormError("Estimated End must be after Start.");
                return;
            }
        }

        const sanitizedDescription = DOMPurify.sanitize(description);

        const interruptionData = {
            title: title.trim(),
            description: sanitizedDescription,
            type,
            status,
            startDate: startDateTime,
            estimatedEndDate: endDateTime,
            affectedAreas: affectedAreas.sort(),
            isBillingPaused: isBillingPaused,
        };
        onSubmit(interruptionData);
    };

    const commonInputClass = "w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm text-gray-900";
    const commonButtonClass = "flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95 text-sm";

    const interruptionTypes = ['Maintenance', 'Emergency Repair', 'System Upgrade', 'Leak Detection', 'Other'];
    const interruptionStatuses = ['Scheduled', 'Ongoing', 'Resolved'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {formError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                    <AlertTriangle size={20} className="mr-2" /> {formError}
                </div>
            )}
            <div>
                <label htmlFor="interruptionTitle" className="block text-sm font-medium text-gray-700 mb-1"><Type size={16} className="inline mr-1.5" />Title *</label>
                <input type="text" id="interruptionTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} placeholder="E.g., Water Interruption in Brgy. Muzon" required />
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                 <RichTextEditor
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Provide details..."
                    className="bg-white rounded-lg border border-gray-300 min-h-[150px]"
                />
                 {formError && !description.replace(/<[^>]*>?/gm, '').trim() && <p className="text-red-500 text-xs mt-1">Description is required.</p>}
            </div>

             <div className="p-4 border rounded-lg bg-gray-50 max-h-72 overflow-y-auto scrollbar-thin">
                 <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-50 py-1 -mt-1 border-b border-gray-200">
                     <label className="block text-sm font-medium text-gray-700"><MapPin size={16} className="inline mr-1.5" />Affected Area(s) *</label>
                     <button type="button" onClick={handleSelectAllAreas} className="text-xs font-medium text-blue-600 hover:underline">
                         {affectedAreas.length === allBarangays.length ? 'Deselect All' : `Select All (${allBarangays.length})`}
                     </button>
                 </div>
                 <div className="space-y-2">
                    {Object.entries(districtBarangays).map(([district, brgys]) => (
                        <details key={district} className="group bg-white border rounded-md">
                            <summary className="flex justify-between items-center p-2 cursor-pointer list-none">
                                <span className="font-semibold text-sm text-blue-700">{district}</span>
                                <div className="flex items-center">
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.preventDefault(); handleSelectDistrict(district, brgys); }}
                                        className="text-xs text-blue-600 hover:underline mr-2"
                                    >
                                        Toggle District
                                    </button>
                                    <ChevronDown size={18} className="text-gray-500 group-open:rotate-180 transition-transform"/>
                                </div>
                            </summary>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 border-t border-gray-100">
                                {brgys.map(b => (
                                    <label key={b} className="flex items-center space-x-2 p-1.5 rounded bg-gray-50 border border-gray-200 hover:bg-blue-50 cursor-pointer text-xs has-[:checked]:bg-blue-100 has-[:checked]:border-blue-300">
                                        <input
                                            type="checkbox"
                                            checked={affectedAreas.includes(b)}
                                            onChange={() => handleAreaChange(b)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                                        />
                                        <span className="truncate" title={b}>{b}</span>
                                    </label>
                                ))}
                            </div>
                        </details>
                    ))}
                 </div>
                  {formError && affectedAreas.length === 0 && <p className="text-red-500 text-xs mt-2">Select at least one area.</p>}
             </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label htmlFor="interruptionType" className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select id="interruptionType" value={type} onChange={(e) => setType(e.target.value)} className={commonInputClass} required>
                        {interruptionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="interruptionStatus" className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select id="interruptionStatus" value={status} onChange={(e) => setStatus(e.target.value)} className={commonInputClass} required>
                        {interruptionStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                    <label className="flex items-center space-x-2 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer hover:bg-yellow-100">
                         <input
                            type="checkbox"
                            checked={isBillingPaused}
                            onChange={(e) => setIsBillingPaused(e.target.checked)}
                            className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-medium text-yellow-800 flex items-center"><PauseCircle size={16} className="mr-1.5"/> Pause Billing</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1"><CalendarDays size={16} className="inline mr-1.5" />Start Date & Time *</label>
                     <div className="flex gap-2">
                         <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={commonInputClass} required />
                         <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={commonInputClass} required />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1"><Clock size={16} className="inline mr-1.5" />Estimated End Date & Time</label>
                      <div className="flex gap-2">
                          <input type="date" id="estimatedEndDate" value={estimatedEndDate} onChange={(e) => setEstimatedEndDate(e.target.value)} className={commonInputClass} min={startDate} />
                          <input type="time" id="estimatedEndTime" value={estimatedEndTime} onChange={(e) => setEstimatedEndTime(e.target.value)} className={commonInputClass} />
                      </div>
                      {formError.includes("End Date/Time") && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                </div>
            </div>

             <div className="pt-6 border-t mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                 <button type="button" onClick={onCancel} className={`${commonButtonClass} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300 w-full sm:w-auto order-2 sm:order-1`} disabled={isSaving}>Cancel</button>
                 <button type="submit" className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 w-full sm:w-auto order-1 sm:order-2`} disabled={isSaving}>
                    {isSaving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                    {isSaving ? 'Saving...' : (initialData ? 'Update Advisory' : 'Create Advisory')}
                 </button>
            </div>
             <style>{`
                .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #9ca3af #f3f4f6; }
                .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px;}
                .scrollbar-thin::-webkit-scrollbar-track { background: #f3f4f6; border-radius:3px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #9ca3af; border-radius: 3px; border: 1px solid #f3f4f6;}
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
             `}</style>
        </form>
    );
};

export default InterruptionForm;