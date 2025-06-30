import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchParticipant, MatchParticipantStatus, OrganizedMatchParticipant } from '../../types/matchParticipants';

interface MatchParticipantsListProps {
    participants: (MatchParticipant | OrganizedMatchParticipant)[];
    onEdit?: (participant: MatchParticipant | OrganizedMatchParticipant) => void;
    onDelete?: (participant: MatchParticipant | OrganizedMatchParticipant) => void;
    onProcessPayment?: (participant: MatchParticipant | OrganizedMatchParticipant) => void;
    onUpdateStatus?: (participant: MatchParticipant | OrganizedMatchParticipant, status: MatchParticipantStatus) => void;
    showActions?: boolean;
}

const MatchParticipantsList: React.FC<MatchParticipantsListProps> = ({
    participants,
    onEdit,
    onDelete,
    onProcessPayment,
    showActions = false
}) => {
    const { t } = useTranslation();

    if (participants.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <p>{t('matchParticipants.noParticipants')}</p>
            </div>
        );
    }

    const getStatusIcon = (status: MatchParticipantStatus) => {
        switch (status) {
            case 'CONFIRMED':
                return (
                    <div className="w-8 h-8 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'WAITING_PAYMENT':
                return (
                    <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-yellow-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                );
            case 'CANCELLED':
                return (
                    <div className="w-8 h-8 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-500/20 border border-gray-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>
                );
        }
    };

    const getPaymentStatusBadge = (hasPaid: boolean, amountPaid: number) => {
        if (hasPaid && amountPaid > 0) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('matchParticipants.paid')} (${amountPaid})
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {t('matchParticipants.unpaid')}
                </span>
            );
        }
    };

    const getStatusText = (status: string) => {
        if (!status) return 'N/A';
        
        // Convert status to lowercase and handle special cases
        const statusKey = status.toLowerCase();
        const mappedStatus = statusKey === 'waiting_payment' ? 'waiting_payment' : statusKey;
        
        return t(`matchParticipants.statuses.${mappedStatus}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            {participants.map((participant) => (
                <div key={participant.id} className="bg-card-bg border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            {getStatusIcon(participant.status || 'CANCELLED')}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-medium text-gold">
                                        {participant.playerFullName || 'N/A'}
                                    </h4>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        participant.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                        participant.status === 'WAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {getStatusText(participant.status || '')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">{t('matchParticipants.team')}:</span>
                                        <p className="text-white">{participant.teamName || 'N/A'}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-gray-400">{t('matchParticipants.user')}:</span>
                                        <p className="text-white">{(participant.firstName || '') + ' ' + (participant.lastName || '')}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-gray-400">{t('matchParticipants.score')}:</span>
                                        <p className="text-white font-bold">{participant.score || 0}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-gray-400">{t('matchParticipants.joinedAt')}:</span>
                                        <p className="text-white">{participant.joinedAt ? formatDate(participant.joinedAt) : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center space-x-4">
                                    {getPaymentStatusBadge(participant.hasPaid || false, participant.amountPaid || 0)}
                                    
                                    {participant.avatarUrl && (
                                        <img 
                                            src={participant.avatarUrl} 
                                            alt={participant.playerFullName || 'Player'}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {showActions && (
                            <div className="flex items-center space-x-2">
                                {participant.status === 'WAITING_PAYMENT' && onProcessPayment && (
                                    <button
                                        onClick={() => onProcessPayment(participant)}
                                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                        title={t('matchParticipants.processPayment')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </button>
                                )}

                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(participant)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                        title={t('common.edit')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(participant)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                        title={t('common.delete')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MatchParticipantsList;
