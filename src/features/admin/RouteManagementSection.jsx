import React, { useState, useEffect, useCallback } from 'react';
import { Map, PlusCircle, Edit, Trash2, Loader2, User, Info } from 'lucide-react';
import * as DataService from '../../services/dataService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import RouteEditModal from './RouteEditModal';

const RouteManagementSection = ({ db, showNotification }) => {
    const [routes, setRoutes] = useState([]);
    const [meterReaders, setMeterReaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [routeToDelete, setRouteToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [routesResult, readersResult] = await Promise.all([
                DataService.getAllMeterRoutes(db),
                DataService.getAllMeterReaders(db)
            ]);

            if (routesResult.success) {
                setRoutes(routesResult.data);
            } else {
                setError(routesResult.error || 'Failed to load routes.');
            }

            if (readersResult.success) {
                setMeterReaders(readersResult.data);
            } else {
                setError(prev => prev + (readersResult.error || ' Failed to load meter readers.'));
            }
        } catch (e) {
            setError('An unexpected error occurred while fetching data.');
        }
        setIsLoading(false);
    }, [db]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (route = null) => {
        setEditingRoute(route);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingRoute(null);
        setIsModalOpen(false);
    };

    const handleSaveRoute = async (routeData) => {
        setIsSaving(true);
        const result = await DataService.createOrUpdateMeterRoute(db, routeData, editingRoute?.id);
        if (result.success) {
            showNotification(`Route ${editingRoute ? 'updated' : 'created'} successfully!`, 'success');
            fetchData();
            handleCloseModal();
        } else {
            showNotification(result.error || 'Failed to save route.', 'error');
        }
        setIsSaving(false);
    };

    const handleDeleteRoute = async () => {
        if (!routeToDelete) return;
        setIsSaving(true);
        const result = await DataService.deleteMeterRoute(db, routeToDelete.id);
        if (result.success) {
            showNotification('Route deleted successfully!', 'success');
            setRouteToDelete(null);
            fetchData();
        } else {
            showNotification(result.error || 'Failed to delete route.', 'error');
        }
        setIsSaving(false);
    };
    
    const getReaderName = (readerId) => {
        return meterReaders.find(r => r.id === readerId)?.displayName || 'Unassigned';
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading route data..." />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <Map size={30} className="mr-3 text-blue-600" /> Meter Route Management
                </h2>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <PlusCircle size={18} className="mr-2" /> Add New Route
                </button>
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="space-y-3">
                {routes.length > 0 ? routes.map(route => (
                    <div key={route.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">{route.name} <span className="text-sm font-normal text-gray-500">({route.areaCode})</span></p>
                            <p className="text-xs text-gray-600 flex items-center mt-1"><User size={12} className="mr-1.5"/>Assigned to: <span className="font-medium ml-1">{getReaderName(route.assignedReaderId)}</span></p>
                            <p className="text-xs text-gray-600 mt-1">Accounts: {route.accountNumbers?.length || 0}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenModal(route)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={18}/></button>
                            <button onClick={() => setRouteToDelete(route)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10">
                        <Info size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No routes found. Click 'Add New Route' to create one.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <RouteEditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveRoute}
                    route={editingRoute}
                    readers={meterReaders}
                    isSaving={isSaving}
                    db={db}
                />
            )}
            
            {routeToDelete && (
                 <ConfirmationModal
                    isOpen={!!routeToDelete}
                    onClose={() => setRouteToDelete(null)}
                    onConfirm={handleDeleteRoute}
                    title="Confirm Route Deletion"
                    isConfirming={isSaving}
                 >
                    Are you sure you want to delete the route "{routeToDelete.name}"? This action cannot be undone.
                </ConfirmationModal>
            )}
        </div>
    );
};

export default RouteManagementSection;