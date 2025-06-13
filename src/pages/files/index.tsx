import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FileUpload from '../../components/ui/FileUpload';
import ImageDisplay from '../../components/ui/ImageDisplay';
import { useFileStore } from '../../store/fileStore';
import type { FileType } from '../../types/files';

const FilesPage: React.FC = () => {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState<FileType>('team-avatar');
    const [selectedObjectId, setSelectedObjectId] = useState<number>(1);
    const [uploadedFiles, setUploadedFiles] = useState<number[]>([]);
    
    const { isUploading, error } = useFileStore();

    const breadcrumbItems = [
        { label: t('common.home'), href: '/dashboard' },
        { label: t('files.title'), href: '/dashboard/files' }
    ];

    const fileTypes = [
        'team-avatar',
        'user-avatar', 
        'playground-avatar'
    ] as FileType[];

    const handleUploadComplete = (fileIds: number[]) => {
        setUploadedFiles(prev => [...prev, ...fileIds]);
    };

    const handleUploadError = (error: string) => {
        console.error('Upload error:', error);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
                <h1 className="text-3xl font-bold text-white mt-4">
                    {t('files.title')}
                </h1>
                <p className="text-gray-400 mt-2">
                    {t('files.description')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-darkest-bg border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {t('files.uploadSection')}
                    </h2>
                    
                    {/* File Type Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('files.selectType')}
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as FileType)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gold"
                        >
                            {fileTypes.map(type => (
                                <option key={type} value={type}>
                                    {t(`files.types.${type}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Object ID Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('files.objectId')}
                        </label>
                        <input
                            type="number"
                            value={selectedObjectId}
                            onChange={(e) => setSelectedObjectId(parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                    </div>

                    {/* Single File Upload */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                            {t('files.singleUpload')}
                        </h3>
                        <FileUpload
                            type={selectedType}
                            objectId={selectedObjectId}
                            accept="image/*"
                            maxSize={5}
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                        />
                    </div>

                    {/* Multiple File Upload */}
                    <div>
                        <h3 className="text-lg font-medium text-white mb-3">
                            {t('files.multipleUpload')}
                        </h3>
                        <FileUpload
                            type={selectedType}
                            objectId={selectedObjectId}
                            multiple={true}
                            accept="image/*"
                            maxSize={5}
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                        />
                    </div>

                    {/* Upload Status */}
                    {isUploading && (
                        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                            {t('files.uploading')}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {/* Display Section */}
                <div className="bg-darkest-bg border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {t('files.displaySection')}
                    </h2>

                    {/* Display by Object ID and Type */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                            {t('files.displayByObject')}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            {t('files.objectDisplayInfo', { type: t(`files.types.${selectedType}`), objectId: selectedObjectId })}
                        </p>
                        <div className="border border-gray-600 rounded-lg overflow-hidden">
                            <ImageDisplay
                                objectId={selectedObjectId}
                                type={selectedType}
                                alt={`${selectedType} for object ${selectedObjectId}`}
                                className="w-full h-48 object-cover"
                                fallbackSrc="/placeholder-image.jpg"
                            />
                        </div>
                    </div>

                    {/* Display Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">
                                {t('files.recentUploads')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {uploadedFiles.slice(-4).map((fileId) => (
                                    <div key={fileId} className="border border-gray-600 rounded-lg overflow-hidden">
                                        <ImageDisplay
                                            fileId={fileId}
                                            alt={`Uploaded file ${fileId}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        <div className="p-2 bg-gray-800">
                                            <p className="text-xs text-gray-400">
                                                ID: {fileId}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadedFiles.length === 0 && (
                        <div className="text-center py-8">
                            <svg
                                className="w-12 h-12 text-gray-500 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="text-gray-500">
                                {t('files.noFiles')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilesPage;
