import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import RoleManagementModal from '../../components/users/RoleManagementModal';
import UserForm from '../../components/users/UserForm';
import { PermissionGate } from '../../components/auth/ProtectedRoute';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserStore } from '../../store/userStore';
import type { CreateUserRequest, User } from '../../types/users';

const UsersPage: React.FC = () => {
    const { t } = useTranslation();
    const { hasPermission, userRoles, isAdmin } = usePermissions();
    // Get everything from store including filter state
    const {
        users,
        roles,
        isLoading,
        error,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
        updateUserRoles,
        totalPages,
        currentPage,
        pageSize,
        
        // Filter state
        filterFirstName,
        filterLastName,
        filterPhone,
        filterRoleIds,
        sortField,
        sortDirection,
        
        // Filter actions
        setFilterFirstName,
        setFilterLastName,
        setFilterPhone,
        toggleFilterRole,
        setSortField,
        setSortDirection,
        
        // Filter operations
        applyFilters,
        resetFilters,
    } = useUserStore();

    // Local UI state for modals
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = React.useState<User | null>(null);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    // Initialize data on component mount
    useEffect(() => {
        fetchUsers(0, pageSize);
        fetchRoles();
    }, [fetchUsers, fetchRoles, pageSize]);

    // Apply filters handler
    const handleApplyFilters = useCallback(() => {
        applyFilters();
        setIsFilterOpen(false);
    }, [applyFilters]);

    // Reset filters handler
    const handleResetFilters = useCallback(() => {
        resetFilters();
        setIsFilterOpen(false);
    }, [resetFilters]);

    // Page change handler
    const handlePageChange = useCallback((newPage: number) => {
        fetchUsers(newPage, pageSize);
    }, [fetchUsers, pageSize]);

    // Handle role filter toggle - now using store action
    const handleRoleFilterChange = useCallback((roleId: number) => {
        toggleFilterRole(roleId);
    }, [toggleFilterRole]);

    // CRUD operations
    const handleCreateUser = async (data: CreateUserRequest) => {
        const success = await createUser(data);
        if (success) {
            setShowCreateForm(false);
        }
    };

    const handleUpdateUser = async (data: CreateUserRequest) => {
        if (!editingUser) return;
        const success = await updateUser(editingUser.id, data);
        if (success) {
            setEditingUser(null);
        }
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            const success = await deleteUser(userToDelete.id);
            if (success) {
                setUserToDelete(null);
            }
        }
    };

    const handleUpdateRoles = async (roleIds: number[]) => {
        if (showRoleModal) {
            const success = await updateUserRoles(showRoleModal.id, roleIds);
            if (success) {
                setShowRoleModal(null);
            }
        }
    };

    // Loading state
    if (isLoading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                        {t('users.title')}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{t('users.subtitle')}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="bg-card-bg border border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                        </svg>
                        {t('common.filter')}
                    </button>
                    <PermissionGate permission="users.create">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-gold text-darkest-bg px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors duration-200 flex items-center gap-2 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('users.createUser')}
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Permission Info (Demo) */}
            {isAdmin() && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-blue-400 font-medium">Информация о разрешениях</h3>
                            <p className="text-blue-300 text-sm mt-1">
                                Ваши роли: {userRoles.map(role => role.name).join(', ')}. 
                                Доступные действия: {hasPermission('users.create') ? 'создание' : ''} 
                                {hasPermission('users.edit') ? ', редактирование' : ''} 
                                {hasPermission('users.delete') ? ', удаление' : ''} пользователей.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500 mb-6">
                    {error}
                </div>
            )}

            {/* Users Grid */}
            {users.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('users.noUsers')}</h3>
                    <p className="text-gray-500 mb-6">{t('users.createFirst')}</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                    >
                        {t('users.createUser')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-card-bg rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-darkest-bg">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('users.name')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('users.phone')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('users.roles')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-darkest-bg/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {user.firstname} {user.lastname}
                                                    </div>
                                                    <div className="text-xs text-gray-400">ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300">{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.slice(0, 3).map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="px-2 py-1 text-xs font-medium rounded-full bg-gold/20 text-gold border border-gold/30"
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                                {user.roles.length > 3 && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-600/20 text-gray-400 border border-gray-600/30">
                                                        +{user.roles.length - 3} {t('common.more')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/dashboard/users/${user.id}`}
                                                    className="text-gold hover:text-gold/80 transition-colors"
                                                >
                                                    {t('common.viewDetails')}
                                                </Link>
                                                <PermissionGate permission="users.edit">
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        {t('common.edit')}
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="users.manage">
                                                    <button
                                                        onClick={() => setShowRoleModal(user)}
                                                        className="text-green-400 hover:text-green-300 transition-colors"
                                                    >
                                                        {t('users.manageRoles')}
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="users.delete">
                                                    <button
                                                        onClick={() => setUserToDelete(user)}
                                                        className="text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        {t('common.delete')}
                                                    </button>
                                                </PermissionGate>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-card-bg rounded-lg p-4 shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-medium text-white">
                                            {user.firstname} {user.lastname}
                                        </h3>
                                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                                        <p className="text-sm text-gray-300">{user.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm">{t('users.roles')}:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.roles.slice(0, 3).map((role) => (
                                            <span
                                                key={role.id}
                                                className="px-2 py-1 text-xs font-medium rounded-full bg-gold/20 text-gold border border-gold/30"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                        {user.roles.length > 3 && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-600/20 text-gray-400 border border-gray-600/30">
                                                +{user.roles.length - 3} {t('common.more')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Link
                                        to={`/dashboard/users/${user.id}`}
                                        className="flex-1 bg-gold text-darkest-bg px-3 py-2 rounded text-center text-sm font-medium hover:bg-gold/90 transition-colors"
                                    >
                                        {t('common.viewDetails')}
                                    </Link>
                                    <PermissionGate permission="users.edit">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            {t('common.edit')}
                                        </button>
                                    </PermissionGate>
                                    <PermissionGate permission="users.delete">
                                        <button
                                            onClick={() => setUserToDelete(user)}
                                            className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </PermissionGate>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.previous')}
                            </button>
                            <span className="px-4 py-2 text-gray-400">
                                {t('common.page')} {currentPage + 1} {t('common.of')} {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title={t('users.createUser')}
            >
                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setShowCreateForm(false)}
                />
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title={t('users.editUser')}
            >
                {editingUser && (
                    <UserForm
                        initialData={editingUser}
                        onSubmit={handleUpdateUser}
                        onCancel={() => setEditingUser(null)}
                    />
                )}
            </Modal>

            {/* Manage Roles Modal */}
            {showRoleModal && (
                <RoleManagementModal
                    user={showRoleModal}
                    availableRoles={roles}
                    onUpdateRoles={handleUpdateRoles}
                    onClose={() => setShowRoleModal(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                title={t('users.confirmDelete')}
            >
                {userToDelete && (
                    <div className="p-4">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">{t('common.warning')}</h3>
                        <p className="text-gray-300 text-center mb-8 leading-relaxed">
                            {t('users.deleteWarning', { name: `${userToDelete.firstname} ${userToDelete.lastname}` })}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title={t('common.filterOptions')}
            >
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('users.firstname')}
                            </label>
                            <input
                                type="text"
                                value={filterFirstName}
                                onChange={(e) => setFilterFirstName(e.target.value)}
                                className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                                placeholder={t('users.searchByFirstname')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('users.lastname')}
                            </label>
                            <input
                                type="text"
                                value={filterLastName}
                                onChange={(e) => setFilterLastName(e.target.value)}
                                className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                                placeholder={t('users.searchByLastname')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('users.phone')}
                        </label>
                        <input
                            type="text"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                            placeholder={t('users.searchByPhone')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('users.roles')}
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {roles.map((role) => (
                                <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterRoleIds.includes(role.id)}
                                        onChange={() => handleRoleFilterChange(role.id)}
                                        className="rounded border-gray-600 text-gold focus:ring-gold focus:ring-offset-0"
                                    />
                                    <span className="text-white">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('users.sortBy')}
                            </label>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                            >
                                <option value="">{t('common.none')}</option>
                                <option value="firstname">{t('users.firstname')}</option>
                                <option value="lastname">{t('users.lastname')}</option>
                                <option value="phone">{t('users.phone')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('users.sortDirection')}
                            </label>
                            <select
                                value={sortDirection}
                                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                                className="w-full px-4 py-3 bg-darkest-bg border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                            >
                                <option value="asc">{t('users.ascending')}</option>
                                <option value="desc">{t('users.descending')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                            disabled={isLoading}
                        >
                            {t('common.reset')}
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-3 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                            disabled={isLoading}
                        >
                            {t('common.apply')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersPage;

