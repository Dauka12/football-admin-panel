import React, { useEffect, useState } from 'react';
import { LoadingManager } from '../../utils/apiService';

const GlobalLoadingIndicator: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsLoading(LoadingManager.getGlobalLoadingState());

        // Subscribe to global loading state changes
        const unsubscribe = LoadingManager.subscribe('global', (loading) => {
            setIsLoading(LoadingManager.getGlobalLoadingState());
        });

        return unsubscribe;
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card-bg rounded-lg shadow-2xl p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                <span className="text-white font-medium">Loading...</span>
            </div>
        </div>
    );
};

export default GlobalLoadingIndicator;
