import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import AnnouncementForm from './AnnouncementForm.jsx';
import ViewAnnouncements from './ViewAnnouncements.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from '../../services/dataService.js';

const AnnouncementManager = ({ db, userData, showNotification, viewOnly = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [announcementToDeleteId, setAnnouncementToDeleteId] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DataService.getAllAnnouncements(db, viewOnly);
      if (result.success) {
        setAnnouncements(result.data || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification("Failed to load announcements.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [db, showNotification, viewOnly]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenModalForNew = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSubmitAnnouncement = async (announcementData) => {
    setIsSaving(true);
    const operation = editingAnnouncement
      ? DataService.updateAnnouncement(db, editingAnnouncement.id, { ...announcementData, updatedBy: userData.uid })
      : DataService.createAnnouncement(db, { ...announcementData, createdBy: userData.uid, authorName: userData.displayName });

    const result = await operation;
    if (result.success) {
      showNotification(`Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully!`, "success");
      fetchAnnouncements();
      setIsModalOpen(false);
    } else {
      showNotification(`Failed to save announcement: ${result.error}`, "error");
    }
    setIsSaving(false);
  };

  const handleDeleteClick = (id) => {
    setAnnouncementToDeleteId(id);
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDeleteId) return;
    setActionLoadingId(announcementToDeleteId);
    const result = await DataService.deleteAnnouncement(db, announcementToDeleteId);
    if(result.success) {
      showNotification("Announcement deleted successfully!", "success");
      fetchAnnouncements();
    } else {
      showNotification(`Failed to delete announcement: ${result.error}`, "error");
    }
    setShowConfirmDeleteModal(false);
    setAnnouncementToDeleteId(null);
    setActionLoadingId(null);
  };
  
  const handleToggleStatus = async (announcement) => {
    setActionLoadingId(announcement.id);
    const newStatus = announcement.status === 'active' ? 'archived' : 'active';
    const result = await DataService.updateAnnouncement(db, announcement.id, { status: newStatus, updatedBy: userData.uid });
    
    if(result.success){
        showNotification(`Announcement status changed to ${newStatus}.`, "success");
        fetchAnnouncements();
    } else {
        showNotification("Failed to update status: " + result.error, "error");
    }
    setActionLoadingId(null);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h3 className="text-2xl font-semibold">{viewOnly ? "Company Announcements" : "Manage Announcements"}</h3>
        {!viewOnly && (
            <button onClick={handleOpenModalForNew} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                <PlusCircle size={18} className="mr-2" /> New Announcement
            </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading Announcements..." />
      ) : (
        <ViewAnnouncements
          announcements={announcements}
          onEdit={!viewOnly ? handleOpenModalForEdit : undefined}
          onDelete={!viewOnly ? handleDeleteClick : undefined}
          onToggleStatus={!viewOnly ? handleToggleStatus : undefined}
          actionLoadingId={actionLoadingId}
          viewOnly={viewOnly}
        />
      )}

      {!viewOnly && isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'} size="full">
          <AnnouncementForm
            initialData={editingAnnouncement}
            onSubmit={handleSubmitAnnouncement}
            onCancel={() => setIsModalOpen(false)}
            isSaving={isSaving}
            showNotification={showNotification}
          />
        </Modal>
      )}

      {!viewOnly && showConfirmDeleteModal && (
        <ConfirmationModal
            isOpen={showConfirmDeleteModal}
            onClose={() => setShowConfirmDeleteModal(false)}
            onConfirm={confirmDeleteAnnouncement}
            title="Confirm Deletion"
            isConfirming={!!actionLoadingId}
        >
          Are you sure you want to delete this announcement? This action cannot be undone.
        </ConfirmationModal>
      )}
    </div>
  );
};

export default AnnouncementManager;