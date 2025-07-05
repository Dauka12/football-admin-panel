import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsStore } from '../../store/newsStore';
import type { NewsFormData, NewsCategory, NewsStatus } from '../../types/news';
import { toast } from '../../utils/toast';

interface NewsFormProps {
    newsId?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const NEWS_CATEGORIES: NewsCategory[] = [
    'GENERAL_SPORTS',
    'FOOTBALL',
    'BASKETBALL',
    'TENNIS',
    'BASEBALL',
    'HOCKEY',
    'OLYMPICS',
    'LOCAL_SPORTS',
    'INTERNATIONAL',
    'TRANSFERS',
    'MATCH_RESULTS',
    'PLAYER_NEWS',
    'TEAM_NEWS',
    'TOURNAMENT_NEWS',
    'EQUIPMENT_REVIEW',
    'HEALTH_FITNESS',
    'COACHING_TIPS',
    'YOUTH_SPORTS',
    'WOMEN_SPORTS',
    'ESPORTS'
];

const NEWS_STATUSES: NewsStatus[] = [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
];

export const NewsForm: React.FC<NewsFormProps> = ({ newsId, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { selectedNews, fetchNewsById, createNews, updateNews, loading, validateSlug } = useNewsStore();
    const [formData, setFormData] = useState<NewsFormData>({
        title: '',
        summary: '',
        content: '',
        tags: [],
        category: 'GENERAL_SPORTS',
        status: 'DRAFT',
        isFeatured: false,
        isBreaking: false,
        metaTitle: '',
        metaDescription: '',
        slug: '',
        active: true,
        images: []
    });
    const [tagInput, setTagInput] = useState('');
    const [slugValid, setSlugValid] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (newsId) {
            fetchNewsById(newsId);
        }
    }, [newsId, fetchNewsById]);

    useEffect(() => {
        if (selectedNews && newsId) {
            setFormData({
                title: selectedNews.title || '',
                summary: selectedNews.summary || '',
                content: selectedNews.content || '',
                tags: selectedNews.tags || [],
                category: selectedNews.category || 'GENERAL_SPORTS',
                status: selectedNews.status || 'DRAFT',
                isFeatured: selectedNews.isFeatured || false,
                isBreaking: selectedNews.isBreaking || false,
                metaTitle: selectedNews.metaTitle || '',
                metaDescription: selectedNews.metaDescription || '',
                slug: selectedNews.slug || '',
                active: selectedNews.active ?? true,
                images: selectedNews.images || []
            });
        }
    }, [selectedNews, newsId]);

    useEffect(() => {
        if (formData.title && !formData.slug) {
            const generatedSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title, formData.slug]);

    useEffect(() => {
        if (formData.title && !formData.metaTitle) {
            setFormData(prev => ({ ...prev, metaTitle: formData.title }));
        }
    }, [formData.title, formData.metaTitle]);

    useEffect(() => {
        if (formData.summary && !formData.metaDescription) {
            setFormData(prev => ({ ...prev, metaDescription: formData.summary }));
        }
    }, [formData.summary, formData.metaDescription]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const slug = e.target.value;
        setFormData(prev => ({ ...prev, slug }));
        
        if (slug) {
            const isValid = await validateSlug(slug, newsId || undefined);
            setSlugValid(isValid);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim() || !formData.slug.trim()) {
            toast.error(t('news.errors.requiredFields'));
            return;
        }

        if (slugValid) {
            toast.error(t('news.errors.slugNotUnique'));
            return;
        }

        setIsSubmitting(true);
        try {
            if (newsId) {
                await updateNews(newsId, formData);
            } else {
                await createNews(formData);
            }
            onSuccess();
        } catch (error) {
            toast.error(newsId ? t('news.errors.updateFailed') : t('news.errors.createFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.newsTitle')} *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        required
                    />
                </div>

                {/* Summary */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.newsExcerpt')} *
                    </label>
                    <textarea
                        name="summary"
                        value={formData.summary}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        required
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.newsContent')} *
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={10}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.newsSlug')} *
                    </label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white ${
                            !slugValid ? 'border-red-500' : 'border-gray-700'
                        }`}
                        required
                    />
                    {!slugValid && (
                        <p className="mt-1 text-sm text-red-400">{t('news.slugUnavailable')}</p>
                    )}
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            {t('news.newsCategory')} *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                            required
                        >
                            {NEWS_CATEGORIES.map(category => (
                                <option key={category} value={category} className="bg-darkest-bg text-white">
                                    {category.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            {t('news.newsStatus')} *
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                            required
                        >
                            {NEWS_STATUSES.map(status => (
                                <option key={status} value={status} className="bg-darkest-bg text-white">
                                    {t(`news.status.${status.toLowerCase()}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.newsTags')}
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder={t('news.enterTag')}
                            className="flex-1 px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white placeholder-gray-400"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200"
                        >
                            {t('news.addTag')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-card-bg text-gray-300 border border-gray-700"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Meta Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.metaTitle')}
                    </label>
                    <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                    />
                </div>

                {/* Meta Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('news.metaDescription')}
                    </label>
                    <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                    />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleInputChange}
                            className="mr-2 w-4 h-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                        />
                        <label htmlFor="isFeatured" className="text-sm text-gray-300">
                            {t('news.featured')}
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isBreaking"
                            name="isBreaking"
                            checked={formData.isBreaking}
                            onChange={handleInputChange}
                            className="mr-2 w-4 h-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                        />
                        <label htmlFor="isBreaking" className="text-sm text-gray-300">
                            {t('news.breaking')}
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={handleInputChange}
                            className="mr-2 w-4 h-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                        />
                        <label htmlFor="active" className="text-sm text-gray-300">
                            {t('common.active')}
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="px-4 py-2 text-sm font-medium text-darkest-bg bg-gold border border-transparent rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t('common.saving') : (newsId ? t('common.update') : t('common.create'))}
                    </button>
                </div>
            </form>
        </div>
    );
};
