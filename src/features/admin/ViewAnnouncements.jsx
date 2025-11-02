import React from 'react';
import { Edit2, Trash2, Eye, EyeOff, Info as InfoIcon, Loader2, Hash } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import DOMPurify from 'dompurify';

const ViewAnnouncements = ({ announcements, onEdit, onDelete, onToggleStatus, actionLoadingId, viewOnly = false }) => {

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        let date;
        try {
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
                 date = new Date(timestamp);
            } else {
                 return 'Invalid Date';
            }
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
             return 'Invalid Date';
        }
    };

    if (!announcements || announcements.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                <InfoIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No announcements found.</p>
                {!viewOnly && <p className="text-sm text-gray-500 mt-1">Create one using the 'New Announcement' button.</p>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {announcements.map(ann => {
                 const cleanHtml = DOMPurify.sanitize(ann.content || '');
                 return (
                    <div key={ann.id} className={`p-4 rounded-lg shadow-md border-l-4 transition-opacity ${ann.status === 'active' ? 'border-green-500 bg-white hover:shadow-lg' : 'border-gray-400 bg-gray-50 opacity-80 hover:opacity-100 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-grow pr-4">
                                <h4 className="text-lg font-semibold text-gray-800">{ann.title}</h4>
                                <div className="flex items-center flex-wrap gap-2 text-xs mt-1">
                                    <span className={`px-2 py-0.5 font-semibold uppercase tracking-wider rounded-full ${ann.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {ann.status}
                                    </span>
                                     <span className={`px-2 py-0.5 font-semibold uppercase tracking-wider rounded-full ${ann.type === 'critical' ? 'bg-red-100 text-red-800' : (ann.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800')}`}>
                                        {ann.type}
                                    </span>
                                     <span className="text-gray-400 font-mono flex items-center"><Hash size={12} className="mr-0.5"/>{ann.id.substring(0, 8)}...</span>
                                </div>
                            </div>

                            {!viewOnly && (
                                <div className="flex space-x-2 items-center flex-shrink-0">
                                    {actionLoadingId === ann.id ? <Loader2 className="animate-spin text-gray-500" /> : (
                                        <>
                                            {onToggleStatus && (
                                                <button
                                                    onClick={() => onToggleStatus(ann)}
                                                    className={`p-1.5 rounded-md hover:bg-opacity-20 transition-colors ${ann.status === 'active' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                                                    title={ann.status === 'active' ? "Archive" : "Activate"}
                                                >
                                                    {ann.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button onClick={() => onEdit(ann)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100 transition-colors" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(ann.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 mt-3 pt-3 border-t border-gray-200/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanHtml }}>
                        </div>
                        <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200/80">
                            <p>Author: {ann.authorName || 'Admin'}</p>
                            <p>Created: {formatDate(ann.createdAt)}</p>
                            {ann.updatedAt && ann.updatedAt?.seconds !== ann.createdAt?.seconds && <p>Updated: {formatDate(ann.updatedAt)}</p>}
                            <p>Display: {formatDate(ann.startDate)} to {ann.endDate ? formatDate(ann.endDate) : 'Ongoing'}</p>
                        </div>
                    </div>
                 );
            })}
        </div>
    );
};

export default ViewAnnouncements;