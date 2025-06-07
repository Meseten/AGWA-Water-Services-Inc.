// src/features/admin/AnnouncementForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Save, Sparkles, AlertCircle, Type, CalendarDays, CheckSquare, XSquare, MessageSquare, MapPin, Clock } from 'lucide-react';
import { callGeminiAPI, generateAnnouncement } from '../../services/geminiService.js';
import Tooltip from '../../components/ui/Tooltip.jsx';

const AnnouncementForm = ({ initialData = null, onSubmit, onCancel, isSaving, showNotification }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('info');
    const [status, setStatus] = useState('active');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [targetRoles, setTargetRoles] = useState(['all']);
    
    // New state for the AI Wizard
    const [aiReason, setAiReason] = useState('');
    const [aiArea, setAiArea] = useState('');
    const [aiTime, setAiTime] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const [isAiAssisting, setIsAiAssisting] = useState(false);
    const [formError, setFormError] = useState('');

    const availableRoles = ['customer', 'meterReader', 'admin', 'clerk_cashier'];

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setContent(initialData.content || '');
            setType(initialData.type || 'info');
            setStatus(initialData.status || 'active');
            setStartDate(initialData.startDate?.toDate ? initialData.startDate.toDate().toISOString().split('T')[0] : '');
            setEndDate(initialData.endDate?.toDate ? initialData.endDate.toDate().toISOString().split('T')[0] : '');
            setTargetRoles(initialData.targetRoles || ['all']);
        } else {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setStatus('active');
        }
    }, [initialData]);

    const handleTargetRoleChange = (role) => {
        setTargetRoles(prev => {
            if (role === 'all') return ['all'];
            const newRoles = prev.filter(r => r !== 'all');
            if (newRoles.includes(role)) {
                return newRoles.filter(r => r !== role);
            } else {
                return [...newRoles, role];
            }
        });
    };

    const handleAiAssist = async () => {
        if (!title.trim() && !content.trim()) {
            showNotification("Please provide a title or some initial content for AI assistance.", "warning");
            return;
        }
        setIsAiAssisting(true);
        try {
            const prompt = `Refine this announcement for AGWA Water Services. Make it clear, professional, and concise, using markdown for formatting. Announcement Type: ${type}. Title: "${title}". Original Content: "${content}".`;
            const assistedContent = await callGeminiAPI(prompt);
            setContent(assistedContent);
            showNotification("AI has refined your content!", "success");
        } catch (error) {
            showNotification(error.message || "AI assistance failed.", "error");
        } finally {
            setIsAiAssisting(false);
        }
    };
    
    const handleAiGenerate = async () => {
        if (!aiReason.trim()) {
            showNotification("Please provide a reason for the announcement to use the AI Wizard.", "warning");
            return;
        }
        setIsAiGenerating(true);
        try {
            const generatedContent = await generateAnnouncement({
                title: title,
                reason: aiReason,
                area: aiArea,
                time: aiTime,
            });
            setContent(generatedContent);
            if (!title && aiReason) {
                setTitle(aiReason); // Populate title if empty
            }
            showNotification("AI has generated an announcement template for you!", "success");
        } catch (error) {
            showNotification(error.message || "AI Wizard failed to generate content.", "error");
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        if (!title.trim() || !content.trim() || !startDate) {
            setFormError("Title, Content, and Start Date are required.");
            return;
        }
        if (endDate && new Date(endDate) < new Date(startDate)) {
            setFormError("End date cannot be before start date.");
            return;
        }

        const announcementData = {
            title,
            content,
            type,
            status,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            targetRoles: targetRoles.length === 0 || targetRoles.includes('all') ? ['all'] : targetRoles,
        };
        onSubmit(announcementData);
    };
    
    const commonInputClass = "w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-200 text-gray-900";
    const commonButtonClass = "flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";

    return (
        <div className="p-1 flex flex-col lg:flex-row gap-8">
            {/* Left side - AI Wizard and Main Form */}
            <div className="lg:w-1/2 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                            <AlertCircle size={20} className="mr-2" /> {formError}
                        </div>
                    )}
                    <div>
                        <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 mb-1"><Type size={16} className="inline mr-1.5" />Title *</label>
                        <input type="text" id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} placeholder="E.g., Scheduled Maintenance" required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="announcementContent" className="block text-sm font-medium text-gray-700">Content *</label>
                            <Tooltip text="Use AI to rewrite or improve your content below.">
                                <button type="button" onClick={handleAiAssist} className={`${commonButtonClass} text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-300 py-1.5 px-3`} disabled={isAiAssisting || isSaving || isAiGenerating}>
                                    {isAiAssisting ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Sparkles size={16} className="mr-1.5" />}
                                    {isAiAssisting ? 'Refining...' : 'Refine Content'}
                                </button>
                            </Tooltip>
                        </div>
                        <textarea id="announcementContent" value={content} onChange={(e) => setContent(e.target.value)} rows="10" className={commonInputClass} placeholder="Describe the announcement, or use the AI Wizard to generate content." required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="announcementType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select id="announcementType" value={type} onChange={(e) => setType(e.target.value)} className={commonInputClass}>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <button type="button" onClick={() => setStatus(status === 'active' ? 'archived' : 'active')} className={`${commonButtonClass} w-full ${status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-300'}`}>
                                {status === 'active' ? <CheckSquare size={18} className="mr-2" /> : <XSquare size={18} className="mr-2" />}
                                {status === 'active' ? 'Active' : 'Archived'}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1"><CalendarDays size={16} className="inline mr-1.5" />Start Date *</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={commonInputClass} required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1"><CalendarDays size={16} className="inline mr-1.5" />End Date (Optional)</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={commonInputClass} min={startDate} />
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Right side - AI Wizard */}
            <div className="lg:w-1/2 p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-6">
                 <h3 className="text-lg font-semibold text-blue-800 flex items-center"><Sparkles size={20} className="mr-2"/> AI Announcement Wizard</h3>
                 <p className="text-sm text-blue-700">Fill in the details below and let AI generate a complete, professional announcement for you. It will populate the 'Content' field on the left.</p>
                 
                 <div>
                    <label htmlFor="aiReason" className="block text-sm font-medium text-gray-700 mb-1"><MessageSquare size={16} className="inline mr-1.5" />Reason / Event *</label>
                    <input type="text" id="aiReason" value={aiReason} onChange={(e) => setAiReason(e.target.value)} className={commonInputClass} placeholder="E.g., Emergency Mainline Repair" />
                </div>
                 <div>
                    <label htmlFor="aiArea" className="block text-sm font-medium text-gray-700 mb-1"><MapPin size={16} className="inline mr-1.5" />Affected Area(s)</label>
                    <input type="text" id="aiArea" value={aiArea} onChange={(e) => setAiArea(e.target.value)} className={commonInputClass} placeholder="E.g., Brgy. San Juan, all of Phase 2" />
                </div>
                 <div>
                    <label htmlFor="aiTime" className="block text-sm font-medium text-gray-700 mb-1"><Clock size={16} className="inline mr-1.5" />Date & Time of Event</label>
                    <input type="text" id="aiTime" value={aiTime} onChange={(e) => setAiTime(e.target.value)} className={commonInputClass} placeholder="E.g., June 8, 2025, from 10:00 PM to 4:00 AM" />
                </div>
                
                <button type="button" onClick={handleAiGenerate} className={`${commonButtonClass} w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`} disabled={isAiGenerating || isSaving || !aiReason}>
                    {isAiGenerating ? <Loader2 size={20} className="animate-spin mr-2" /> : <Sparkles size={20} className="mr-2" />}
                    {isAiGenerating ? 'Generating...' : 'Generate Announcement Content'}
                </button>
            </div>

            {/* Bottom buttons */}
            <div className="lg:col-span-2 w-full pt-6 border-t mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                 <button type="button" onClick={onCancel} className={`${commonButtonClass} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300 w-full sm:w-auto order-2 sm:order-1`} disabled={isSaving || isAiGenerating || isAiAssisting}>Cancel</button>
                 <button type="submit" form="announcementForm" onClick={handleSubmit} className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 w-full sm:w-auto order-1 sm:order-2`} disabled={isSaving || isAiGenerating || isAiAssisting || !title || !content}>
                    {isSaving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                    {isSaving ? 'Saving...' : (initialData ? 'Update Announcement' : 'Create Announcement')}
                 </button>
            </div>
        </div>
    );
};

export default AnnouncementForm;