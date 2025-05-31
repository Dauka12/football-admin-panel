import React, { useState } from 'react';
import { clearPerformanceData, exportPerformanceData, usePerformanceData } from '../../hooks/usePerformanceMonitor';

const PerformanceDebugger: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const performanceData = usePerformanceData();

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Performance Monitor"
            >
                ⚡ {performanceData.totalRenders}
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Performance Monitor</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                <div className="font-medium">Total Renders</div>
                                <div className="text-lg">{performanceData.totalRenders}</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                <div className="font-medium">Avg Time</div>
                                <div className="text-lg">{performanceData.averageRenderTime.toFixed(2)}ms</div>
                            </div>
                        </div>

                        {performanceData.slowestComponent && (
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-sm">
                                <div className="font-medium">Slowest Component</div>
                                <div>{performanceData.slowestComponent}</div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="font-medium">Recent Renders</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {performanceData.metrics.slice(-10).reverse().map((metric, index) => (
                                    <div
                                        key={index}
                                        className={`text-xs p-1 rounded ${
                                            metric.renderTime > 16 
                                                ? 'bg-red-100 dark:bg-red-900' 
                                                : 'bg-green-100 dark:bg-green-900'
                                        }`}
                                    >
                                        <div className="flex justify-between">
                                            <span>{metric.componentName}</span>
                                            <span>{metric.renderTime.toFixed(2)}ms</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={exportPerformanceData}
                                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                Export Data
                            </button>
                            <button
                                onClick={clearPerformanceData}
                                className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Clear Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceDebugger;
