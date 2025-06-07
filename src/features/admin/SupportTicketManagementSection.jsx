// src/features/admin/SupportTicketManagementSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Eye, Loader2, Filter, AlertTriangle, CheckCircle, RotateCcw, Info } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import TicketViewModal from './TicketViewModal.jsx'; // Import the new modal
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';

/**
 * SupportTicketManagementSection for admins to view and manage support tickets.
 * @param {object} props - Component props from DashboardLayout.
 * @param {object} props.db - Firestore instance.
 * @param {string} props.appId - Application ID.
 * @param {object} props.userData - Current admin's user data (passed as adminUserData to modal).
 * @param {function} props.showNotification - Function to display notifications.
 */
const SupportTicketManagementSection = ({ db, appId, userData: adminUserData, showNotification }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingTicket, setViewingTicket] = useState(null); // Ticket object for TicketViewModal
    
    const [filterStatus, setFilterStatus] = useState(""); // "Open", "In Progress", etc.
    const [filterIssueType, setFilterIssueType] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // For searching by Ticket ID, User Name, Email, Account Number

    const commonSelectClass = "w-full sm:w-auto text-sm px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150";
    const commonInputClass = `${commonSelectClass} placeholder-gray-400`;


    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        // DataService.getAllSupportTickets can be enhanced to accept filters directly
        // For now, client-side filtering after fetching all or based on primary status filter if service supports it
        const result = await DataService.getAllSupportTickets(db, filterStatus || null); // Pass primary status filter if service supports it
        if (result.success) {
            setTickets(result.data); // Already sorted by submittedAt desc in service
        } else {
            showNotification(result.error || "Failed to fetch support tickets.", "error");
            setTickets([]);
        }
        setIsLoading(false);
    }, [db, showNotification, filterStatus]); // filterStatus added as dependency

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]); // fetchTickets itself depends on filterStatus, so this covers it.

    const handleOpenTicketViewModal = (ticket) => {
        setViewingTicket(ticket);
    };

    const handleCloseTicketViewModal = () => {
        setViewingTicket(null);
    };

    const handleTicketUpdateInModal = (updatedTicket) => {
        // Update the ticket in the main list locally for immediate UI feedback
        setTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        // Optionally, could re-fetch all tickets if there are complex side-effects,
        // but local update is often sufficient for status/note changes.
        // fetchTickets();
    };

    const getStatusColor = (status) => {
        // (Same getStatusColor function as in TicketViewModal for consistency)
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'On Hold': return 'bg-gray-200 text-gray-700';
            case 'Awaiting Customer': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Client-side filtering logic (can be expanded)
    const filteredTickets = tickets.filter(ticket => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearchTerm = searchTerm ? (
            ticket.id?.toLowerCase().includes(searchLower) ||
            ticket.userName?.toLowerCase().includes(searchLower) ||
            ticket.userEmail?.toLowerCase().includes(searchLower) ||
            ticket.accountNumber?.toLowerCase().includes(searchLower) ||
            ticket.description?.toLowerCase().includes(searchLower)
        ) : true;

        const matchesStatus = filterStatus ? ticket.status === filterStatus : true;
        const matchesIssueType = filterIssueType ? ticket.issueType === filterIssueType : true;
        
        return matchesSearchTerm && matchesStatus && matchesIssueType;
    });
    
    const uniqueIssueTypes = Array.from(new Set(tickets.map(t => t.issueType))).sort();


    if (isLoading && tickets.length === 0) {
        return <LoadingSpinner message="Loading support tickets..." className="mt-10 h-64" />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <MessageSquare size={30} className="mr-3 text-purple-600" /> Support Ticket Management
                </h2>
                 <button
                    onClick={fetchTickets}
                    className="mt-3 sm:mt-0 text-sm flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg border border-gray-300 transition-colors"
                    disabled={isLoading}
                    title="Refresh Ticket List"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <RotateCcw size={16} className="mr-1.5" />}
                    Refresh
                </button>
            </div>
            
            {/* Filters */}
            <div className="mb-5 p-4 bg-gray-50 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="searchTerm" className="block text-xs font-medium text-gray-600 mb-1">Search Tickets</label>
                    <input
                        type="text"
                        id="searchTerm"
                        placeholder="ID, Name, Email, Account#, Keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={commonInputClass}
                    />
                </div>
                <div>
                    <label htmlFor="filterStatus" className="block text-xs font-medium text-gray-600 mb-1">Filter by Status</label>
                    <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={commonSelectClass}>
                        <option value="">All Statuses</option>
                        {['Open', 'In Progress', 'On Hold', 'Awaiting Customer', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="filterIssueType" className="block text-xs font-medium text-gray-600 mb-1">Filter by Issue Type</label>
                    <select id="filterIssueType" value={filterIssueType} onChange={(e) => setFilterIssueType(e.target.value)} className={commonSelectClass}>
                        <option value="">All Issue Types</option>
                        {uniqueIssueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>


            {isLoading && tickets.length > 0 && <LoadingSpinner message="Refreshing tickets..." className="my-4" />}

            {!isLoading && filteredTickets.length === 0 && (
                <div className="text-center py-10">
                    <Info size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">
                        {tickets.length === 0 ? "No support tickets found in the system." : "No tickets match your current filters."}
                    </p>
                    {(tickets.length > 0 && (filterStatus || filterIssueType || searchTerm)) &&
                        <button onClick={() => {setFilterStatus(''); setFilterIssueType(''); setSearchTerm('');}} className="mt-3 text-sm text-blue-600 hover:underline">Clear Filters</button>
                    }
                </div>
            )}

            {filteredTickets.length > 0 && (
                <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors duration-100">
                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600" title={ticket.id}>{ticket.id.substring(0, 8)}...</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(ticket.submittedAt, { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium truncate max-w-[150px]" title={ticket.userName || ticket.userEmail}>{ticket.userName || ticket.userEmail}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 truncate max-w-[180px]" title={ticket.issueType}>{ticket.issueType}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-tight font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(ticket.lastUpdatedAt || ticket.lastUpdatedByAdmin || ticket.submittedAt, { month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleOpenTicketViewModal(ticket)}
                                            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                                            title="View & Manage Ticket"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewingTicket && adminUserData && (
                <TicketViewModal
                    isOpen={!!viewingTicket}
                    onClose={handleCloseTicketViewModal}
                    ticket={viewingTicket}
                    db={db}
                    appId={appId}
                    adminUserData={adminUserData}
                    showNotification={showNotification}
                    onTicketUpdate={handleTicketUpdateInModal}
                />
            )}
        </div>
    );
};

export default SupportTicketManagementSection;
