import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaygroundFacility, PlaygroundFacilityAssignment } from '../../types/playgroundFacilities';

interface PlaygroundFacilitiesListProps {
    facilities: PlaygroundFacility[];
    playgroundFacilities: PlaygroundFacilityAssignment[];
    showAssignmentMode: boolean;
    onEdit: (facility: PlaygroundFacility) => void;
    onDelete: (facility: PlaygroundFacility) => void;
    onRemoveFromPlayground: (facilityId: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PlaygroundFacilitiesList: React.FC<PlaygroundFacilitiesListProps> = ({
    facilities,
    playgroundFacilities,
    showAssignmentMode,
    onEdit,
    onDelete,
    onRemoveFromPlayground,
    currentPage,
    totalPages,
    onPageChange
}) => {
    const { t } = useTranslation();

    const renderFacilityIcon = (icon: string) => {
        // You can implement your icon system here
        return (
            <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-gold text-sm">{icon.charAt(0).toUpperCase()}</span>
            </div>
        );
    };

    const renderFacilityBadge = (category: string) => {
        const categoryColors = {
            SPORTS: 'bg-blue-900/20 text-blue-400 border-blue-500/50',
            SAFETY: 'bg-red-900/20 text-red-400 border-red-500/50',
            COMFORT: 'bg-green-900/20 text-green-400 border-green-500/50',
            UTILITIES: 'bg-purple-900/20 text-purple-400 border-purple-500/50',
            ENTERTAINMENT: 'bg-pink-900/20 text-pink-400 border-pink-500/50',
            ACCESSIBILITY: 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50'
        };

        const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-900/20 text-gray-400 border-gray-500/50';

        return (
            <span className={`px-2 py-1 rounded-full text-xs border ${colorClass}`}>
                {t(`playgroundFacilities.categories.${category.toLowerCase()}`, category)}
            </span>
        );
    };

    const renderAllFacilities = () => {
        if (facilities.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-400">{t('playgroundFacilities.noFacilities')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {facilities.map((facility) => (
                    <div
                        key={facility.id}
                        className="bg-darkest-bg border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {renderFacilityIcon(facility.icon)}
                                <div>
                                    <h4 className="text-white font-medium">{facility.name}</h4>
                                    <p className="text-gray-400 text-sm">{facility.description}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {renderFacilityBadge(facility.category)}
                                        <span className={`px-2 py-1 rounded-full text-xs border ${
                                            facility.active
                                                ? 'bg-green-900/20 text-green-400 border-green-500/50'
                                                : 'bg-gray-900/20 text-gray-400 border-gray-500/50'
                                        }`}>
                                            {facility.active ? t('common.active') : t('common.inactive')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onEdit(facility)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => onDelete(facility)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAssignedFacilities = () => {
        if (playgroundFacilities.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-400">{t('playgroundFacilities.noAssignedFacilities')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {playgroundFacilities.map((assignment) => (
                    <div
                        key={assignment.id}
                        className="bg-darkest-bg border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {renderFacilityIcon(assignment.facility.icon)}
                                <div>
                                    <h4 className="text-white font-medium">{assignment.facility.name}</h4>
                                    <p className="text-gray-400 text-sm">{assignment.facility.description}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {renderFacilityBadge(assignment.facility.category)}
                                        <span className="px-2 py-1 rounded-full text-xs border bg-gold/20 text-gold border-gold/50">
                                            {t('playgroundFacilities.quantity')}: {assignment.quantity}
                                        </span>
                                    </div>
                                    {assignment.notes && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            {t('playgroundFacilities.notes')}: {assignment.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onRemoveFromPlayground(assignment.facility.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                    {t('common.remove')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                        i === currentPage
                            ? 'bg-gold text-darkest-bg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }

        return (
            <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {t('common.previous')}
                </button>
                {pages}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {t('common.next')}
                </button>
            </div>
        );
    };

    return (
        <div>
            {showAssignmentMode ? renderAssignedFacilities() : renderAllFacilities()}
            {!showAssignmentMode && renderPagination()}
        </div>
    );
};

export default PlaygroundFacilitiesList;
