import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Clock, AlertTriangle, CheckCircle, Info, RotateCcw, Loader2, Eye, Send, Sparkles, Hash } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';
import { Timestamp } from 'firebase/firestore';
import { refineSupportTicketReply } from '../../services/deepseekService.js';
import Tooltip from '../../components/ui/Tooltip.jsx';
import DOMPurify from 'dompurify';
import RichTextEditor from '../../components/ui/RichTextEditor.jsx';


const MyTicketsSection = ({ db, user, userData, showNotification }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyText, setReplyText] = useState({});
    const [isSendingReply, setIsSendingReply] = useState(null);
    const [isAiAssisting, setIsAiAssisting] = useState(null);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const result = await DataService.getTicketsByReporter(db, user.uid);
        if (result.success) {
            setTickets(result.data);
        } else {
            setError(result.error || "Failed fetching tickets.");
            showNotification(result.error || "Failed fetching tickets.", "error");
        }
        setIsLoading(false);
    }, [db, user.uid, showNotification]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleReplyChange = (ticketId, value) => {
        setReplyText(prev => ({ ...prev, [ticketId]: value }));
    };

    const handleSendReply = async (ticketId) => {
        const currentReplyHtml = replyText[ticketId] || '';
        const plainText = currentReplyHtml.replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) {
            showNotification("Reply cannot be empty.", "warning");
            return;
        }
        setIsSendingReply(ticketId);
        const sanitizedHtml = DOMPurify.sanitize(currentReplyHtml);
        const replyData = {
            text: sanitizedHtml,
            authorId: user.uid,
            authorName: userData.displayName || 'Customer',
            authorRole: userData.role || 'customer',
            timestamp: Timestamp.now(),
        };

        const result = await DataService.addTicketReply(db, ticketId, replyData);
        if (result.success) {
            showNotification("Reply sent!", "success");
            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
            fetchTickets();
        } else {
            showNotification(result.error || "Failed to send reply.", "error");
        }
        setIsSendingReply(null);
    };

    const handleAiAssist = async (ticketId) => {
        const currentReplyHtml = replyText[ticketId] || '';
        const plainTextForAI = currentReplyHtml.replace(/<[^>]*>?/gm, '').trim();
        if (!plainTextForAI) {
            showNotification("Write a draft or keywords first.", "warning");
            return;
        }
        setIsAiAssisting(ticketId);
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) {
             setIsAiAssisting(null);
             return;
        }
        try {
             const conversationHistory = (ticket.conversation || []).map(msg => `${msg.authorRole === 'admin' ? 'Support' : 'You'}: ${msg.text.replace(/<[^>]*>?/gm, '')}`).join('\n\n');
             const assistedReply = await refineSupportTicketReply({
                 ticketDescription: ticket.description,
                 conversationHistory: conversationHistory,
                 draftReply: plainTextForAI,
                 customerName: userData.displayName
             });
            handleReplyChange(ticketId, assistedReply);
            showNotification("AI refined your reply.", "success");
        } catch (error) {
            const errorMessage = error?.message || "AI assistance failed.";
            showNotification(errorMessage, "error");
        } finally {
            setIsAiAssisting(null);
        }
    };

    const getStatusPillClass = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Awaiting Customer': return 'bg-blue-100 text-blue-700';
            case 'Resolved': case 'Closed': return 'bg-green-100 text-green-700';
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
                 <button onClick={fetchTickets} disabled={isLoading} className="flex items-center text-sm p-2 bg-gray-100 rounded-lg hover:bg-gray-200 border border-gray-300">
                    <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
                     <span className="ml-1.5 hidden sm:inline">Refresh</span>
                </button>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-center border border-red-200">{error}</div>}

            {tickets.length === 0 && !error && (
                <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                    <Info size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No support tickets found.</p>
                    <p className="text-sm text-gray-500 mt-1">Use 'Report an Issue' to create one.</p>
                </div>
            )}

            <div className="space-y-4">
                {tickets.map(ticket => (
                    <details key={ticket.id} className="p-4 rounded-lg shadow-md border-l-4 bg-gray-50 border-purple-400 group hover:shadow-lg transition-shadow">
                        <summary className="flex flex-wrap justify-between items-center gap-2 cursor-pointer list-none">
                            <div>
                                <h3 className="text-md font-semibold text-gray-800">{ticket.issueType || 'Support Ticket'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Submitted: {formatDate(ticket.submittedAt, { month: 'short', day: 'numeric', year:'2-digit' })}</p>
                                <Tooltip text={`Ticket ID: ${ticket.id}`} position="bottom">
                                     <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center"><Hash size={12} className="mr-1"/>{ticket.id.substring(0, 8)}...</p>
                                </Tooltip>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusPillClass(ticket.status)} shrink-0`}>
                                {ticket.status || 'Unknown'}
                            </span>
                            <span className="ml-auto transition-transform duration-300 transform group-open:rotate-180 text-purple-600">▼</span>
                        </summary>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-700 space-y-4 grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                          <div className="overflow-hidden space-y-4">
                               <div>
                                    <strong className="text-xs text-gray-500 block mb-1">Your Initial Report:</strong>
                                    <div className="p-2 bg-white border rounded-md whitespace-pre-line text-xs prose prose-xs max-w-none">{ticket.description}</div>
                               </div>
                               {(ticket.conversation && ticket.conversation.length > 0) && (
                                   <div className="space-y-2">
                                       <strong className="text-xs text-gray-500 block mb-1">Conversation:</strong>
                                       <div className="max-h-60 overflow-y-auto space-y-2 border bg-white p-2 rounded-md scrollbar-thin">
                                            {ticket.conversation.map((msg, index) => (
                                                <div key={index} className={`p-2 rounded-lg text-xs ${msg.authorRole === 'admin' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                                    <p className="font-bold text-gray-800">{msg.authorName} ({msg.authorRole}):</p>
                                                    <div className="text-gray-700 prose prose-xs max-w-none break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text || '') }}></div>
                                                    <p className="text-right text-gray-500 mt-1">{formatDate(msg.timestamp)}</p>
                                                </div>
                                            ))}
                                       </div>
                                   </div>
                               )}
                               {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                                   <div className="pt-2">
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Send a Reply:</label>
                                        <div className="flex items-start gap-2">
                                            <RichTextEditor
                                                value={replyText[ticket.id] || ''}
                                                onChange={(value) => handleReplyChange(ticket.id, value)}
                                                placeholder="Type your reply..."
                                                className="flex-grow bg-white rounded-lg border border-gray-300 min-h-[100px]"
                                                readOnly={isSendingReply === ticket.id || isAiAssisting === ticket.id}
                                            />
                                            <Tooltip text="Refine draft with AI">
                                                <button
                                                    onClick={() => handleAiAssist(ticket.id)}
                                                    className="p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={isAiAssisting === ticket.id || !(replyText[ticket.id] || '').replace(/<[^>]*>?/gm, '').trim()}
                                                >
                                                    {isAiAssisting === ticket.id ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                                </button>
                                            </Tooltip>
                                        </div>
                                       <button
                                           onClick={() => handleSendReply(ticket.id)}
                                           className="mt-2 w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-xs hover:bg-blue-700 disabled:opacity-60"
                                           disabled={isSendingReply === ticket.id || !(replyText[ticket.id] || '').replace(/<[^>]*>?/gm, '').trim()}
                                        >
                                            {isSendingReply === ticket.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2"/>}
                                            Send Reply
                                        </button>
                                   </div>
                               )}
                                {ticket.status === 'Resolved' && <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">This ticket is marked as resolved. Replying will reopen it.</p>}
                                {ticket.status === 'Closed' && <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">This ticket is closed. Please create a new ticket if you need further assistance.</p>}
                           </div>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default MyTicketsSection;