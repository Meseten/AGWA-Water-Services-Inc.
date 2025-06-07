// src/features/customer/MyTicketsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Clock, AlertTriangle, CheckCircle, Info, RotateCcw, Loader2, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';

const MyTicketsSection = ({ db, user, showNotification }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        // This query is now allowed by the new firestore.rules
        const result = await DataService.getTicketsByReporter(db, user.uid);
        if (result.success) {
            setTickets(result.data);
        } else {
            setError(result.error || "Failed to fetch your support tickets.");
            showNotification(result.error || "Failed to fetch tickets.", "error");
        }
        setIsLoading(false);
    }, [db, user.uid, showNotification]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);
    
    const getStatusPillClass = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Resolved':
            case 'Closed':
                 return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading your support tickets..." />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <MessageSquare size={30} className="mr-3 text-purple-600" /> My Support Tickets
                </h2>
                 <button onClick={fetchTickets} disabled={isLoading} className="flex items-center text-sm p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-center">{error}</div>}
            
            {tickets.length === 0 && !error && (
                <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <Info size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">You have not submitted any support tickets.</p>
                    <p className="text-sm text-gray-500 mt-1">You can report an issue from your dashboard.</p>
                </div>
            )}

            <div className="space-y-4">
                {tickets.map(ticket => (
                    <details key={ticket.id} className="p-4 rounded-lg shadow-md border-l-4 bg-gray-50 border-purple-400 group">
                        <summary className="flex flex-wrap justify-between items-center gap-2 cursor-pointer">
                            <div>
                                <h3 className="text-md font-semibold text-gray-800">{ticket.issueType}</h3>
                                <p className="text-xs text-gray-500">Submitted: {formatDate(ticket.submittedAt, { month: 'long', day: 'numeric' })}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusPillClass(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </summary>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-700 space-y-2">
                           <p><strong>Description:</strong> {ticket.description}</p>
                           {ticket.adminNotes && ticket.adminNotes.length > 0 && (
                               <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                   <p className="font-semibold text-xs text-blue-700">Admin Response:</p>
                                   <p className="text-xs">{ticket.adminNotes[ticket.adminNotes.length - 1].text}</p>
                                   <p className="text-right text-xs text-gray-500 mt-1">- {ticket.adminNotes[ticket.adminNotes.length - 1].authorName} on {formatDate(ticket.adminNotes[ticket.adminNotes.length - 1].timestamp)}</p>
                               </div>
                           )}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default MyTicketsSection;
