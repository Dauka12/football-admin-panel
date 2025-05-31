import React, { useEffect, useState } from 'react';
import { LoadingManager } from '../../utils/apiService';

interface GlobalLoadingIndicatorProps {
    className?: string;
}

export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({ className = '' }) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check initial loading state
        setIsLoading(LoadingManager.getGlobalLoadingState());

        // Subscribe to global loading changes
        const unsubscribe = LoadingManager.subscribe('global', (loading) => {
            setIsLoading(loading || LoadingManager.getGlobalLoadingState());
        });

        return unsubscribe;
    }, []);

    if (!isLoading) return null;

    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 shadow-xl">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent"></div>
                    <span className="text-white text-sm font-medium">Loading...</span>
                </div>
            </div>
        </div>
    );
};

// Simple loading spinner component for individual elements
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
    size = 'md', 
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-gold border-t-transparent ${sizeClasses[size]} ${className}`}></div>
    );
};
