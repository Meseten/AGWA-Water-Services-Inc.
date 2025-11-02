import React, { useState, useEffect } from 'react';
import { Loader2, Save, Sparkles, AlertCircle, Type, CalendarDays, CheckSquare, XSquare } from 'lucide-react';
import { callDeepseekAPI, generateAnnouncement } from '../../services/deepseekService.js';
import Tooltip from '../../components/ui/Tooltip.jsx';
import RichTextEditor from '../../components/ui/RichTextEditor.jsx';
import DOMPurify from 'dompurify';

const AnnouncementForm = ({ initialData = null, onSubmit, onCancel, isSaving, showNotification }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('info');
    const [status, setStatus] = useState('active');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [targetRoles, setTargetRoles] = useState(['all']);

    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [formError, setFormError] = useState('');

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
            setTitle('');
            setContent('');
            setType('info');
            setEndDate('');
            setTargetRoles(['all']);
            setAiPrompt('');
        }
    }, [initialData]);

     const handleContentChange = (value) => {
        setContent(value);
         if (formError && value.replace(/<[^>]*>?/gm, '').trim()) setFormError('');
    };


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
        const plainTextContent = content.replace(/<[^>]*>?/gm, '').trim();
        
        if (aiPrompt.trim()) {
            setIsAiGenerating(true);
            try {
                const generatedContent = await generateAnnouncement({
                    title: title || aiPrompt,
                    reason: aiPrompt,
                    area: '',
                    time: '',
                });
                setContent(generatedContent);
                if (!title.trim() && aiPrompt.trim()) {
                    setTitle(aiPrompt.trim());
                }
                showNotification("AI generated a new draft!", "success");
            } catch (error) {
                const errorMessage = error?.message || "AI generation failed.";
                showNotification(errorMessage, "error");
            } finally {
                setIsAiGenerating(false);
            }
        } else if (plainTextContent) {
            setIsAiGenerating(true);
            try {
                const prompt = `Refine this announcement draft for AGWA Water Services. Make it clear, professional, concise, using simple HTML (<p>, <strong>, <ul>, <li>). Announcement Type: ${type}. Title: "${title}". Original Content (may contain HTML): "${content}". Respond only with the refined HTML content.`;
                
                const messages = [{ role: 'user', content: prompt }];
                const assistedContent = await callDeepseekAPI(messages);
                
                setContent(assistedContent);
                showNotification("AI has refined your content!", "success");
            } catch (error) {
                const errorMessage = error?.message || "AI assistance failed.";
                showNotification(errorMessage, "error");
            } finally {
                setIsAiGenerating(false);
            }
        } else {
            showNotification("Please provide a prompt or write some content for the AI to assist with.", "warning");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        const plainTextContent = content.replace(/<[^>]*>?/gm, '').trim();

        if (!title.trim() || !plainTextContent || !startDate) {
            setFormError("Title, Content, and Start Date are required.");
            return;
        }
        if (endDate && new Date(endDate) < new Date(startDate)) {
            setFormError("End date cannot be before start date.");
            return;
        }

        const sanitizedContent = DOMPurify.sanitize(content);

        const announcementData = {
            title: title.trim(),
            content: sanitizedContent,
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
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-6" id="announcementForm">
                {formError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                        <AlertCircle size={20} className="mr-2" /> {formError}
                    </div>
                )}
                <div>
                    <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 mb-1"><Type size={16} className="inline mr-1.5" />Title *</label>
                    <input type="text" id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} placeholder="E.g., Scheduled Maintenance in Poblacion" required />
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <label htmlFor="aiPrompt" className="block text-sm font-medium text-blue-800"><Sparkles size={16} className="inline mr-1.5" />AI Assistant</label>
                    <input 
                        type="text" 
                        id="aiPrompt" 
                        value={aiPrompt} 
                        onChange={(e) => setAiPrompt(e.target.value)} 
                        className={commonInputClass} 
                        placeholder="Type a prompt to generate new content (e.g., 'Emergency repair in Muzon')"
                    />
                    <button type="button" onClick={handleAiAssist} className={`${commonButtonClass} text-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 py-2 px-4`} disabled={isAiGenerating || isSaving}>
                        {isAiGenerating ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Sparkles size={16} className="mr-1.5" />}
                        {aiPrompt.trim() ? 'Generate Content' : 'Refine Existing Content'}
                    </button>
                    <p className="text-xs text-gray-500">
                        If the prompt is filled, AI will generate new content. If the prompt is empty and the editor has content, AI will refine it.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <RichTextEditor
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Describe the announcement, or use the AI Assistant above to generate content."
                        className="bg-white rounded-lg border border-gray-300 min-h-[250px]"
                    />
                    {formError && !content.replace(/<[^>]*>?/gm, '').trim() && <p className="text-red-500 text-xs mt-1">Content is required.</p>}
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

                <div className="pt-6 border-t mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <button type="button" onClick={onCancel} className={`${commonButtonClass} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300 w-full sm:w-auto order-2 sm:order-1`} disabled={isSaving || isAiGenerating}>Cancel</button>
                    <button type="submit" form="announcementForm" className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 w-full sm:w-auto order-1 sm:order-2`} disabled={isSaving || isAiGenerating || !title.trim() || !content.replace(/<[^>]*>?/gm, '').trim()}>
                        {isSaving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                        {isSaving ? 'Saving...' : (initialData ? 'Update Announcement' : 'Create Announcement')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnnouncementForm;