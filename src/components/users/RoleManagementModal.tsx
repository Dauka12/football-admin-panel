import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User, UserRole } from '../../types/users';
import Modal from '../ui/Modal';

interface RoleManagementModalProps {
    user: User;
    availableRoles: UserRole[];
    onUpdateRoles: (roleIds: number[]) => Promise<void>;
    onClose: () => void;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
    user,
    availableRoles,
    onUpdateRoles,
    onClose
}) => {
    const { t } = useTranslation();
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(
        user.roles.map(role => role.id)
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoleIds(prev => 
            prev.includes(roleId) 
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSubmit = async () => {
        if (selectedRoleIds.length === 0) {
            return;
        }

        setIsLoading(true);
        try {
            await onUpdateRoles(selectedRoleIds);
            onClose();
        } catch (error) {
            console.error('Failed to update roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={t('users.manageRoles')}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-gray-400 text-sm">{user.phone}</p>
                </div>

                <div>
                    <h4 className="text-gold font-medium mb-4">{t('users.roles')}</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {availableRoles.map((role) => (
                            <label
                                key={role.id}
                                className="flex items-center space-x-3 p-3 bg-darkest-bg rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRoleIds.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)}
                                    className="w-4 h-4 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
                                />
                                <div className="flex-1">
                                    <div className="text-white font-medium">{role.name}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {selectedRoleIds.length === 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-400 text-sm">
                            {t('users.validation.selectRole')}
                        </p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || selectedRoleIds.length === 0}
                        className="px-4 py-2 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{t('common.save')}</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RoleManagementModal;
