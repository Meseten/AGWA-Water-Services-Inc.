import React, { useState, useEffect } from 'react';
import { FileText, Building, Loader2, PlayCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import * as DataService from '../../services/dataService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BatchBillingSection = ({ db, showNotification }) => {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [billableAccounts, setBillableAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processLog, setProcessLog] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const result = await DataService.getUniqueServiceLocations(db);
            if(result.success) {
                setLocations(result.data);
            } else {
                showNotification(result.error, 'error');
            }
        };
        fetchLocations();
    }, [db, showNotification]);

    const handleLocationSelect = async (location) => {
        setSelectedLocation(location);
        if (!location) {
            setBillableAccounts([]);
            return;
        }
        setIsLoading(true);
        setBillableAccounts([]);
        const result = await DataService.getBillableAccountsInLocation(db, location);
        if (result.success) {
            setBillableAccounts(result.data);
        } else {
            showNotification(result.error, 'error');
        }
        setIsLoading(false);
    };

    const handleRunBatchBilling = async () => {
        if (billableAccounts.length === 0) {
            showNotification("No billable accounts in the selected area.", "warning");
            return;
        }
        setIsProcessing(true);
        setProcessLog([]);
        
        const results = await DataService.generateBillsForMultipleAccounts(db, billableAccounts);
        
        setProcessLog(results);
        setIsProcessing(false);
        showNotification("Batch billing process completed. Check logs for details.", "success");
        handleLocationSelect(selectedLocation);
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
                <FileText size={30} className="mr-3 text-green-600" /> Batch Bill Generation
            </h2>
            <p className="text-sm text-gray-500 mb-6">Select a service area to find eligible accounts and generate bills in bulk. An account is eligible if it has a new reading that has not yet been billed.</p>

            <div className="p-4 bg-gray-50 rounded-lg border">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Select Service Area (Barangay)</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select id="location" value={selectedLocation} onChange={(e) => handleLocationSelect(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                        <option value="">-- Select an Area --</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <button onClick={handleRunBatchBilling} className="bg-green-600 text-white px-5 py-2 rounded-md flex items-center justify-center whitespace-nowrap disabled:bg-gray-400" disabled={isLoading || isProcessing || billableAccounts.length === 0}>
                        {isProcessing ? <Loader2 size={18} className="animate-spin mr-2"/> : <PlayCircle size={18} className="mr-2" />}
                        {isProcessing ? 'Processing...' : `Generate ${billableAccounts.length} Bills`}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold">Eligible Accounts in {selectedLocation || "..."}</h3>
                {isLoading && <LoadingSpinner message="Finding billable accounts..."/>}
                {!isLoading && selectedLocation && billableAccounts.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 mt-2 rounded-md">
                        <Info size={32} className="mx-auto text-gray-400 mb-2"/>
                        <p className="text-gray-600">No new readings eligible for billing in this area.</p>
                    </div>
                )}
                {!isLoading && billableAccounts.length > 0 && (
                    <p className="text-green-700 font-medium my-2">{billableAccounts.length} accounts ready for billing.</p>
                )}
            </div>

            {processLog.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Processing Log</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-900 text-white font-mono text-xs p-4 rounded-md">
                        {processLog.map((log, index) => (
                             <div key={index} className={`flex items-start ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                                {log.success ? <CheckCircle size={14} className="mr-2 mt-0.5 flex-shrink-0"/> : <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0"/>}
                                <span>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchBillingSection;