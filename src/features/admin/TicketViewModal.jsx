import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import {
    MessageSquare, UserCircle, Hash, Mail, CalendarDays, Save, Loader2,
    AlertTriangle, Send, X, Sparkles, Clock
} from 'lucide-react';
import { formatDate } from '../../utils/userUtils.js';
import * as DataService from '../../services/dataService.js';
import { Timestamp } from 'firebase/firestore';
import { refineSupportTicketReply } from '../../services/deepseekService.js';
import RichTextEditor from '../../components/ui/RichTextEditor.jsx';
import DOMPurify from 'dompurify';

const TicketViewModal = ({
    isOpen,
    onClose,
    ticket,
    db,
    adminUserData,
    showNotification,
    onTicketUpdate
}) => {
    const [currentTicket, setCurrentTicket] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [isAiAssisting, setIsAiAssisting] = useState(false);
    const conversationEndRef = useRef(null);

    useEffect(() => {
        if (ticket) {
            setCurrentTicket(ticket);
            setNewStatus(ticket.status || 'Open');
            setReplyText('');
        } else {
            setCurrentTicket(null);
        }
    }, [ticket]);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [currentTicket?.conversation]);

    if (!isOpen || !currentTicket) return null;

    const commonInputClass = "w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm";
    const commonButtonClass = "flex items-center justify-center px-4 py-2 rounded-md font-semibold text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === currentTicket.status) {
            showNotification("Status is unchanged or invalid.", "info");
            return;
        }
        setIsUpdatingStatus(true);
        const updates = {
            status: newStatus,
            lastUpdatedByAdminName: adminUserData.displayName || 'Admin',
            lastUpdatedByAdminId: adminUserData.uid
        };
        const result = await DataService.updateSupportTicket(db, currentTicket.id, updates);
        if (result.success) {
            showNotification("Ticket status updated!", "success");
            const updatedTicketData = { ...currentTicket, ...updates, status: newStatus, lastUpdatedAt: Timestamp.now() };
            setCurrentTicket(updatedTicketData);
            if (onTicketUpdate) onTicketUpdate(updatedTicketData);
        } else {
            showNotification(result.error || "Failed to update status.", "error");
        }
        setIsUpdatingStatus(false);
    };

     const handleReplyChange = (value) => {
        setReplyText(value);
    };

    const handleSendReply = async () => {
        const plainTextReply = replyText.replace(/<[^>]*>?/gm, '').trim();
        if (!plainTextReply) {
            showNotification("Reply cannot be empty.", "warning");
            return;
        }
        setIsSendingReply(true);
        const sanitizedHtmlReply = DOMPurify.sanitize(replyText);
        const replyData = {
            text: sanitizedHtmlReply,
            authorId: adminUserData.uid,
            authorName: adminUserData.displayName || 'Admin',
            authorRole: adminUserData.role || 'admin',
            timestamp: Timestamp.now(),
        };

        const result = await DataService.addTicketReply(db, currentTicket.id, replyData);

        if (result.success) {
            showNotification("Reply sent!", "success");
            const newConversation = [...(currentTicket.conversation || []), replyData];
            const autoUpdateStatus = (newStatus === 'Open' || newStatus === 'Awaiting Customer') ? 'In Progress' : newStatus;
            const updatedTicketData = { ...currentTicket, conversation: newConversation, lastUpdatedAt: Timestamp.now(), status: autoUpdateStatus };
            if (autoUpdateStatus !== newStatus) setNewStatus(autoUpdateStatus);
            setCurrentTicket(updatedTicketData);
            if (onTicketUpdate) onTicketUpdate(updatedTicketData);
            setReplyText('');
        } else {
            showNotification(result.error || "Failed to send reply.", "error");
        }
        setIsSendingReply(false);
    };

    const handleAiAssist = async () => {
        const plainTextForAI = replyText.replace(/<[^>]*>?/gm, '').trim();
        if (!plainTextForAI) {
            showNotification("Write a draft or keywords first.", "warning");
            return;
        }
        setIsAiAssisting(true);
        try {
            const conversationHistory = (currentTicket.conversation || []).map(msg => `${msg.authorRole === 'admin' ? 'Support' : 'Customer'}: ${msg.text.replace(/<[^>]*>?/gm, '')}`).join('\n\n');
            const assistedReply = await refineSupportTicketReply({
                ticketDescription: currentTicket.description,
                conversationHistory: conversationHistory,
                draftReply: plainTextForAI,
                customerName: currentTicket.userName
            });
            setReplyText(assistedReply);
            showNotification("AI refined your reply.", "success");
        } catch (error) {
            const errorMessage = error?.message || "AI assistance failed.";
            showNotification(errorMessage, "error");
        } finally {
            setIsAiAssisting(false);
        }
    };

    const InfoRow = ({ label, value, icon: Icon, valueClass = "text-gray-700" }) => (
        <div className="flex items-start py-2 border-b border-slate-100 last:border-b-0">
            <span className="text-xs font-semibold text-slate-500 w-32 flex items-center shrink-0">
                {Icon && <Icon size={14} className="mr-2 text-slate-400" />}
                {label}:
            </span>
            <span className={`text-sm ${valueClass} flex-1 break-words`}>{value || 'N/A'}</span>
        </div>
    );

    const getStatusPillClass = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-purple-100 text-purple-700';
            case 'Awaiting Customer': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    const ticketStatusOptions = ['Open', 'In Progress', 'Awaiting Customer', 'Resolved', 'Closed'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket Details`} size="full" modalDialogClassName="sm:max-w-4xl w-[95vw] h-[95vh]" contentClassName="p-0 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-slate-800 truncate" title={currentTicket.issueType}>{currentTicket.issueType} - ID: {currentTicket.id.substring(0, 8)}...</h3>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-grow p-4 space-y-4">
                <div className="p-4 border rounded-lg bg-slate-50/70">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <InfoRow label="User" value={`${currentTicket.userName} (${currentTicket.userEmail || 'N/A'})`} icon={UserCircle} />
                        <InfoRow label="Account No" value={currentTicket.accountNumber || 'N/A'} icon={Hash} />
                        <InfoRow label="Submitted" value={formatDate(currentTicket.submittedAt)} icon={CalendarDays} />
                        <InfoRow label="Last Update" value={formatDate(currentTicket.lastUpdatedAt)} icon={Clock} />
                        <InfoRow label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusPillClass(currentTicket.status)}`}>{currentTicket.status}</span>} icon={AlertTriangle} />
                         <InfoRow label="Ticket ID" value={currentTicket.id} icon={Hash} valueClass="font-mono text-xs"/>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                    <h4 className="text-sm font-semibold text-slate-600 mb-1">Initial Description:</h4>
                    <div className="p-3 bg-slate-100 rounded-md text-sm text-slate-800 whitespace-pre-line prose prose-sm max-w-none">
                         {currentTicket.description}
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Conversation History</h4>
                    <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 border rounded-md">
                        {currentTicket.conversation && currentTicket.conversation.length > 0 ? currentTicket.conversation.map((msg, index) => (
                            <div key={index} className={`p-2.5 rounded-lg ${msg.authorRole === 'admin' ? 'bg-blue-100' : 'bg-green-50'}`}>
                                <p className="text-xs font-bold text-gray-800">{msg.authorName} ({msg.authorRole})</p>
                                <div className="text-sm text-gray-700 prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text || '') }}></div>
                                <p className="text-right text-xs text-gray-500 mt-1">{formatDate(msg.timestamp)}</p>
                            </div>
                        )) : <p className="text-sm text-center text-gray-500 py-4">No replies yet.</p>}
                        <div ref={conversationEndRef} />
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Send Reply</h4>
                    <div className="flex items-start gap-2 mb-2">
                         <RichTextEditor
                            value={replyText}
                            onChange={handleReplyChange}
                            placeholder="Type your reply..."
                            className="flex-grow bg-white rounded-lg border border-gray-300 min-h-[120px]"
                            readOnly={isSendingReply || isAiAssisting}
                        />
                         <button onClick={handleAiAssist} className={`${commonButtonClass} bg-purple-100 text-purple-700 hover:bg-purple-200 self-start p-2`} disabled={isAiAssisting || !replyText.replace(/<[^>]*>?/gm, '').trim()} title="Refine reply with AI">
                            {isAiAssisting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                    </div>
                    <button onClick={handleSendReply} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 text-white`} disabled={isSendingReply || !replyText.replace(/<[^>]*>?/gm, '').trim()}>
                        {isSendingReply ? <Loader2 size={18} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                        Send Reply
                    </button>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                    <label htmlFor="ticketStatusUpdate" className="block text-sm font-semibold text-slate-600 mb-1.5">Update Ticket Status:</label>
                    <div className="flex items-center gap-3">
                        <select
                            id="ticketStatusUpdate"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className={`${commonInputClass} flex-grow`}
                            disabled={isUpdatingStatus}
                        >
                            {ticketStatusOptions.map(statusOpt => <option key={statusOpt} value={statusOpt}>{statusOpt}</option>)}
                        </select>
                        <button onClick={handleStatusUpdate} className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white`} disabled={isUpdatingStatus || newStatus === currentTicket.status}>
                            {isUpdatingStatus ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TicketViewModal;