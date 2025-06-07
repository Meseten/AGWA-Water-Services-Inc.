// src/features/admin/TicketViewModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx'; // Added .jsx
import { 
    MessageSquare, UserCircle, Hash, Mail, CalendarDays, Edit, Save, Loader2, 
    AlertTriangle, CheckSquare, FilePlus, Send, X, ShieldAlert, Info, Building, Clock,
    DollarSign, Droplets, Gauge, UserCog, MapPin // Added missing icons
} from 'lucide-react';
import { formatDate } from '../../utils/userUtils.js'; // .js is fine
import * as DataService from '../../services/dataService.js'; // .js is fine

/**
 * TicketViewModal for admins to view and manage support ticket details in a large modal.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {object} props.ticket - The ticket object to display/edit.
 * @param {object} props.db - Firestore instance.
 * @param {object} props.adminUserData - Current admin's user data.
 * @param {function} props.showNotification - Function to display notifications.
 * @param {function} props.onTicketUpdate - Callback function after a ticket is updated.
 */
const TicketViewModal = ({
    isOpen,
    onClose,
    ticket,
    db,
    // appId, // Removed unused prop
    adminUserData,
    showNotification,
    onTicketUpdate
}) => {
    const [currentTicket, setCurrentTicket] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);

    useEffect(() => {
        if (ticket) {
            setCurrentTicket(ticket);
            setNewStatus(ticket.status || 'Open');
        } else {
            setCurrentTicket(null);
        }
    }, [ticket]);

    if (!isOpen || !currentTicket) return null;

    const commonInputClass = "w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm";
    const commonButtonClass = "flex items-center justify-center px-4 py-2 rounded-md font-semibold text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === currentTicket.status) {
            showNotification("Please select a new status or status is unchanged.", "info");
            return;
        }
        setIsUpdatingStatus(true);
        const updates = {
            status: newStatus,
            lastUpdatedByAdminName: adminUserData.displayName || 'Admin',
            lastUpdatedByAdminId: adminUserData.uid,
            lastUpdatedAt: DataService.serverTimestamp(),
        };
        const result = await DataService.updateSupportTicket(db, currentTicket.id, updates);
        if (result.success) {
            showNotification("Ticket status updated successfully!", "success");
            const updatedTicketData = { ...currentTicket, ...updates, status: newStatus, lastUpdatedAt: new Date() };
            setCurrentTicket(updatedTicketData);
            if (onTicketUpdate) onTicketUpdate(updatedTicketData);
        } else {
            showNotification(result.error || "Failed to update ticket status.", "error");
        }
        setIsUpdatingStatus(false);
    };

    const handleAddAdminNote = async () => {
        if (!adminNote.trim()) {
            showNotification("Admin note cannot be empty.", "warning");
            return;
        }
        setIsAddingNote(true);
        const noteDataForSave = {
            text: adminNote,
            authorId: adminUserData.uid,
            authorName: adminUserData.displayName || 'Admin',
            timestamp: DataService.serverTimestamp(),
        };
        
        const currentNotes = Array.isArray(currentTicket.adminNotes) ? currentTicket.adminNotes : [];
        const updatedAdminNotesForSave = [...currentNotes, noteDataForSave];
        
        const result = await DataService.updateSupportTicket(db, currentTicket.id, {
            adminNotes: updatedAdminNotesForSave,
            lastUpdatedByAdminName: adminUserData.displayName || 'Admin',
            lastUpdatedByAdminId: adminUserData.uid,
            lastUpdatedAt: DataService.serverTimestamp(),
        });

        if (result.success) {
            showNotification("Admin note added successfully!", "success");
            const displayNote = { ...noteDataForSave, timestamp: new Date() };
            const newTicketState = { ...currentTicket, adminNotes: [...currentNotes, displayNote], lastUpdatedAt: new Date() };
            setCurrentTicket(newTicketState);
            if (onTicketUpdate) onTicketUpdate(newTicketState);
            setAdminNote('');
        } else {
            showNotification(result.error || "Failed to add admin note.", "error");
        }
        setIsAddingNote(false);
    };

    const InfoRow = ({ label, value, icon: Icon, valueClass = "text-gray-700", fullWidthValue = false, isHtml = false }) => (
        <div className={`py-2 border-b border-slate-100 last:border-b-0 ${fullWidthValue ? 'block sm:flex flex-col sm:flex-row' : 'flex items-start'}`}>
            <span className="text-xs font-semibold text-slate-500 w-full sm:w-36 md:w-44 flex items-center mb-0.5 sm:mb-0 shrink-0">
                {Icon && <Icon size={14} className="mr-2 text-slate-400 flex-shrink-0" />}
                {label}:
            </span>
            {isHtml ? (
                 <div className={`text-sm ${valueClass} ${fullWidthValue ? 'mt-0.5 sm:mt-0 sm:ml-0 block' : 'flex-1 text-right sm:text-left'}`} dangerouslySetInnerHTML={{ __html: value || 'N/A' }} />
            ) : (
                 <span className={`text-sm ${valueClass} ${fullWidthValue ? 'mt-0.5 sm:mt-0 sm:ml-0 block' : 'flex-1 text-right sm:text-left'}`}>{value || 'N/A'}</span>
            )}
        </div>
    );
    
    const ticketStatusOptions = ['Open', 'In Progress', 'On Hold', 'Awaiting Customer', 'Resolved', 'Closed'];
    const getStatusPillClass = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-700 border-red-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'On Hold': return 'bg-gray-200 text-gray-700 border-gray-400';
            case 'Awaiting Customer': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-300';
            case 'Closed': return 'bg-purple-100 text-purple-700 border-purple-300';
            default: return 'bg-gray-100 text-gray-600 border-gray-300';
        }
    };
    const getIssueTypeIconAndColor = (issueType) => {
        const typeLower = issueType?.toLowerCase() || '';
        if (typeLower.includes('billing')) return { icon: DollarSign, color: 'text-orange-600' };
        if (typeLower.includes('leak')) return { icon: Droplets, color: 'text-blue-600' };
        if (typeLower.includes('meter')) return { icon: Gauge, color: 'text-teal-600' };
        if (typeLower.includes('supply') || typeLower.includes('no water')) return { icon: AlertTriangle, color: 'text-red-600' };
        if (typeLower.includes('portal') || typeLower.includes('account access')) return { icon: UserCog, color: 'text-indigo-600' };
        if (typeLower.includes('chatbot')) return { icon: MessageSquare, color: 'text-purple-600'};
        return { icon: Info, color: 'text-gray-600' };
    };
    const { icon: IssueTypeIconItself, color: issueTypeColor } = getIssueTypeIconAndColor(currentTicket.issueType);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="full" modalDialogClassName="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] h-[95vh]" contentClassName="p-0 flex flex-col">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
                <div className="flex items-center min-w-0">
                    {IssueTypeIconItself && <IssueTypeIconItself size={22} className={`mr-2.5 ${issueTypeColor} flex-shrink-0`} />}
                    <h3 className="text-md sm:text-lg font-semibold text-slate-800 truncate" title={`Ticket ID: ${currentTicket.id}`}>
                        Ticket: {currentTicket.issueType}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Close Ticket View"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="overflow-y-auto flex-grow p-4 sm:p-6 space-y-6">
                <div className="p-4 border rounded-lg bg-slate-50/70 border-slate-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 border-b border-slate-200 pb-1.5">Ticket Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0">
                        <InfoRow label="Ticket ID" value={currentTicket.id} icon={Hash} valueClass="font-mono text-xs text-slate-600" />
                        <InfoRow label="Status" value={
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusPillClass(currentTicket.status)}`}>
                                {currentTicket.status}
                            </span>
                        } icon={ShieldAlert} />
                        <InfoRow label="Submitted By" value={`${currentTicket.userName} (${currentTicket.userEmail || 'N/A'})`} icon={UserCircle} />
                        <InfoRow label="Account No." value={currentTicket.accountNumber || 'N/A'} icon={Hash} />
                        <InfoRow label="Submitted On" value={formatDate(currentTicket.submittedAt)} icon={CalendarDays} />
                        <InfoRow label="Last Update" value={formatDate(currentTicket.lastUpdatedAt || currentTicket.lastUpdatedByAdminName || currentTicket.submittedAt)} icon={Clock} />
                        <InfoRow label="User Role" value={currentTicket.userRole?.replace('_', ' ') || 'N/A'} icon={UserCog} valueClass="capitalize" />
                        {currentTicket.lastUpdatedByAdminName && <InfoRow label="Updated By" value={currentTicket.lastUpdatedByAdminName} icon={UserCog} />}
                        <div className="md:col-span-2">
                             <InfoRow label="Location/Address" value={currentTicket.issueAddress} icon={MapPin} fullWidthValue={true} />
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-white border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-600 mb-1.5">Issue Description:</h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 whitespace-pre-line min-h-[100px] max-h-[200px] overflow-y-auto pretty-scrollbar">
                        {currentTicket.description}
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-white border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-600 mb-1.5">Internal Admin Notes:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2.5 border p-3 rounded-md bg-slate-50 mb-2.5 pretty-scrollbar">
                        {(currentTicket.adminNotes && currentTicket.adminNotes.length > 0) ? (
                            currentTicket.adminNotes.slice().reverse().map((note, index) => (
                                <div key={index} className="text-xs p-2.5 bg-white border border-slate-200 rounded shadow-sm">
                                    <p className="text-slate-700 whitespace-pre-line">{note.text}</p>
                                    <p className="text-slate-500 mt-1.5 text-right text-[11px]">
                                        - {note.authorName || 'Admin'} on {formatDate(note.timestamp, {month:'short', day:'numeric', year:'2-digit', hour:'2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            ))
                        ) : <p className="text-xs text-slate-500 italic py-2 text-center">No admin notes recorded yet.</p>}
                    </div>
                    <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add an internal note (visible to admins only)..."
                        className={`${commonInputClass} text-xs min-h-[60px]`}
                        rows="2"
                        disabled={isAddingNote}
                    />
                    <button
                        onClick={handleAddAdminNote}
                        className={`${commonButtonClass} bg-sky-600 hover:bg-sky-700 text-white mt-2 text-xs py-1.5 px-3 focus:ring-sky-500`}
                        disabled={isAddingNote || !adminNote.trim()}
                    >
                        {isAddingNote ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <FilePlus size={16} className="mr-1.5" />}
                        {isAddingNote ? 'Adding Note...' : 'Add Note'}
                    </button>
                </div>

                <div className="p-4 border rounded-lg bg-white border-gray-200 shadow-sm">
                    <label htmlFor="ticketStatusUpdate" className="block text-sm font-semibold text-slate-600 mb-1.5">Update Ticket Status:</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <select
                            id="ticketStatusUpdate"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className={`${commonInputClass} flex-grow`}
                            disabled={isUpdatingStatus}
                        >
                            {ticketStatusOptions.map(statusOpt => (
                                <option key={statusOpt} value={statusOpt}>{statusOpt}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleStatusUpdate}
                            className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 w-full sm:w-auto`}
                            disabled={isUpdatingStatus || newStatus === currentTicket.status}
                        >
                            {isUpdatingStatus ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            {isUpdatingStatus ? 'Saving Status...' : 'Update Status'}
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2 flex justify-end">
                     <button
                        onClick={onClose}
                        className={`${commonButtonClass} bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400`}
                    >
                        Close Ticket View
                    </button>
                </div>
            </div>
             <style jsx global>{`
                .pretty-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .pretty-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9; /* slate-100 */
                    border-radius: 10px;
                }
                .pretty-scrollbar::-webkit-scrollbar-thumb {
                    background: #94a3b8; /* slate-400 */
                    border-radius: 10px;
                }
                .pretty-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b; /* slate-500 */
                }
            `}</style>
        </Modal>
    );
};

export default TicketViewModal;
