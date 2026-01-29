import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import { useTeamStore } from '../../store/teamStore';
import type { 
    CreateSportClubRequest, 
    SportClubAddress, 
    UpdateSportClubRequest, 
    OpeningHours, 
    AgeCategory 
} from '../../types/sportClubs';
import type { FileType } from '../../types/files';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import TeamSelectionModal from '../tournaments/TeamSelectionModal';
import FileUpload from '../ui/FileUpload';
import { YandexMapPicker } from '../maps/YandexMapPicker';

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
                isPrimary: true,
                latitude: '',
                longitude: ''
            }
        ],
        openingHours: initialData?.openingHours || [
            {
                dayOfWeek: 'MONDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isClosed: false
            }
        ],
        ageCategories: initialData?.ageCategories || [
            {
                ageCategory: 'U6',
                isActive: true,
                maxParticipants: 20,
                categoryDescription: ''
            }
        ],
        contactEmail: initialData?.contactEmail || '',
        contactPhone: initialData?.contactPhone || '',
        website: initialData?.website || '',
        facilities: initialData?.facilities || '',
        membershipFee: initialData?.membershipFee || 0,
        membershipBenefits: initialData?.membershipBenefits || '',
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
    const [mapPickerState, setMapPickerState] = useState<{
        isOpen: boolean;
        addressIndex: number;
    }>({ isOpen: false, addressIndex: -1 });

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
        else if (name === 'sportTypeId' || name === 'establishmentYear') {
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
                    isPrimary: false,
                    latitude: '',
                    longitude: ''
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

    // Opening Hours handlers
    const handleOpeningHoursChange = (index: number, field: keyof OpeningHours, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            openingHours: prev.openingHours?.map((hours, i) => 
                i === index ? { ...hours, [field]: value } : hours
            ) || []
        }));
    };

    const addOpeningHours = () => {
        setFormData(prev => ({
            ...prev,
            openingHours: [
                ...(prev.openingHours || []),
                {
                    dayOfWeek: 'MONDAY' as const,
                    openTime: '09:00',
                    closeTime: '18:00',
                    isClosed: false
                }
            ]
        }));
    };

    const removeOpeningHours = (index: number) => {
        setFormData(prev => ({
            ...prev,
            openingHours: prev.openingHours?.filter((_, i) => i !== index) || []
        }));
    };

    // Age Categories handlers
    const handleAgeCategoryChange = (index: number, field: keyof AgeCategory, value: string | boolean | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            ageCategories: prev.ageCategories?.map((category, i) => 
                i === index ? { ...category, [field]: value } : category
            ) || []
        }));
    };

    const addAgeCategory = () => {
        setFormData(prev => ({
            ...prev,
            ageCategories: [
                ...(prev.ageCategories || []),
                {
                    ageCategory: 'U6' as const,
                    isActive: true,
                    maxParticipants: 20,
                    categoryDescription: ''
                }
            ]
        }));
    };

    const removeAgeCategory = (index: number) => {
        setFormData(prev => ({
            ...prev,
            ageCategories: prev.ageCategories?.filter((_, i) => i !== index) || []
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
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden bg-card-bg/20">
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
                {/* Section: Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Club Avatar */}
                    <div className="bg-darkest-bg/40 p-4 rounded-xl border border-gray-800/50">
                        <label className={`block font-medium mb-3 text-gold ${isRussian ? 'text-xs uppercase tracking-wider' : 'text-sm'}`}>
                            {t('sportClubs.clubAvatar')}
                        </label>
                        <FileUpload
                            type={'sport-club-avatar' as FileType}
                            objectId={(initialData as any)?.id || Date.now()}
                            accept="image/*"
                            maxSize={5}
                            onUploadComplete={(fileIds) => {
                                if (fileIds.length > 0) {
                                    setFormData(prev => ({
                                        ...prev,
                                        imageUrl: fileIds[0]
                                    }));
                                    showToast(t('sportClubs.avatarUploaded'), 'success');
                                }
                            }}
                            onUploadError={(error) => {
                                showToast(error, 'error');
                            }}
                            className="h-32 rounded-lg border-2 border-dashed border-gray-700 hover:border-gold/50 transition-colors"
                        >
                            <div className="text-center">
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xs text-gray-500">
                                    {t('sportClubs.uploadAvatar')}
                                </p>
                            </div>
                        </FileUpload>
                    </div>

                    {/* Hero Image */}
                    <div className="bg-darkest-bg/40 p-4 rounded-xl border border-gray-800/50">
                        <label className={`block font-medium mb-3 text-gold ${isRussian ? 'text-xs uppercase tracking-wider' : 'text-sm'}`}>
                            {t('sportClubs.heroImage')}
                        </label>
                        <FileUpload
                            type={'sport-club-hero' as FileType}
                            objectId={(initialData as any)?.id || Date.now()}
                            accept="image/*"
                            maxSize={10}
                            onUploadComplete={(fileIds) => {
                                if (fileIds.length > 0) {
                                    setFormData(prev => ({
                                        ...prev,
                                        heroId: fileIds[0]
                                    }));
                                    showToast(t('sportClubs.heroUploaded'), 'success');
                                }
                            }}
                            onUploadError={(error) => {
                                showToast(error, 'error');
                            }}
                            className="h-32 rounded-lg border-2 border-dashed border-gray-700 hover:border-gold/50 transition-colors"
                        >
                            <div className="text-center">
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-gray-500">
                                    {t('sportClubs.uploadHero')}
                                </p>
                            </div>
                        </FileUpload>
                    </div>
                </div>

                {/* Section: Basic Information */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                        <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                        {t('sportClubs.basicInfo')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <div className="lg:col-span-2 xl:col-span-2">
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="name">
                                {t('sportClubs.name')} *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-darkest-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all
                                    ${errors.name ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-gold'}`}
                                placeholder={t('sportClubs.namePlaceholder')}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="clubType">
                                {t('sportClubs.clubType')} *
                            </label>
                            <select
                                id="clubType"
                                name="clubType"
                                value={formData.clubType}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                            >
                                {clubTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lg:col-span-2 xl:col-span-2">
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="description">
                                {t('sportClubs.description')}
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                                placeholder={t('sportClubs.descriptionPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="sportTypeId">
                                {t('sportTypes.sportType')} *
                            </label>
                            <select
                                id="sportTypeId"
                                name="sportTypeId"
                                value={formData.sportTypeId || ''}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-darkest-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all
                                    ${errors.sportTypeId ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-gold'}`}
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
                            {errors.sportTypeId && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.sportTypeId}</p>}
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="establishmentYear">
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
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                            />
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="membershipFee">
                                {t('sportClubs.membershipFee')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₸</span>
                                <input
                                    type="number"
                                    id="membershipFee"
                                    name="membershipFee"
                                    value={formData.membershipFee}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {isEdit && (
                            <div className="flex items-center pt-8">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        name="active"
                                        checked={(formData as any).active || false}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                    <span className={`ml-3 font-medium text-gray-300 ${isRussian ? 'text-xs' : 'text-sm'}`}>
                                        {t('sportClubs.active')}
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Age Categories */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                            {t('sportClubs.ageCategories')}
                        </h3>
                        <button
                            type="button"
                            onClick={addAgeCategory}
                            className="bg-gold/10 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-gold/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('sportClubs.addAgeCategory')}
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 bg-gold/5 p-3 rounded-lg border border-gold/10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline mr-2 text-gold">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        {t('sportClubs.ageCategoriesHint') || 'Вы можете добавить несколько возрастных групп (U6, U8, U10 и т.д.) в одну секцию'}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                        {formData.ageCategories?.map((category, index) => (
                            <div key={index} className="bg-card-bg/40 border border-gray-800 rounded-xl p-5 space-y-4 relative group hover:border-gray-700 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold text-gold uppercase tracking-wider">{t('sportClubs.ageCategory')} {index + 1}</h5>
                                    {formData.ageCategories && formData.ageCategories.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAgeCategory(index)}
                                            className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-500/10 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.ageCategoryType')}
                                        </label>
                                        <select
                                            value={category.ageCategory}
                                            onChange={(e) => handleAgeCategoryChange(index, 'ageCategory', e.target.value as AgeCategory['ageCategory'])}
                                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-lg text-sm focus:border-gold focus:outline-none transition-all"
                                        >
                                            <option value="U6">U6</option>
                                            <option value="U8">U8</option>
                                            <option value="U10">U10</option>
                                            <option value="U12">U12</option>
                                            <option value="U15">U15</option>
                                            <option value="U18">U18</option>
                                            <option value="U20">U20</option>
                                            <option value="U23">U23</option>
                                            <option value="SENIOR">SENIOR</option>
                                            <option value="MASTERS">MASTERS</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.maxParticipants')}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={category.maxParticipants ?? ''}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                const parsed = rawValue === '' ? undefined : Number.parseInt(rawValue, 10);
                                                handleAgeCategoryChange(index, 'maxParticipants', Number.isNaN(parsed as number) ? undefined : parsed);
                                            }}
                                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-lg text-sm focus:border-gold focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        {t('sportClubs.categoryDescription')}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={category.categoryDescription || ''}
                                        onChange={(e) => handleAgeCategoryChange(index, 'categoryDescription', e.target.value)}
                                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-lg text-sm focus:border-gold focus:outline-none transition-all resize-none"
                                        placeholder={t('sportClubs.categoryDescriptionPlaceholder')}
                                    />
                                </div>

                                <div className="flex items-center pt-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={category.isActive}
                                            onChange={(e) => handleAgeCategoryChange(index, 'isActive', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                                        <span className="ml-2 text-xs font-medium text-gray-400">
                                            {t('sportClubs.categoryActive')}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Contact Information */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                        <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                        {t('sportClubs.contactInfo')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="contactEmail">
                                {t('sportClubs.contactEmail')}
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-darkest-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all
                                    ${errors.contactEmail ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-gold'}`}
                                placeholder="example@email.com"
                            />
                            {errors.contactEmail && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.contactEmail}</p>}
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="contactPhone">
                                {t('sportClubs.contactPhone')}
                            </label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                placeholder="+7 (999) 123-45-67"
                            />
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="website">
                                {t('sportClubs.website')}
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Addresses */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                            {t('sportClubs.addresses')}
                        </h3>
                        <button
                            type="button"
                            onClick={addAddress}
                            className="bg-gold/10 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-gold/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('sportClubs.addAddress')}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.addresses.map((address, index) => (
                            <div key={index} className="bg-card-bg/40 border border-gray-800 rounded-xl p-5 space-y-5 hover:border-gray-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-bold text-gold uppercase tracking-wider">
                                            {t('sportClubs.address')} {index + 1}
                                        </h4>
                                        {address.isPrimary && (
                                            <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full border border-gold/30 font-bold uppercase tracking-tight">
                                                {t('sportClubs.primary')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!address.isPrimary && (
                                            <button
                                                type="button"
                                                onClick={() => setPrimaryAddress(index)}
                                                className="text-xs text-gold/70 hover:text-gold transition-colors font-medium underline underline-offset-4 decoration-gold/30"
                                            >
                                                {t('sportClubs.setPrimary')}
                                            </button>
                                        )}
                                        {formData.addresses.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAddress(index)}
                                                className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-500/10 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    <div className="lg:col-span-2 xl:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.streetLine1')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={address.streetLine1}
                                            onChange={(e) => handleAddressChange(index, 'streetLine1', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-darkest-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm transition-all
                                                ${errors[`address_${index}_streetLine1`] ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-gold'}`}
                                            placeholder={t('sportClubs.streetLine1Placeholder')}
                                        />
                                        {errors[`address_${index}_streetLine1`] && (
                                            <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors[`address_${index}_streetLine1`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('cities.city')} *
                                        </label>
                                        <select
                                            value={address.cityId || ''}
                                            onChange={(e) => handleAddressChange(index, 'cityId', parseInt(e.target.value) || 0)}
                                            className={`w-full px-4 py-2.5 bg-darkest-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm transition-all
                                                ${errors[`address_${index}_cityId`] ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-gold'}`}
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
                                            <p className="text-red-500 text-[10px] mt-1.5 ml-1">{errors[`address_${index}_cityId`]}</p>
                                        )}
                                    </div>

                                    <div className="lg:col-span-2 xl:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.streetLine2')}
                                        </label>
                                        <input
                                            type="text"
                                            value={address.streetLine2}
                                            onChange={(e) => handleAddressChange(index, 'streetLine2', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold text-sm transition-all"
                                            placeholder={t('sportClubs.streetLine2Placeholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.zipCode')}
                                        </label>
                                        <input
                                            type="text"
                                            value={address.zipCode}
                                            onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold text-sm transition-all"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-center gap-6 pt-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.addressDescription')}
                                        </label>
                                        <input
                                            type="text"
                                            value={address.description}
                                            onChange={(e) => handleAddressChange(index, 'description', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold text-sm transition-all"
                                            placeholder={t('sportClubs.addressDescriptionPlaceholder')}
                                        />
                                    </div>

                                    <div className="lg:w-1/3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {t('sportClubs.location')}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerState({ isOpen: true, addressIndex: index })}
                                                className="bg-gold text-darkest-bg px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-all duration-200 flex items-center gap-2 text-xs font-bold"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                </svg>
                                                {t('sportClubs.selectOnMap')}
                                            </button>
                                            {(address.latitude || address.longitude) && (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 leading-tight">{t('sportClubs.coordinates')}</span>
                                                    <span className="text-[10px] text-white font-mono leading-tight">{address.latitude.slice(0, 7)}, {address.longitude.slice(0, 7)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Opening Hours */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                            {t('sportClubs.openingHours')}
                        </h3>
                        <button
                            type="button"
                            onClick={addOpeningHours}
                            className="bg-gold/10 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-gold/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('sportClubs.addOpeningHours')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {formData.openingHours?.map((hours, index) => (
                            <div key={index} className="bg-card-bg/40 border border-gray-800 rounded-xl p-4 space-y-4 relative group hover:border-gray-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-gold uppercase tracking-wider">{t('sportClubs.day')} {index + 1}</h5>
                                    {formData.openingHours && formData.openingHours.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOpeningHours(index)}
                                            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-500/10 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <select
                                        value={hours.dayOfWeek}
                                        onChange={(e) => handleOpeningHoursChange(index, 'dayOfWeek', e.target.value as OpeningHours['dayOfWeek'])}
                                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-lg text-xs focus:border-gold focus:outline-none transition-all font-medium"
                                    >
                                        <option value="MONDAY">{t('common.days.monday')}</option>
                                        <option value="TUESDAY">{t('common.days.tuesday')}</option>
                                        <option value="WEDNESDAY">{t('common.days.wednesday')}</option>
                                        <option value="THURSDAY">{t('common.days.thursday')}</option>
                                        <option value="FRIDAY">{t('common.days.friday')}</option>
                                        <option value="SATURDAY">{t('common.days.saturday')}</option>
                                        <option value="SUNDAY">{t('common.days.sunday')}</option>
                                    </select>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tight block whitespace-nowrap">{t('sportClubs.openTime')}</label>
                                            <input
                                                type="time"
                                                value={hours.openTime}
                                                onChange={(e) => handleOpeningHoursChange(index, 'openTime', e.target.value)}
                                                disabled={hours.isClosed}
                                                className="w-full px-2 py-1.5 bg-darkest-bg border border-gray-700 rounded-lg text-xs text-white focus:border-gold disabled:opacity-30 transition-all"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tight block whitespace-nowrap">{t('sportClubs.closeTime')}</label>
                                            <input
                                                type="time"
                                                value={hours.closeTime}
                                                onChange={(e) => handleOpeningHoursChange(index, 'closeTime', e.target.value)}
                                                disabled={hours.isClosed}
                                                className="w-full px-2 py-1.5 bg-darkest-bg border border-gray-700 rounded-lg text-xs text-white focus:border-gold disabled:opacity-30 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center pt-1">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hours.isClosed}
                                                onChange={(e) => handleOpeningHoursChange(index, 'isClosed', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-500/50"></div>
                                            <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                {t('sportClubs.closed')}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Additional Information */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
                        <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                        {t('sportClubs.additionalInfo')}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="facilities">
                                {t('sportClubs.facilities')}
                            </label>
                            <textarea
                                id="facilities"
                                name="facilities"
                                value={formData.facilities}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none text-sm"
                                placeholder={t('sportClubs.facilitiesPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className={`block font-medium mb-1.5 text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="membershipBenefits">
                                {t('sportClubs.membershipBenefits')}
                            </label>
                            <textarea
                                id="membershipBenefits"
                                name="membershipBenefits"
                                value={formData.membershipBenefits}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-darkest-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none text-sm"
                                placeholder={t('sportClubs.membershipBenefitsPlaceholder')}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Teams */}
                <div className="bg-darkest-bg/40 p-5 rounded-xl border border-gray-800/50 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                            {t('sportClubs.teams')}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowTeamSelector(true)}
                            className="bg-gold text-darkest-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold/90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m2-2.412a4.488 4.488 0 00-2-3.588m6 3.588a4.488 4.488 0 012-3.588M12 11a3 3 0 100-6 3 3 0 000 6zm6.75 1a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 13.5a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0z" />
                            </svg>
                            {t('sportClubs.selectTeams')}
                        </button>
                    </div>

                    {selectedTeams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {selectedTeams.map((team) => (
                                <div key={team.id} className="bg-card-bg/60 border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gold/30 transition-all">
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-white text-sm leading-tight">{team.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-tight">
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
                                        className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center border-2 border-dashed border-gray-800 rounded-xl">
                            <p className="text-gray-500 text-sm">{t('sportClubs.noTeamsSelected') || 'Команды не выбраны'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Form Actions */}
            <div className="p-4 lg:p-6 bg-darkest-bg/80 backdrop-blur-md border-t border-gray-800 flex justify-end gap-4 shadow-2xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-gray-800 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-all font-bold text-sm border border-gray-700"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-2.5 bg-gradient-to-r from-gold to-yellow-500 text-darkest-bg font-bold rounded-lg hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                >
                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.saving')}
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.save')}
                        </>
                    )}
                </button>
            </div>

            {/* Map Picker Modal */}
            <YandexMapPicker
                isOpen={mapPickerState.isOpen}
                onClose={() => setMapPickerState({ isOpen: false, addressIndex: -1 })}
                onLocationSelect={(lat: number, lng: number) => {
                    if (mapPickerState.addressIndex >= 0) {
                        handleAddressChange(mapPickerState.addressIndex, 'latitude', lat.toString());
                        handleAddressChange(mapPickerState.addressIndex, 'longitude', lng.toString());
                    }
                    setMapPickerState({ isOpen: false, addressIndex: -1 });
                }}
                initialLat={
                    mapPickerState.addressIndex >= 0 && formData.addresses[mapPickerState.addressIndex]?.latitude
                        ? parseFloat(formData.addresses[mapPickerState.addressIndex].latitude!) 
                        : 51.1694
                }
                initialLng={
                    mapPickerState.addressIndex >= 0 && formData.addresses[mapPickerState.addressIndex]?.longitude
                        ? parseFloat(formData.addresses[mapPickerState.addressIndex].longitude!) 
                        : 71.4491
                }
            />

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
