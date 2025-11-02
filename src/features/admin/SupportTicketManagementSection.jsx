import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Eye, Loader2, Filter, AlertTriangle, RotateCcw, Info, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import TicketViewModal from './TicketViewModal.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';
import { Timestamp } from 'firebase/firestore';

const SupportTicketManagementSection = ({ db, appId, userData: adminUserData, showNotification }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingTicket, setViewingTicket] = useState(null);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState("");
    const [filterIssueType, setFilterIssueType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const commonSelectClass = "w-full sm:w-auto text-sm px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150";
    const commonInputClass = `${commonSelectClass} placeholder-gray-400`;

    const handleAutoCloseTickets = useCallback(async (ticketList, settings) => {
        const autoCloseDays = settings?.autoCloseTicketsDays;
        if (!autoCloseDays || isNaN(autoCloseDays) || autoCloseDays <= 0) {
            return;
        }

        const now = new Date();
        const ticketsToClose = [];

        ticketList.forEach(ticket => {
            if (ticket.status === 'Resolved') {
                const lastUpdated = ticket.lastUpdatedAt?.toDate ? ticket.lastUpdatedAt.toDate() : new Date(0);
                const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate > autoCloseDays) {
                    ticketsToClose.push(ticket.id);
                }
            }
        });

        if (ticketsToClose.length > 0) {
            const result = await DataService.batchUpdateTicketStatus(db, ticketsToClose, 'Closed');
            if (result.success) {
                showNotification(`Successfully auto-closed ${ticketsToClose.length} inactive ticket(s).`, "success");
            } else {
                showNotification(`Failed to auto-close tickets: ${result.error}`, "error");
            }
        }
    }, [db, showNotification]);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        const [ticketsResult, settingsResult] = await Promise.all([
            DataService.getAllSupportTickets(db),
            DataService.getSystemSettings(db)
        ]);

        if (ticketsResult.success) {
            setTickets(ticketsResult.data);
            if (settingsResult.success && settingsResult.data) {
                await handleAutoCloseTickets(ticketsResult.data, settingsResult.data);
                // After auto-closing, we might need to refresh the list if any tickets were changed
                if (ticketsResult.data.some(t => t.status === 'Resolved')) {
                    const refreshedTicketsResult = await DataService.getAllSupportTickets(db);
                    if (refreshedTicketsResult.success) {
                        setTickets(refreshedTicketsResult.data);
                    }
                }
            }
        } else {
            showNotification(ticketsResult.error || "Failed to fetch support tickets.", "error");
            setTickets([]);
        }
        setIsLoading(false);
    }, [db, showNotification, handleAutoCloseTickets]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleOpenTicketViewModal = (ticket) => {
        setViewingTicket(ticket);
    };

    const handleCloseTicketViewModal = () => {
        setViewingTicket(null);
    };

    const handleTicketUpdateInModal = (updatedTicket) => {
        setTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
    };

    const handleConfirmDelete = async () => {
        if (!ticketToDelete) return;
        setIsDeleting(true);
        const result = await DataService.deleteSupportTicket(db, ticketToDelete.id);
        if (result.success) {
            showNotification("Support ticket deleted successfully.", "success");
            fetchTickets();
        } else {
            showNotification(result.error || "Failed to delete ticket.", "error");
        }
        setIsDeleting(false);
        setTicketToDelete(null);
    };

    const getStatusColor = (status) => {
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

            {!isLoading && filteredTickets.length === 0 && (
                <div className="text-center py-10">
                    <Info size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">
                        {tickets.length === 0 ? "No support tickets found in the system." : "No tickets match your current filters."}
                    </p>
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
                                    <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                                        <button
                                            onClick={() => handleOpenTicketViewModal(ticket)}
                                            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                                            title="View & Manage Ticket"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => setTicketToDelete(ticket)}
                                            className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete Ticket"
                                        >
                                            <Trash2 size={18} />
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

            {ticketToDelete && (
                <ConfirmationModal
                    isOpen={!!ticketToDelete}
                    onClose={() => setTicketToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Ticket Deletion"
                    confirmText="Yes, Delete Ticket"
                    isConfirming={isDeleting}
                    iconType="danger"
                >
                    <p>Are you sure you want to permanently delete ticket <strong>{ticketToDelete.id.substring(0,8)}...</strong>?</p>
                    <p className="text-xs text-gray-500 mt-2">This action cannot be undone.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default SupportTicketManagementSection;