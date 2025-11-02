import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, MapPin, Clock, Info, CheckCircle, RotateCcw, Loader2, Zap, Map } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DataService from '../../services/dataService';
import { formatDate } from '../../utils/userUtils';
import DOMPurify from 'dompurify';
import BarangayMap from '../../components/ui/BarangayMap';
import naicBarangaysGeoJson from '../../data/naic_barangays.json';

const ServiceInterruptionsSection = ({ db, showNotification }) => {
    const [interruptions, setInterruptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInterruptions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const result = await DataService.getActiveServiceInterruptions(db);
        if (result.success) {
            setInterruptions(result.data);
        } else {
            setError(result.error || "Failed loading advisories.");
            showNotification(result.error || "Failed loading advisories.", "error");
        }
        setIsLoading(false);
    }, [db, showNotification]);

    useEffect(() => {
        fetchInterruptions();
    }, [fetchInterruptions]);

    const getStatusInfo = (status, type) => {
        if ((type === 'Emergency Repair' || type === 'Leak Detection') && status !== 'Resolved') {
             return { icon: Zap, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-400', label: 'Emergency' };
        }
        switch (status) {
            case 'Ongoing': return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-400', label: 'Ongoing' };
            case 'Scheduled': return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-400', label: 'Scheduled' };
            case 'Resolved': return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-400', label: 'Resolved' };
            default: return { icon: Info, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-400', label: status || 'Unknown' };
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <AlertTriangle size={30} className="mr-3 text-orange-500" /> Service Advisories
                </h2>
                <button onClick={fetchInterruptions} disabled={isLoading} className="flex items-center text-sm p-2 bg-gray-100 rounded-lg hover:bg-gray-200 border border-gray-300">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                     <span className="ml-1.5 hidden sm:inline">Refresh</span>
                </button>
            </div>

            {isLoading && <LoadingSpinner message="Loading advisories..." />}
            {error && <div className="text-red-600 bg-red-50 p-3 rounded-md text-center border border-red-200">{error}</div>}

            {!isLoading && !error && interruptions.length === 0 && (
                <div className="text-center py-10 bg-green-50 p-6 rounded-lg shadow-inner border border-green-200">
                    <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                    <p className="text-gray-700 text-lg font-medium">No Active Service Advisories</p>
                    <p className="text-sm text-gray-500 mt-1">Water service is currently stable.</p>
                </div>
            )}

            {!isLoading && !error && interruptions.length > 0 && (
                 <div className="space-y-4">
                    {interruptions.map(item => {
                        const statusInfo = getStatusInfo(item.status, item.type);
                        const StatusIcon = statusInfo.icon;
                        const cleanHtml = DOMPurify.sanitize(item.description || '');
                        return (
                            <details key={item.id} className={`p-4 rounded-lg shadow-md border-l-4 group transition-all duration-300 ease-in-out ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-lg`}>
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <div className="flex-grow pr-4">
                                         <h3 className="text-md sm:text-lg font-semibold text-gray-800">{item.title || 'Service Advisory'}</h3>
                                         <p className="text-xs text-gray-500 mt-0.5">ID: {item.id.substring(0, 8)}...</p>
                                    </div>
                                     <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center shrink-0 ${statusInfo.bgColor === 'bg-red-50' ? 'bg-red-100 text-red-700' : statusInfo.bgColor === 'bg-blue-50' ? 'bg-blue-100 text-blue-700' : statusInfo.bgColor === 'bg-orange-50' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        <StatusIcon size={14} className={`mr-1.5 ${statusInfo.color}`} /> {statusInfo.label}
                                    </span>
                                     <span className="ml-2 transition-transform duration-300 transform group-open:rotate-180 text-gray-500">▼</span>
                                </summary>
                                <div className="mt-4 pt-3 border-t border-gray-200/80 text-sm text-gray-700 space-y-3 grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                                    <div className="overflow-hidden space-y-4">
                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }}></div>
                                        
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Map size={16} className="mr-2 text-gray-500"/>Affected Area Map</h4>
                                            <BarangayMap
                                                geoJsonData={naicBarangaysGeoJson}
                                                affectedAreas={item.affectedAreas || []}
                                            />
                                        </div>

                                        <div className="text-xs text-gray-600 space-y-1 border-t border-gray-200/80 pt-3 mt-3">
                                            <p className="flex items-center"><MapPin size={12} className="mr-1.5 text-gray-400"/><strong>Affected:</strong> {item.affectedAreas?.join(', ') || 'N/A'}</p>
                                            <p className="flex items-center"><Clock size={12} className="mr-1.5 text-gray-400"/><strong>Start:</strong> {formatDate(item.startDate)}</p>
                                            {item.estimatedEndDate && <p className="flex items-center"><Clock size={12} className="mr-1.5 text-gray-400"/><strong>Est. End:</strong> {formatDate(item.estimatedEndDate)}</p>}
                                        </div>
                                    </div>
                                </div>
                            </details>
                        );
                    })}
                 </div>
            )}
        </div>
    );
};

export default ServiceInterruptionsSection;