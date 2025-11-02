import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, RotateCcw, Loader2, AlertTriangle, Clock, MapPin, CheckCircle, Info, Zap } from 'lucide-react';
import InterruptionForm from './InterruptionForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';
import { formatDate } from '../../utils/userUtils.js';
import DOMPurify from 'dompurify';

const InterruptionManager = ({ db, userData, showNotification }) => {
  const [interruptions, setInterruptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterruption, setEditingInterruption] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [interruptionToDelete, setInterruptionToDelete] = useState(null);

  const fetchInterruptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DataService.getAllServiceInterruptions(db);
      if (result.success) {
        setInterruptions(result.data || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification(error.message || "Failed to load interruptions.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [db, showNotification]);

  useEffect(() => {
    fetchInterruptions();
  }, [fetchInterruptions]);

  const handleOpenModalForNew = () => {
    setEditingInterruption(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (interruption) => {
    setEditingInterruption(interruption);
    setIsModalOpen(true);
  };

  const handleSubmitInterruption = async (interruptionData) => {
    setIsSaving(true);
    const operation = editingInterruption
      ? DataService.updateServiceInterruption(db, editingInterruption.id, interruptionData)
      : DataService.createServiceInterruption(db, interruptionData);

    const result = await operation;
    if (result.success) {
      showNotification(`Advisory ${editingInterruption ? 'updated' : 'created'} successfully!`, "success");
      fetchInterruptions();
      setIsModalOpen(false);
    } else {
      showNotification(result.error || `Failed to save advisory.`, "error");
    }
    setIsSaving(false);
  };

  const handleDeleteClick = (item) => {
    setInterruptionToDelete(item);
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteInterruption = async () => {
    if (!interruptionToDelete) return;
    setActionLoadingId(interruptionToDelete.id);
    const result = await DataService.deleteServiceInterruption(db, interruptionToDelete.id);
    if(result.success) {
      showNotification("Advisory deleted successfully!", "success");
      fetchInterruptions();
    } else {
      showNotification(result.error || `Failed to delete advisory.`, "error");
    }
    setShowConfirmDeleteModal(false);
    setInterruptionToDelete(null);
    setActionLoadingId(null);
  };

   const getStatusInfo = (status, type) => {
        if ((type === 'Emergency Repair' || type === 'Leak Detection') && status !== 'Resolved') {
             return { icon: Zap, color: 'text-red-700', bgColor: 'bg-red-100', label: 'Emergency' };
        }
        switch (status) {
            case 'Ongoing': return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Ongoing' };
            case 'Scheduled': return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Scheduled' };
            case 'Resolved': return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Resolved' };
            default: return { icon: Info, color: 'text-gray-500', bgColor: 'bg-gray-100', label: status || 'Unknown' };
        }
    };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h3 className="text-2xl font-semibold flex items-center"><AlertTriangle className="mr-3 text-orange-500"/> Manage Service Advisories</h3>
        <button onClick={handleOpenModalForNew} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center text-sm">
            <PlusCircle size={16} className="mr-2" /> New Advisory
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading Advisories..." />
      ) : (
        <div className="space-y-3">
            {interruptions.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg"><Info size={32} className="mx-auto text-gray-400 mb-2"/><p className="text-gray-500">No advisories found.</p></div>
            )}
            {interruptions.map(item => {
                const statusInfo = getStatusInfo(item.status, item.type);
                const StatusIcon = statusInfo.icon;
                return (
                 <div key={item.id} className={`p-4 rounded-lg shadow border-l-4 flex justify-between items-start gap-4 ${statusInfo.bgColor.replace('bg-', 'border-')}`}>
                     <div className="flex-grow">
                         <h4 className="font-semibold text-gray-800">{item.title}</h4>
                          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                             <p className="flex items-center"><MapPin size={12} className="mr-1.5"/> Areas: {item.affectedAreas?.slice(0, 3).join(', ')}{item.affectedAreas?.length > 3 ? '...' : ''} ({item.affectedAreas?.length || 0})</p>
                             <p className="flex items-center"><Clock size={12} className="mr-1.5"/> Start: {formatDate(item.startDate)}</p>
                             {item.estimatedEndDate && <p className="flex items-center"><Clock size={12} className="mr-1.5"/> End: {formatDate(item.estimatedEndDate)}</p>}
                             <p className="text-gray-400">ID: {item.id.substring(0,8)}...</p>
                         </div>
                     </div>
                     <div className="flex flex-col items-end gap-2 shrink-0">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center ${statusInfo.bgColor} ${statusInfo.color}`}>
                             <StatusIcon size={12} className="mr-1"/> {statusInfo.label}
                         </span>
                         <div className="flex space-x-1">
                             <button onClick={() => handleOpenModalForEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md disabled:opacity-50" disabled={actionLoadingId === item.id}><Edit size={16}/></button>
                             <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md disabled:opacity-50" disabled={actionLoadingId === item.id}>
                                {actionLoadingId === item.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                            </button>
                         </div>
                     </div>
                 </div>
                );
            })}
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInterruption ? 'Edit Advisory' : 'Create New Advisory'} size="2xl">
          <InterruptionForm
            initialData={editingInterruption}
            onSubmit={handleSubmitInterruption}
            onCancel={() => setIsModalOpen(false)}
            isSaving={isSaving}
            showNotification={showNotification}
          />
        </Modal>
      )}

      {showConfirmDeleteModal && interruptionToDelete && (
        <ConfirmationModal
            isOpen={showConfirmDeleteModal}
            onClose={() => setShowConfirmDeleteModal(false)}
            onConfirm={confirmDeleteInterruption}
            title="Confirm Deletion"
            isConfirming={!!actionLoadingId}
            confirmText="Yes, Delete"
            iconType="danger"
        >
          Delete advisory "{interruptionToDelete.title}"? This cannot be undone.
        </ConfirmationModal>
      )}
    </div>
  );
};

export default InterruptionManager;