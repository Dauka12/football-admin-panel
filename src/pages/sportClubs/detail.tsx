import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SportClubForm from '../../components/sportClubs/SportClubForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import { useSportClubStore } from '../../store/sportClubStore';
import type { UpdateSportClubRequest } from '../../types/sportClubs';

const SportClubDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const clubId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { 
        currentSportClub, 
        isLoading, 
        error, 
        fetchSportClub, 
        updateSportClub, 
        deleteSportClub 
    } = useSportClubStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (clubId > 0) {
            fetchSportClub(clubId);
        }
    }, [clubId, fetchSportClub]);

    const handleUpdateSportClub = async (data: UpdateSportClubRequest) => {
        if (clubId > 0) {
            const success = await updateSportClub(clubId, data);
            if (success) {
                setIsEditing(false);
            }
        }
    };

    const handleDeleteSportClub = async () => {
        if (clubId > 0) {
            const success = await deleteSportClub(clubId);
            if (success) {
                navigate('/dashboard/sport-clubs');
            }
        }
    };

    const getClubTypeDisplay = (type: string) => {
        const types = {
            'KIDS': t('sportClubs.clubTypes.kids'),
            'REGULAR': t('sportClubs.clubTypes.regular'),
            'PROFESSIONAL': t('sportClubs.clubTypes.professional'),
            'MIXED': t('sportClubs.clubTypes.mixed')
        };
        return types[type as keyof typeof types] || type;
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

    if (error || !currentSportClub) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500 mb-4">
                    {error || t('sportClubs.notFound')}
                </div>
                <Link 
                    to="/dashboard/sport-clubs"
                    className="bg-gold text-darkest-bg px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors duration-200"
                >
                    {t('common.goBack')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: t('sportClubs.title'), path: '/dashboard/sport-clubs' },
                    { label: currentSportClub.name }
                ]}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-card-bg to-darkest-bg p-6 rounded-xl shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl lg:text-4xl font-bold text-white">{currentSportClub.name}</h1>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                currentSportClub.active 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                                {currentSportClub.active ? t('common.active') : t('common.inactive')}
                            </span>
                        </div>
                        {currentSportClub.description && (
                            <p className="text-gray-300 text-lg mb-4">{currentSportClub.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                ID: {currentSportClub.id}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                                </svg>
                                {currentSportClub.establishmentYear && `${t('sportClubs.established')} ${currentSportClub.establishmentYear}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            {t('sportClubs.editSportClub')}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916M3.75 5.7l17.5-.05" />
                            </svg>
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <h3 className="text-white font-bold text-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        {t('sportClubs.basicInfo')}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                {t('sportClubs.clubType')}
                            </label>
                            <p className="text-white text-lg">{getClubTypeDisplay(currentSportClub.clubType)}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                {t('sportTypes.sportType')}
                            </label>
                            <p className="text-white text-lg">{currentSportClub.sportTypeName || '-'}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                {t('sportClubs.ageRange')}
                            </label>
                            <p className="text-white text-lg">
                                {currentSportClub.minAge} - {currentSportClub.maxAge} {t('common.years')}
                            </p>
                        </div>

                        {currentSportClub.membershipFee && currentSportClub.membershipFee > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.membershipFee')}
                                </label>
                                <p className="text-white text-lg">{currentSportClub.membershipFee} ₽</p>
                            </div>
                        )}

                        {currentSportClub.establishmentYear && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.establishmentYear')}
                                </label>
                                <p className="text-white text-lg">{currentSportClub.establishmentYear}</p>
                            </div>
                        )}

                        {currentSportClub.operatingHours && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.operatingHours')}
                                </label>
                                <p className="text-white text-lg">{currentSportClub.operatingHours}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                    <h3 className="text-white font-bold text-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {t('sportClubs.contactInfo')}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentSportClub.contactEmail && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.contactEmail')}
                                </label>
                                <a 
                                    href={`mailto:${currentSportClub.contactEmail}`}
                                    className="text-gold hover:text-gold/80 text-lg transition-colors"
                                >
                                    {currentSportClub.contactEmail}
                                </a>
                            </div>
                        )}
                        
                        {currentSportClub.contactPhone && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.contactPhone')}
                                </label>
                                <a 
                                    href={`tel:${currentSportClub.contactPhone}`}
                                    className="text-gold hover:text-gold/80 text-lg transition-colors"
                                >
                                    {currentSportClub.contactPhone}
                                </a>
                            </div>
                        )}
                        
                        {currentSportClub.website && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    {t('sportClubs.website')}
                                </label>
                                <a 
                                    href={currentSportClub.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gold hover:text-gold/80 text-lg transition-colors flex items-center gap-1"
                                >
                                    {currentSportClub.website}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Addresses */}
            {currentSportClub.addresses && currentSportClub.addresses.length > 0 && (
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {t('sportClubs.addresses')}
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {currentSportClub.addresses.map((address, index) => (
                                <div key={address.id || index} className="bg-darkest-bg p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-white">
                                            {t('sportClubs.address')} {index + 1}
                                        </h4>
                                        {address.isPrimary && (
                                            <span className="bg-gold text-darkest-bg px-2 py-1 rounded text-xs font-medium">
                                                {t('sportClubs.primary')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-gray-300">
                                        <p>{address.streetLine1}</p>
                                        {address.streetLine2 && <p>{address.streetLine2}</p>}
                                        <p className="flex items-center gap-2">
                                            <span>{address.cityName}</span>
                                            {address.zipCode && (
                                                <span className="text-gray-400">• {address.zipCode}</span>
                                            )}
                                        </p>
                                        {address.description && (
                                            <p className="text-sm text-gray-400 italic">{address.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Teams */}
            {currentSportClub.teams && currentSportClub.teams.length > 0 && (
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                            {t('sportClubs.teams')} ({currentSportClub.teams.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentSportClub.teams.map((team) => (
                                <div key={team.id} className="bg-darkest-bg p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-white">{team.name}</h4>
                                        <Link
                                            to={`/dashboard/teams/${team.id}`}
                                            className="text-gold hover:text-gold/80 text-sm transition-colors"
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </div>
                                    {team.description && (
                                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{team.description}</p>
                                    )}
                                    <div className="text-xs text-gray-400">
                                        {team.players?.length || 0} {t('teams.players').toLowerCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Information */}
            {(currentSportClub.facilities || currentSportClub.membershipBenefits) && (
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {t('sportClubs.additionalInfo')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {currentSportClub.facilities && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('sportClubs.facilities')}
                                </label>
                                <p className="text-white whitespace-pre-wrap">{currentSportClub.facilities}</p>
                            </div>
                        )}
                        
                        {currentSportClub.membershipBenefits && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('sportClubs.membershipBenefits')}
                                </label>
                                <p className="text-white whitespace-pre-wrap">{currentSportClub.membershipBenefits}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Sport Club Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('sportClubs.editSportClub')}
            >
                {currentSportClub && (
                    <SportClubForm
                        initialData={{
                            name: currentSportClub.name,
                            description: currentSportClub.description,
                            clubType: currentSportClub.clubType,
                            addresses: currentSportClub.addresses.map(addr => ({
                                streetLine1: addr.streetLine1,
                                streetLine2: addr.streetLine2,
                                cityId: addr.cityId,
                                zipCode: addr.zipCode,
                                description: addr.description,
                                isPrimary: addr.isPrimary
                            })),
                            minAge: currentSportClub.minAge,
                            maxAge: currentSportClub.maxAge,
                            contactEmail: currentSportClub.contactEmail,
                            contactPhone: currentSportClub.contactPhone,
                            website: currentSportClub.website,
                            facilities: currentSportClub.facilities,
                            membershipFee: currentSportClub.membershipFee,
                            membershipBenefits: currentSportClub.membershipBenefits,
                            operatingHours: currentSportClub.operatingHours,
                            sportTypeId: currentSportClub.sportTypeId,
                            establishmentYear: currentSportClub.establishmentYear,
                            teams: currentSportClub.teams?.map(t => t.id) || []
                        }}
                        onSubmit={handleUpdateSportClub}
                        onCancel={() => setIsEditing(false)}
                        isEdit={true}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('sportClubs.confirmDelete')}
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-center text-white mb-2">
                        {t('sportClubs.confirmDelete')}
                    </h3>
                    <p className="text-center text-gray-400 mb-6">
                        {t('sportClubs.deleteWarning')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteSportClub}
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

export default SportClubDetailPage;
