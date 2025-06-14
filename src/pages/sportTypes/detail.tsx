import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SportTypeForm from '../../components/sportTypes/SportTypeForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import { useSportTypeStore } from '../../store/sportTypeStore';
import type { SportTypeUpdateRequest } from '../../types/sportTypes';

const SportTypeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sportTypeId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentSportType, isLoading, error, fetchSportType, updateSportType, deleteSportType } = useSportTypeStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (sportTypeId > 0) {
            fetchSportType(sportTypeId);
        }
    }, [sportTypeId, fetchSportType]);

    const handleUpdateSportType = async (data: SportTypeUpdateRequest) => {
        if (sportTypeId > 0) {
            const success = await updateSportType(sportTypeId, data);
            if (success) {
                setIsEditing(false);
            }
        }
    };

    const handleDeleteSportType = async () => {
        if (sportTypeId > 0) {
            const success = await deleteSportType(sportTypeId);
            if (success) {
                navigate('/dashboard/sport-types');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                <p>{error}</p>
                <Link to="/dashboard/sport-types" className="mt-4 inline-block text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    if (!currentSportType) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 mb-4">{t('sportTypes.notFound')}</p>
                <Link to="/dashboard/sport-types" className="text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('sportTypes.title'), path: '/dashboard/sport-types' },
        { label: currentSportType.name }
    ];

    return (
        <div>
            {/* Breadcrumbs */}
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <Link to="/dashboard/sport-types" className="text-gray-400 hover:text-white mr-4 p-2 rounded-full hover:bg-darkest-bg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                            {currentSportType.name}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">{t('sportTypes.sportTypeDetails')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Sport Type Details */}
            <div className="space-y-6">
                {/* Main Info Card */}
                <div className="bg-gradient-to-r from-card-bg to-darkest-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-4">
                        <h3 className="text-darkest-bg font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            {t('sportTypes.basicInfo')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('sportTypes.name')}:</span>
                            <span className="text-white font-semibold">{currentSportType.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('sportTypes.description')}:</span>
                            <span className="text-white font-semibold text-right max-w-xs">
                                {currentSportType.description || t('common.notSpecified')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">ID:</span>
                            <span className="text-gold font-bold">#{currentSportType.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('common.status')}:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                currentSportType.active 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                                {currentSportType.active ? t('common.active') : t('common.inactive')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Team Configuration */}
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                            {t('sportTypes.teamConfiguration')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('sportTypes.teamBased')}:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                currentSportType.teamBased 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                                {currentSportType.teamBased ? t('common.yes') : t('common.no')}
                            </span>
                        </div>
                        {currentSportType.teamBased && (
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-medium">{t('sportTypes.minTeamSize')}:</span>
                                    <span className="text-white font-semibold">{currentSportType.minTeamSize}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-medium">{t('sportTypes.maxTeamSize')}:</span>
                                    <span className="text-white font-semibold">{currentSportType.maxTeamSize}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.metadata')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('common.createdAt')}:</span>
                            <span className="text-white font-semibold">
                                {new Date(currentSportType.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('common.updatedAt')}:</span>
                            <span className="text-white font-semibold">
                                {new Date(currentSportType.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Sport Type Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('sportTypes.editSportType')}
            >
                <SportTypeForm
                    initialData={currentSportType}
                    onSubmit={handleUpdateSportType}
                    onCancel={() => setIsEditing(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('sportTypes.confirmDelete')}
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">{t('common.warning')}</h3>
                    <p className="text-gray-300 text-center mb-8 leading-relaxed">
                        {t('sportTypes.deleteWarningDetail', { name: currentSportType.name })}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteSportType}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SportTypeDetailPage;
