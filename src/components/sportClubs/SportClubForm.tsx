import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import { useTeamStore } from '../../store/teamStore';
import type { CreateSportClubRequest, SportClubAddress, UpdateSportClubRequest } from '../../types/sportClubs';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import TeamSelectionModal from '../tournaments/TeamSelectionModal';

interface SportClubFormProps {
    initialData?: Partial<CreateSportClubRequest | UpdateSportClubRequest>;
    onSubmit: (data: CreateSportClubRequest | UpdateSportClubRequest) => Promise<void>;
    onCancel: () => void;
    isEdit?: boolean;
}

const SportClubForm: React.FC<SportClubFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEdit = false
}) => {
    const { t, i18n } = useTranslation();
    const { cities, fetchCities } = useCityStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();
    const { teams, fetchTeams } = useTeamStore();

    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

    const [formData, setFormData] = useState<CreateSportClubRequest & { active?: boolean }>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        clubType: initialData?.clubType || 'REGULAR',
        addresses: initialData?.addresses || [
            {
                streetLine1: '',
                streetLine2: '',
                cityId: 0,
                zipCode: '',
                description: '',
                isPrimary: true
            }
        ],
        minAge: initialData?.minAge || 5,
        maxAge: initialData?.maxAge || 65,
        contactEmail: initialData?.contactEmail || '',
        contactPhone: initialData?.contactPhone || '',
        website: initialData?.website || '',
        facilities: initialData?.facilities || '',
        membershipFee: initialData?.membershipFee || 0,
        membershipBenefits: initialData?.membershipBenefits || '',
        operatingHours: initialData?.operatingHours || '',
        sportTypeId: initialData?.sportTypeId || 0,
        establishmentYear: initialData?.establishmentYear || new Date().getFullYear(),
        teams: initialData?.teams || [],
        ...(isEdit && { active: (initialData as any)?.active ?? true }) // Добавляем active только для режима редактирования
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingSportTypes, setIsLoadingSportTypes] = useState(false);
    const [showTeamSelector, setShowTeamSelector] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState<(typeof teams[0])[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load dependencies
    useEffect(() => {
        const loadData = async () => {
            fetchTeams();

            setIsLoadingCities(true);
            try {
                await fetchCities();
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setIsLoadingCities(false);
            }

            setIsLoadingSportTypes(true);
            try {
                await fetchSportTypes();
            } catch (error) {
                console.error('Failed to load sport types:', error);
            } finally {
                setIsLoadingSportTypes(false);
            }
        };

        loadData();
    }, [fetchTeams, fetchCities, fetchSportTypes]);

    // Update selected teams when form data changes
    useEffect(() => {
        if (teams.length > 0 && formData.teams && formData.teams.length > 0) {
            const selected = teams.filter(t => formData.teams!.includes(t.id));
            setSelectedTeams(selected);
        } else {
            setSelectedTeams([]);
        }
    }, [teams, formData.teams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Handle boolean fields (checkbox)
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        }
        // Handle numeric fields
        else if (name === 'minAge' || name === 'maxAge' || name === 'sportTypeId' || name === 'establishmentYear') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : parseInt(value)
            }));
        } else if (name === 'membershipFee') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : parseFloat(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddressChange = (index: number, field: keyof SportClubAddress, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.map((addr, i) => 
                i === index ? { ...addr, [field]: value } : addr
            )
        }));
    };

    const addAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [
                ...prev.addresses,
                {
                    streetLine1: '',
                    streetLine2: '',
                    cityId: 0,
                    zipCode: '',
                    description: '',
                    isPrimary: false
                }
            ]
        }));
    };

    const removeAddress = (index: number) => {
        if (formData.addresses.length > 1) {
            setFormData(prev => ({
                ...prev,
                addresses: prev.addresses.filter((_, i) => i !== index)
            }));
        }
    };

    const setPrimaryAddress = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.map((addr, i) => ({
                ...addr,
                isPrimary: i === index
            }))
        }));
    };

    const handleTeamSelection = (selectedTeamIds: number[]) => {
        setFormData(prev => ({
            ...prev,
            teams: selectedTeamIds
        }));
        setShowTeamSelector(false);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = t('sportClubs.nameRequired');
        }

        if (!formData.sportTypeId) {
            newErrors.sportTypeId = t('sportClubs.sportTypeRequired');
        }

        if (formData.minAge < 0) {
            newErrors.minAge = t('sportClubs.minAgeInvalid');
        }

        if (formData.maxAge < formData.minAge) {
            newErrors.maxAge = t('sportClubs.maxAgeInvalid');
        }

        if (formData.addresses.length === 0) {
            newErrors.addresses = t('sportClubs.addressRequired');
        } else {
            formData.addresses.forEach((addr, index) => {
                if (!addr.streetLine1?.trim()) {
                    newErrors[`address_${index}_streetLine1`] = t('sportClubs.streetRequired');
                }
                if (!addr.cityId) {
                    newErrors[`address_${index}_cityId`] = t('sportClubs.cityRequired');
                }
            });
        }

        if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = t('sportClubs.emailInvalid');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const clubTypeOptions = [
        { value: 'KIDS', label: t('sportClubs.clubTypes.kids') },
        { value: 'REGULAR', label: t('sportClubs.clubTypes.regular') },
        { value: 'PROFESSIONAL', label: t('sportClubs.clubTypes.professional') },
        { value: 'MIXED', label: t('sportClubs.clubTypes.mixed') }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    {t('sportClubs.basicInfo')}
                </h3>

                {/* Name */}
                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="name">
                        {t('sportClubs.name')} *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                            ${errors.name ? 'border-red-500' : 'border-gray-700'}`}
                        placeholder={t('sportClubs.namePlaceholder')}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="description">
                        {t('sportClubs.description')}
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                        placeholder={t('sportClubs.descriptionPlaceholder')}
                    />
                </div>

                {/* Club Type and Sport Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="clubType">
                            {t('sportClubs.clubType')} *
                        </label>
                        <select
                            id="clubType"
                            name="clubType"
                            value={formData.clubType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            {clubTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="sportTypeId">
                            {t('sportTypes.sportType')} *
                        </label>
                        <select
                            id="sportTypeId"
                            name="sportTypeId"
                            value={formData.sportTypeId || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                                ${errors.sportTypeId ? 'border-red-500' : 'border-gray-700'}`}
                            disabled={isLoadingSportTypes}
                        >
                            <option value="">
                                {isLoadingSportTypes ? t('common.loading') : t('sportTypes.selectSportType')}
                            </option>
                            {sportTypes.map((sportType) => (
                                <option key={sportType.id} value={sportType.id}>
                                    {sportType.name}
                                </option>
                            ))}
                        </select>
                        {errors.sportTypeId && <p className="text-red-500 text-xs mt-1">{errors.sportTypeId}</p>}
                    </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="minAge">
                            {t('sportClubs.minAge')} *
                        </label>
                        <input
                            type="number"
                            id="minAge"
                            name="minAge"
                            value={formData.minAge}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                                ${errors.minAge ? 'border-red-500' : 'border-gray-700'}`}
                        />
                        {errors.minAge && <p className="text-red-500 text-xs mt-1">{errors.minAge}</p>}
                    </div>

                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="maxAge">
                            {t('sportClubs.maxAge')} *
                        </label>
                        <input
                            type="number"
                            id="maxAge"
                            name="maxAge"
                            value={formData.maxAge}
                            onChange={handleChange}
                            min={formData.minAge}
                            max="100"
                            className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                                ${errors.maxAge ? 'border-red-500' : 'border-gray-700'}`}
                        />
                        {errors.maxAge && <p className="text-red-500 text-xs mt-1">{errors.maxAge}</p>}
                    </div>
                </div>

                {/* Establishment Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="establishmentYear">
                            {t('sportClubs.establishmentYear')}
                        </label>
                        <input
                            type="number"
                            id="establishmentYear"
                            name="establishmentYear"
                            value={formData.establishmentYear}
                            onChange={handleChange}
                            min="1800"
                            max={new Date().getFullYear()}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                    </div>

                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="membershipFee">
                            {t('sportClubs.membershipFee')}
                        </label>
                        <input
                            type="number"
                            id="membershipFee"
                            name="membershipFee"
                            value={formData.membershipFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    {t('sportClubs.contactInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="contactEmail">
                            {t('sportClubs.contactEmail')}
                        </label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                                ${errors.contactEmail ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="example@email.com"
                        />
                        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                        <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="contactPhone">
                            {t('sportClubs.contactPhone')}
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>
                </div>

                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="website">
                        {t('sportClubs.website')}
                    </label>
                    <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    {t('sportClubs.addresses')}
                </h3>

                {formData.addresses.map((address, index) => (
                    <div key={index} className="bg-card-bg p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">
                                {t('sportClubs.address')} {index + 1}
                                {address.isPrimary && (
                                    <span className="ml-2 text-xs bg-gold text-darkest-bg px-2 py-1 rounded">
                                        {t('sportClubs.primary')}
                                    </span>
                                )}
                            </h4>
                            <div className="flex gap-2">
                                {!address.isPrimary && (
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryAddress(index)}
                                        className="text-xs text-gold hover:underline"
                                    >
                                        {t('sportClubs.setPrimary')}
                                    </button>
                                )}
                                {formData.addresses.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAddress(index)}
                                        className="text-xs text-red-400 hover:underline"
                                    >
                                        {t('common.delete')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    {t('sportClubs.streetLine1')} *
                                </label>
                                <input
                                    type="text"
                                    value={address.streetLine1}
                                    onChange={(e) => handleAddressChange(index, 'streetLine1', e.target.value)}
                                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm
                                        ${errors[`address_${index}_streetLine1`] ? 'border-red-500' : 'border-gray-700'}`}
                                    placeholder={t('sportClubs.streetLine1Placeholder')}
                                />
                                {errors[`address_${index}_streetLine1`] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_streetLine1`]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    {t('sportClubs.streetLine2')}
                                </label>
                                <input
                                    type="text"
                                    value={address.streetLine2}
                                    onChange={(e) => handleAddressChange(index, 'streetLine2', e.target.value)}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                                    placeholder={t('sportClubs.streetLine2Placeholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    {t('cities.city')} *
                                </label>
                                <select
                                    value={address.cityId || ''}
                                    onChange={(e) => handleAddressChange(index, 'cityId', parseInt(e.target.value) || 0)}
                                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm
                                        ${errors[`address_${index}_cityId`] ? 'border-red-500' : 'border-gray-700'}`}
                                    disabled={isLoadingCities}
                                >
                                    <option value="">
                                        {isLoadingCities ? t('common.loading') : t('cities.selectCity')}
                                    </option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                                {errors[`address_${index}_cityId`] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_cityId`]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    {t('sportClubs.zipCode')}
                                </label>
                                <input
                                    type="text"
                                    value={address.zipCode}
                                    onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                                    placeholder="123456"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                {t('sportClubs.addressDescription')}
                            </label>
                            <input
                                type="text"
                                value={address.description}
                                onChange={(e) => handleAddressChange(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                                placeholder={t('sportClubs.addressDescriptionPlaceholder')}
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addAddress}
                    className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm"
                >
                    + {t('sportClubs.addAddress')}
                </button>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    {t('sportClubs.additionalInfo')}
                </h3>

                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="facilities">
                        {t('sportClubs.facilities')}
                    </label>
                    <textarea
                        id="facilities"
                        name="facilities"
                        value={formData.facilities}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                        placeholder={t('sportClubs.facilitiesPlaceholder')}
                    />
                </div>

                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="membershipBenefits">
                        {t('sportClubs.membershipBenefits')}
                    </label>
                    <textarea
                        id="membershipBenefits"
                        name="membershipBenefits"
                        value={formData.membershipBenefits}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                        placeholder={t('sportClubs.membershipBenefitsPlaceholder')}
                    />
                </div>

                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="operatingHours">
                        {t('sportClubs.operatingHours')}
                    </label>
                    <input
                        type="text"
                        id="operatingHours"
                        name="operatingHours"
                        value={formData.operatingHours}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        placeholder={t('sportClubs.operatingHoursPlaceholder')}
                    />
                </div>

                {/* Active status - only for edit mode */}
                {isEdit && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={(formData as any).active || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                        />
                        <label className={`ml-2 font-medium ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="active">
                            {t('sportClubs.active')}
                        </label>
                    </div>
                )}
            </div>

            {/* Teams */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2 flex-1">
                        {t('sportClubs.teams')}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowTeamSelector(true)}
                        className="ml-4 bg-gold text-darkest-bg px-3 py-1 rounded text-sm font-medium hover:bg-gold/90 transition-colors"
                    >
                        {t('sportClubs.selectTeams')}
                    </button>
                </div>

                {selectedTeams.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedTeams.map((team) => (
                            <div key={team.id} className="bg-card-bg p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-white text-sm">{team.name}</h4>
                                        <p className="text-xs text-gray-400">
                                            {team.players?.length || 0} {t('teams.players').toLowerCase()}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                teams: prev.teams?.filter(id => id !== team.id) || []
                                            }));
                                        }}
                                        className="text-red-400 hover:text-red-300 text-xs"
                                    >
                                        {t('common.remove')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-700/50 pt-6 mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 bg-darkest-bg text-gray-300 hover:text-white border border-gray-700 rounded-md hover:bg-card-bg transition-all duration-300"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold/90 text-darkest-bg font-medium rounded-md hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 flex items-center relative overflow-hidden group"
                >
                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    {isLoading ? (
                        <span className="flex items-center relative">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.saving')}
                        </span>
                    ) : (
                        <span className="flex items-center relative">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.save')}
                        </span>
                    )}
                </button>
            </div>

            {/* Team Selection Modal */}
            <TeamSelectionModal
                isOpen={showTeamSelector}
                onClose={() => setShowTeamSelector(false)}
                onSelect={handleTeamSelection}
                currentSelectedIds={formData.teams || []}
                title={t('sportClubs.selectTeams')}
            />
        </form>
    );
};

export default React.memo(SportClubForm);
