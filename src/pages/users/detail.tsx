import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import UserForm from '../../components/users/UserForm';
import { useUserStore } from '../../store/userStore';
import type { CreateUserRequest } from '../../types/users';

const UserDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentUser,
        roles,
        isLoading,
        error,
        fetchUser,
        fetchRoles,
        updateUser,
        updateUserRoles,
        deleteUser,
        clearError
    } = useUserStore();

    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchUser(parseInt(id));
            fetchRoles();
        }
        return () => {
            clearError();
        };
    }, [id, fetchUser, fetchRoles, clearError]);

    const handleUpdateUser = async (data: CreateUserRequest) => {
        if (!currentUser) return;
        
        const success = await updateUser(currentUser.id, data);
        if (success) {
            setShowEditForm(false);
        }
    };

    const handleUpdateRoles = async (roleIds: number[]) => {
        if (!currentUser) return;
        
        const success = await updateUserRoles(currentUser.id, roleIds);
        if (success) {
            setShowRoleModal(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!currentUser) return;
        
        const success = await deleteUser(currentUser.id);
        if (success) {
            navigate('/dashboard/users');
        }
    };

    const breadcrumbItems = [
        { label: t('users.title'), to: '/dashboard/users' },
        { label: currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : t('users.userDetails') }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500 mb-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                >
                    {t('common.backToList')}
                </button>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('users.notFound')}</h3>
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                >
                    {t('common.backToList')}
                </button>
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />

            <div className="bg-card-bg rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gold to-yellow-500 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-darkest-bg">
                                {currentUser.firstname} {currentUser.lastname}
                            </h1>
                            <p className="text-darkest-bg/80 mt-1">
                                {t('users.userDetails')}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <button
                                onClick={() => setShowEditForm(true)}
                                className="bg-darkest-bg text-gold px-4 py-2 rounded-lg hover:bg-darkest-bg/90 transition-colors duration-200 flex items-center gap-2 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                                {t('common.edit')}
                            </button>
                            <button
                                onClick={() => setShowRoleModal(true)}
                                className="bg-darkest-bg text-gold px-4 py-2 rounded-lg hover:bg-darkest-bg/90 transition-colors duration-200 flex items-center gap-2 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                                {t('users.manageRoles')}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-darkest-bg rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gold mb-4">{t('users.basicInfo')}</h2>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">{t('users.firstname')}</dt>
                                    <dd className="mt-1 text-sm text-white">{currentUser.firstname}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">{t('users.lastname')}</dt>
                                    <dd className="mt-1 text-sm text-white">{currentUser.lastname}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">{t('users.phone')}</dt>
                                    <dd className="mt-1 text-sm text-white">{currentUser.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-400">{t('users.userId')}</dt>
                                    <dd className="mt-1 text-sm text-white">{currentUser.id}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Roles */}
                        <div className="bg-darkest-bg rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gold">{t('users.roles')}</h2>
                                <button
                                    onClick={() => setShowRoleModal(true)}
                                    className="text-sm bg-gold text-darkest-bg px-3 py-1 rounded-md hover:bg-gold/90 transition-colors duration-200"
                                >
                                    {t('users.manageRoles')}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {currentUser.roles.length > 0 ? (
                                    currentUser.roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex items-center justify-between p-3 bg-card-bg rounded-md"
                                        >
                                            <span className="text-white font-medium">{role.name}</span>
                                            <span className="text-xs text-gray-400">ID: {role.id}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">{t('users.noRoles')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-6 bg-darkest-bg rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gold mb-4">{t('common.additionalInformation')}</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-400">{t('users.totalRoles')}</dt>
                                <dd className="mt-1 text-sm text-white">{currentUser.roles.length}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-400">{t('users.userStatus')}</dt>
                                <dd className="mt-1">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                        {t('common.active')}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                title={t('users.editUser')}
            >
                <UserForm
                    initialData={currentUser}
                    onSubmit={handleUpdateUser}
                    onCancel={() => setShowEditForm(false)}
                />
            </Modal>

            {/* Manage Roles Modal */}
            <Modal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                title={t('users.manageRoles')}
            >
                <div className="p-4 space-y-4">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-medium text-white">
                            {currentUser.firstname} {currentUser.lastname}
                        </h3>
                        <p className="text-gray-400">{currentUser.phone}</p>
                    </div>

                    <div className="space-y-2">
                        {roles.map((role) => (
                            <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentUser.roles.some(r => r.id === role.id)}
                                    onChange={(e) => {
                                        const currentRoleIds = currentUser.roles.map(r => r.id);
                                        const newRoleIds = e.target.checked
                                            ? [...currentRoleIds, role.id]
                                            : currentRoleIds.filter(id => id !== role.id);
                                        handleUpdateRoles(newRoleIds);
                                    }}
                                    className="rounded border-gray-600 text-gold focus:ring-gold focus:ring-offset-0"
                                />
                                <span className="text-white">{role.name}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button
                            onClick={() => setShowRoleModal(false)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('users.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('users.deleteWarningDetail', { 
                            name: `${currentUser.firstname} ${currentUser.lastname}` 
                        })}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.loading') : t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserDetailPage;
