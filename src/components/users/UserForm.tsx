import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import type { CreateUserRequest, User } from '../../types/users';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { useFormValidation, userValidators } from '../../utils/validation';

interface UserFormProps {
    initialData?: User;
    onSubmit: (data: CreateUserRequest) => Promise<void>;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { roles, fetchRoles } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserRequest>({
        firstname: initialData?.firstname || '',
        lastname: initialData?.lastname || '',
        phone: initialData?.phone || '',
        password: '',
        roleIds: initialData?.roles?.map(role => role.id) || []
    });

    const { 
        errors, 
        validateForm, 
        clearFieldError 
    } = useFormValidation(initialData ? userValidators.update : userValidators.create);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            clearFieldError(name as keyof CreateUserRequest);
        }
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            roleIds: checked 
                ? [...prev.roleIds, roleId]
                : prev.roleIds.filter(id => id !== roleId)
        }));
        
        // Clear roles error when selection changes
        if (errors.roleIds) {
            clearFieldError('roleIds');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // For updates, if password is empty, use the current form data for validation
        // but exclude password from API call if it's empty
        if (!validateForm(formData)) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            showToast(
                initialData ? 'User updated successfully!' : 'User created successfully!', 
                'success'
            );
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic Information */}
            <div className="bg-darkest-bg p-4 rounded-md">
                <h3 className="text-gold font-medium mb-4">{t('users.basicInfo')}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="firstname">
                            {t('users.firstname')} *
                        </label>
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 bg-card-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors ${
                                errors.firstname ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder={t('users.firstnamePlaceholder')}
                        />
                        {errors.firstname && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="lastname">
                            {t('users.lastname')} *
                        </label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 bg-card-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors ${
                                errors.lastname ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder={t('users.lastnamePlaceholder')}
                        />
                        {errors.lastname && (
                            <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="phone">
                        {t('users.phone')} *
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-card-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors ${
                            errors.phone ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder={t('users.phonePlaceholder')}
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        {t('users.password')} {!initialData && '*'}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-card-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors ${
                            errors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder={initialData ? t('users.passwordOptional') : t('users.passwordPlaceholder')}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                    {initialData && (
                        <p className="text-gray-400 text-xs mt-1">{t('users.passwordHint')}</p>
                    )}
                </div>
            </div>

            {/* Roles */}
            <div className="bg-darkest-bg p-4 rounded-md">
                <h3 className="text-gold font-medium mb-4">{t('users.roles')} *</h3>
                
                <div className="space-y-2">
                    {roles.map((role) => (
                        <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.roleIds.includes(role.id)}
                                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                className="rounded border-gray-600 text-gold focus:ring-gold focus:ring-offset-0"
                            />
                            <span className="text-white">{role.name}</span>
                        </label>
                    ))}
                </div>
                
                {errors.roleIds && (
                    <p className="text-red-500 text-xs mt-2">{errors.roleIds}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                    disabled={isLoading}
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.saving')}
                        </>
                    ) : (
                        t(initialData ? 'common.update' : 'common.create')
                    )}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
