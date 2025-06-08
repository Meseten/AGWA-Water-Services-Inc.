import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { Send, Sparkles, MessageSquare, AlertTriangle, FilePlus } from 'lucide-react';
import { callGeminiAPI } from '../../services/geminiService'; 

const ChatbotModal = ({
    isOpen,
    onClose,
    userData,
    showNotification,
    setActiveDashboardSection
}) => {
    const initialMessage = {
        role: 'assistant',
        text: `Hello, ${userData?.displayName || 'Valued Customer'}! I am Agie, your AGWA Water Services virtual assistant. How can I help you today with your account (${userData?.accountNumber || 'N/A'}) or other water service inquiries?`
    };
    const [chatHistory, setChatHistory] = useState([initialMessage]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showCreateTicketButton, setShowCreateTicketButton] = useState(false);
    const [error, setError] = useState('');

    const chatBodyRef = useRef(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (isOpen) {
            setChatHistory([initialMessage]);
            setUserInput('');
            setIsChatLoading(false);
            setShowCreateTicketButton(false);
            setError('');
        }
    }, [isOpen, userData]);


    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isChatLoading) return;

        const newUserMessage = { role: 'user', text: userInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        const currentInput = userInput; 
        setUserInput('');
        setIsChatLoading(true);
        setShowCreateTicketButton(false); 
        setError('');

        const geminiChatContext = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }]
        }));
        geminiChatContext.push({role: 'user', parts: [{text: currentInput}]});

        try {
            const systemPrompt = `You are Agie, the friendly and professional AI assistant for AGWA Water Services, a major water utility provider in the Philippines.
Current Customer Details:
- Name: ${userData.displayName || 'Valued Customer'}
- Account Number: ${userData.accountNumber || 'Not available'}
- Service Type: ${userData.serviceType || 'Not specified'}

Your primary goals are:
1.  Understand the customer's query accurately. Queries can be about billing, payments, account management, water quality, leaks, service interruptions, how to use the portal, etc.
2.  Provide clear, concise, helpful, and empathetic responses.
3.  If the query is straightforward and answerable with general knowledge or information commonly found in FAQs (e.g., "how to pay my bill?", "what is FCDA?"), provide the answer.
4.  If the query implies needing specific account data you don't have (e.g., "what was my last payment amount?", "is my meter reading correct for May?"), explain you cannot access real-time specific account details but can guide them to where they might find it in the portal (e.g., "You can check your detailed bill history under 'My Bills' section").
5.  If the customer expresses frustration, has a complex issue (like a persistent leak or no water for an extended time), or directly asks to speak to a human or create a ticket, ALWAYS offer to help them create a support ticket. In this specific scenario, and ONLY in this scenario, end your response with the exact phrase: "WOULD_YOU_LIKE_A_TICKET?".
6.  Do NOT use the phrase "WOULD_YOU_LIKE_A_TICKET?" if you are providing a direct answer or general guidance.
7.  Be polite, patient, and professional. Avoid overly technical jargon unless necessary and explain it if used.
8.  If the user's query is very vague, ask clarifying questions.
9.  Do not make up information or promise actions you cannot perform.
10. Keep responses relatively brief and to the point.

Respond to the customer's latest message based on the conversation history.`;
            
            const fullPromptForGemini = `${systemPrompt}\n\nConversation History:\n${geminiChatContext.slice(0,-1).map(m => `${m.role}: ${m.parts[0].text}`).join("\n")}\n\nNew user message to respond to:\nuser: ${currentInput}`;

            const responseText = await callGeminiAPI(fullPromptForGemini); 

            if (responseText.includes("WOULD_YOU_LIKE_A_TICKET?")) {
                const mainResponse = responseText.replace("WOULD_YOU_LIKE_A_TICKET?", "").trim();
                setChatHistory(prev => [...prev, { role: 'assistant', text: mainResponse }]);
                setShowCreateTicketButton(true);
            } else {
                setChatHistory(prev => [...prev, { role: 'assistant', text: responseText }]);
            }
        } catch (apiError) {
            console.error("Chatbot API error:", apiError);
            const errorMessage = "I'm currently experiencing some technical difficulties and can't respond right now. Please try again in a few moments. If the issue persists, you might want to report an issue directly through the portal.";
            setChatHistory(prev => [...prev, { role: 'assistant', text: errorMessage }]);
            setError("Failed to get response from assistant.");
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleCreateTicketFromChat = () => {
        const relevantHistory = chatHistory.slice(-5);
        const chatSummary = relevantHistory.map(msg => `${msg.role === 'user' ? (userData.displayName || 'You') : 'Agie'}: ${msg.text}`).join('\n\n');
        
        localStorage.setItem('chatbotIssueDescription', `Issue raised via Chatbot Agie:\n\n${chatSummary}\n\nInitial User Query (if available):\n${chatHistory.find(m => m.role === 'user')?.text || 'User initiated ticket creation from chat.'}`);
        localStorage.setItem('chatbotIssueTypeSuggestion', 'Chatbot Assistance Follow-up');

        onClose(); 
        if (setActiveDashboardSection) {
            setActiveDashboardSection('reportIssue');
        }
        showNotification("Please review and submit the support ticket drafted from your chat.", "success");
    };

    const quickReplies = [
        "How to pay my bill?",
        "Report a water leak.",
        "My water pressure is low.",
        "What are current announcements?",
    ];

    const handleQuickReply = (reply) => {
        setUserInput(reply);
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chat with Agie - Your AGWA Assistant" size="lg">
            <style jsx global>{`
                .animate-message-appear {
                    animation: message-appear 0.3s ease-out forwards;
                }
                @keyframes message-appear {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .chatbot-input-shadow {
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
                }
            `}</style>
            <div className="flex flex-col h-[65vh] sm:h-[70vh] bg-gray-50">
                <div ref={chatBodyRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex items-end animate-message-appear ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                                    <Sparkles size={18} />
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center ml-2 uppercase">
                                    {userData?.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex items-end justify-start animate-message-appear">
                             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                                <Sparkles size={18} />
                            </div>
                            <div className="max-w-[75%] p-3 rounded-2xl shadow-sm bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                                <LoadingSpinner size="h-5 w-5" color="text-blue-500" message="" />
                            </div>
                        </div>
                    )}
                    {error && (
                         <div className="flex items-center justify-center p-3 bg-red-50 text-red-700 rounded-lg animate-message-appear">
                            <AlertTriangle size={20} className="mr-2"/>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {showCreateTicketButton && (
                    <div className="p-3 border-t border-gray-200 bg-white">
                        <button
                            onClick={handleCreateTicketFromChat}
                            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                           <FilePlus size={20} className="mr-2" /> Create Support Ticket from this Chat
                        </button>
                    </div>
                )}

                {!showCreateTicketButton && chatHistory.length <= 1 && (
                    <div className="p-2 border-t border-gray-200 bg-white flex flex-wrap gap-2 justify-center">
                        {quickReplies.map(reply => (
                            <button
                                key={reply}
                                onClick={() => handleQuickReply(reply)}
                                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-full transition-colors"
                                disabled={isChatLoading}
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200 flex items-center space-x-3 bg-white chatbot-input-shadow">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your message to Agie..."
                        className="flex-grow px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow focus:shadow-md text-sm"
                        disabled={isChatLoading}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={isChatLoading || !userInput.trim()}
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default ChatbotModal;