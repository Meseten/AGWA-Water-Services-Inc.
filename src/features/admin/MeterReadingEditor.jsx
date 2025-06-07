import React, { useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { allMeterReadingsCollectionPath, profilesCollectionPath } from '../../firebase/firestorePaths';
import { formatDate } from '../../utils/userUtils';
import { Search, Loader2, Edit, Trash2 } from 'lucide-react';
import * as DataService from '../../services/dataService';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import MeterReadingEditModal from './MeterReadingEditModal';

const MeterReadingEditor = ({ showNotification }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // State for modals
    const [editingReading, setEditingReading] = useState(null);
    const [deletingReadingId, setDeletingReadingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError('Please enter an account number.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSearched(true);
        setSearchResults(null);
        try {
            const usersRef = collection(db, profilesCollectionPath());
            const userQuery = query(usersRef, where('accountNumber', '==', searchQuery.trim().toUpperCase()));
            const userSnapshot = await getDocs(userQuery);
            if (userSnapshot.empty) {
                setError('No user found with the provided account number.');
                setIsLoading(false);
                return;
            }
            const userDoc = userSnapshot.docs[0];
            await processUserReadings(userDoc);
        } catch (err) {
            console.error("Error searching for user or readings:", err);
            setError('An error occurred during the search. Check Firestore rules and indexes.');
            setIsLoading(false);
        }
    };

    const processUserReadings = async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const readingsRef = collection(db, allMeterReadingsCollectionPath());
        const readingsQuery = query(readingsRef, where("userId", "==", userId), orderBy("readingDate", "desc"));
        const readingsSnapshot = await getDocs(readingsQuery);
        const readings = readingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSearchResults({ user: userData, readings });
        setIsLoading(false);
    };

    const handleOpenEditModal = (reading) => {
        setEditingReading(reading);
    };

    const handleCloseEditModal = () => {
        setEditingReading(null);
    };

    const handleSaveReading = async (readingId, updatedData) => {
        setIsSaving(true);
        const result = await DataService.updateMeterReading(db, readingId, updatedData);
        if (result.success) {
            showNotification('Meter reading updated successfully!', 'success');
            // Refresh the data locally
            setSearchResults(prev => ({
                ...prev,
                readings: prev.readings.map(r => r.id === readingId ? { ...r, ...updatedData, readingDate: new Date(updatedData.readingDate) } : r)
            }));
            handleCloseEditModal();
        } else {
            showNotification(result.error || 'Failed to update reading.', 'error');
        }
        setIsSaving(false);
    };

    const handleOpenDeleteModal = (readingId) => {
        setDeletingReadingId(readingId);
    };

    const handleConfirmDelete = async () => {
        if (!deletingReadingId) return;
        setIsSaving(true);
        const result = await DataService.deleteMeterReading(db, deletingReadingId);
        if (result.success) {
            showNotification('Meter reading deleted successfully!', 'success');
            setSearchResults(prev => ({
                ...prev,
                readings: prev.readings.filter(r => r.id !== deletingReadingId)
            }));
        } else {
            showNotification(result.error || 'Failed to delete reading.', 'error');
        }
        setDeletingReadingId(null);
        setIsSaving(false);
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Meter Reading Management</h1>
            <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter user account number..."
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center w-full sm:w-auto">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" size={18} />}
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {isLoading && <LoadingSpinner message="Fetching data..." />}

            {!isLoading && searched && !searchResults?.readings?.length && (
                <p className="text-center text-gray-500 mt-8">{error || 'No readings found for this user.'}</p>
            )}

            {searchResults?.user && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Readings for {searchResults.user.displayName} ({searchResults.user.accountNumber})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading (m³)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reader</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {searchResults.readings?.map(reading => (
                                    <tr key={reading.id}>
                                        <td className="px-4 py-4 whitespace-nowrap font-medium">{reading.readingValue}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(reading.readingDate, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{reading.readBy || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{reading.readingType || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center space-x-2">
                                            <button onClick={() => handleOpenEditModal(reading)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors" title="Edit Reading"><Edit size={16}/></button>
                                            <button onClick={() => handleOpenDeleteModal(reading.id)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors" title="Delete Reading"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {editingReading && (
                <MeterReadingEditModal 
                    isOpen={!!editingReading}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveReading}
                    reading={editingReading}
                    isSaving={isSaving}
                />
            )}

            {deletingReadingId && (
                <ConfirmationModal
                    isOpen={!!deletingReadingId}
                    onClose={() => setDeletingReadingId(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Deletion"
                    confirmText="Yes, Delete"
                    isConfirming={isSaving}
                    iconType="danger"
                >
                    Are you sure you want to permanently delete this meter reading? This action cannot be undone.
                </ConfirmationModal>
            )}
        </div>
    );
};

export default MeterReadingEditor;