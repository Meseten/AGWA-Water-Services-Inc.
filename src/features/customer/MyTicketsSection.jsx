import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Clock, AlertTriangle, CheckCircle, Info, RotateCcw, Loader2, Eye, Send, Sparkles } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';
import { Timestamp } from 'firebase/firestore';
import { callGeminiAPI } from '../../services/geminiService.js';
import Tooltip from '../../components/ui/Tooltip.jsx';

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
            setError(result.error || "Failed to fetch your support tickets.");
            showNotification(result.error || "Failed to fetch tickets.", "error");
        }
        setIsLoading(false);
    }, [db, user.uid, showNotification]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleReplyChange = (ticketId, text) => {
        setReplyText(prev => ({ ...prev, [ticketId]: text }));
    };

    const handleSendReply = async (ticketId) => {
        const text = replyText[ticketId];
        if (!text || !text.trim()) {
            showNotification("Reply cannot be empty.", "warning");
            return;
        }
        setIsSendingReply(ticketId);
        const replyData = {
            text: text,
            authorId: user.uid,
            authorName: userData.displayName,
            authorRole: userData.role,
            timestamp: Timestamp.fromDate(new Date()),
        };

        const result = await DataService.addTicketReply(db, ticketId, replyData);
        if (result.success) {
            showNotification("Reply sent successfully!", "success");
            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
            fetchTickets(); 
        } else {
            showNotification(result.error || "Failed to send reply.", "error");
        }
        setIsSendingReply(null);
    };

    const handleAiAssist = async (ticketId) => {
        const currentReply = replyText[ticketId] || '';
        if (!currentReply.trim()) {
            showNotification("Please write a draft or some keywords for the AI to assist with.", "warning");
            return;
        }
        setIsAiAssisting(ticketId);
        try {
            const prompt = `You are helping a customer write a formal reply to a support ticket. Refine the following draft to be clear, polite, and concise. Do not add any extra commentary. Just provide the refined message.\n\nMy draft: "${currentReply}"`;
            const assistedReply = await callGeminiAPI(prompt);
            handleReplyChange(ticketId, assistedReply);
            showNotification("AI has refined your reply!", "success");
        } catch (error) {
            showNotification(error.message || "AI assistance failed.", "error");
        } finally {
            setIsAiAssisting(null);
        }
    };
    
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
                        <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-700 space-y-3">
                           <div>
                                <strong className="text-xs text-gray-500">Your Initial Report:</strong>
                                <p className="p-2 bg-white border rounded-md whitespace-pre-line text-xs">{ticket.description}</p>
                           </div>
                           {(ticket.conversation && ticket.conversation.length > 0) && (
                               <div className="space-y-2">
                                   <strong className="text-xs text-gray-500">Conversation History:</strong>
                                   <div className="max-h-60 overflow-y-auto space-y-2 border bg-white p-2 rounded-md">
                                        {ticket.conversation.map((msg, index) => (
                                            <div key={index} className={`p-2 rounded-lg text-xs ${msg.authorRole === 'admin' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                                <p className="font-bold text-gray-800">{msg.authorName}:</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-line">{msg.text}</p>
                                                <p className="text-right text-gray-500 mt-1">{formatDate(msg.timestamp)}</p>
                                            </div>
                                        ))}
                                   </div>
                               </div>
                           )}
                           <div className="pt-2">
                                <label className="text-xs font-semibold text-gray-600">Send a Reply:</label>
                                <div className="flex items-start gap-2">
                                    <textarea
                                        value={replyText[ticket.id] || ''}
                                        onChange={(e) => handleReplyChange(ticket.id, e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full p-2 border rounded-md text-sm flex-grow"
                                        rows="3"
                                    />
                                    <Tooltip text="Type a draft first, then use AI to refine it.">
                                        <button 
                                            onClick={() => handleAiAssist(ticket.id)}
                                            className="p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isAiAssisting === ticket.id || !(replyText[ticket.id] || '').trim()}
                                            title="Refine reply with AI"
                                        >
                                            {isAiAssisting === ticket.id ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                        </button>
                                    </Tooltip>
                                </div>
                               <button 
                                   onClick={() => handleSendReply(ticket.id)}
                                   className="mt-2 w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-xs hover:bg-blue-700 disabled:opacity-60"
                                   disabled={isSendingReply === ticket.id || !(replyText[ticket.id] || '').trim()}
                                >
                                    {isSendingReply === ticket.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2"/>}
                                    Send Reply
                                </button>
                           </div>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default MyTicketsSection;