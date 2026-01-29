import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    className = '' 
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={`
                relative bg-card-bg rounded-xl shadow-2xl border border-gray-700 
                w-full max-h-[90vh] flex flex-col
                transform transition-all duration-300 ease-out
                ${className}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white truncate pr-4">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
                        aria-label="Закрыть"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SimpleModal;