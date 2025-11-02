import React, { useState } from 'react';
import { ClipboardEdit, Save, UserCircle, Hash, Loader2, Search, Gauge } from 'lucide-react';
import * as DataService from '../../services/dataService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";

const MeterReadingForm = ({ db, userData: meterReaderData, showNotification, customerToRead, onReadingSubmitted, isModalMode = false, onCloseModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    const [customerDetails, setCustomerDetails] = useState(customerToRead || null);
    const [readingValue, setReadingValue] = useState('');
    const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
    const [readingType, setReadingType] = useState('Actual');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearchUser = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            showNotification("Please enter a search term.", "warning");
            return;
        }
        setIsSearching(true);
        setSearchError('');
        setCustomerDetails(null);

        const result = await DataService.searchUserProfiles(db, searchTerm);

        if (result.success && result.data.length > 0) {
            setCustomerDetails(result.data[0]);
        } else if (result.success) {
            setSearchError(`No customer found matching "${searchTerm}".`);
        } else {
            setSearchError(result.error || "Failed to execute user search.");
        }
        setIsSearching(false);
    };

    const handleSubmitReading = async (e) => {
        e.preventDefault();
        if (!customerDetails) {
            showNotification("No customer selected. Please search for a customer first.", "error");
            return;
        }
        if (!readingValue || isNaN(parseFloat(readingValue)) || parseFloat(readingValue) < 0) {
            showNotification("Meter reading must be a valid, non-negative number.", "warning");
            return;
        }

        setIsSubmitting(true);
        const readingData = {
            userId: customerDetails.id,
            accountNumber: customerDetails.accountNumber,
            meterSerialNumber: customerDetails.meterSerialNumber || 'N/A',
            readingValue: parseFloat(readingValue),
            readingDate: readingDate,
            readingDateString: readingDate,
            readingType: readingType,
            notes: notes.trim(),
            readBy: meterReaderData.displayName || meterReaderData.email,
            readerId: meterReaderData.uid,
        };

        const submissionResult = await DataService.addMeterReading(db, readingData);
        if (submissionResult.success) {
            if(isModalMode && onReadingSubmitted) {
                onReadingSubmitted(submissionResult.id, readingData);
            } else {
                showNotification(`Reading for ${customerDetails.accountNumber} submitted successfully!`, "success");
                setSearchTerm('');
                setCustomerDetails(null);
                setReadingValue('');
                setNotes('');
                setReadingType('Actual');
            }
        } else {
            showNotification(submissionResult.error || "Failed to submit meter reading.", "error");
        }
        setIsSubmitting(false);
    };
    
    const readingTypeOptions = ['Actual', 'Estimated', 'No Reading', 'Customer Refused', 'Unable to Access Meter'];

    return (
        <div className={!isModalMode ? "p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn" : ""}>
            {!isModalMode && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                        <ClipboardEdit size={30} className="mr-3 text-blue-600" /> Search & Submit Reading
                    </h2>
                </div>
            )}
            
            {!customerDetails && !isModalMode && (
                 <form onSubmit={handleSearchUser} className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                    <label htmlFor="customerSearchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                        Find Customer to Read
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                id="customerSearchTerm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${commonInputClass} pl-9`}
                                placeholder="Search by Account No, Name, or Meter No..."
                                disabled={isSearching}
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center" disabled={isSearching}>
                            {isSearching ? <Loader2 size={18} className="animate-spin mr-2" /> : <Search size={18} className="mr-2" />}
                            Find
                        </button>
                    </div>
                    {searchError && <p className="text-red-500 text-xs mt-2">{searchError}</p>}
                </form>
            )}

            {isSearching && <LoadingSpinner message="Searching..." />}

            {customerDetails && (
                <form onSubmit={handleSubmitReading} className="space-y-5 p-4 border-t-4 border-blue-500 bg-blue-50 rounded-lg shadow-md animate-fadeIn">
                    <div className="p-3 border border-blue-200 bg-white rounded-md text-sm space-y-1">
                        <p className="font-semibold text-blue-800 flex items-center"><UserCircle size={16} className="mr-2"/>{customerDetails.displayName}</p>
                        <p className="text-gray-600 flex items-center"><Hash size={14} className="mr-2"/>Account No: {customerDetails.accountNumber}</p>
                        <p className="text-gray-600 flex items-center"><Gauge size={14} className="mr-2"/>Meter No: {customerDetails.meterSerialNumber || 'N/A'}</p>
                    </div>

                    <fieldset disabled={isSubmitting} className="space-y-5">
                        <div>
                            <label htmlFor="readingValue" className="block text-sm font-medium text-gray-700 mb-1">Current Meter Reading (m³)*</label>
                            <input type="number" id="readingValue" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} className={commonInputClass} step="0.01" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="readingDate" className="block text-sm font-medium text-gray-700 mb-1">Reading Date*</label>
                                <input type="date" id="readingDate" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} className={commonInputClass} required />
                            </div>
                            <div>
                                <label htmlFor="readingType" className="block text-sm font-medium text-gray-700 mb-1">Reading Type*</label>
                                <select id="readingType" value={readingType} onChange={(e) => setReadingType(e.target.value)} className={commonInputClass} required>
                                   {readingTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Remarks</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className={commonInputClass} placeholder="e.g., Meter obstructed, Dog on premises..." />
                        </div>
                    </fieldset>

                    <div className="flex gap-3">
                         {isModalMode && <button type="button" onClick={onCloseModal} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-6 rounded-lg" disabled={isSubmitting}>Cancel</button>}
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center disabled:opacity-60" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Reading'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MeterReadingForm;