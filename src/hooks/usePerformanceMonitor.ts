import { useEffect, useState } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    componentName: string;
    timestamp: number;
}

interface PerformanceData {
    metrics: PerformanceMetrics[];
    averageRenderTime: number;
    slowestComponent: string;
    totalRenders: number;
}

// Simple performance monitor for development
export const usePerformanceMonitor = (componentName: string) => {
    const [renderStart] = useState(() => performance.now());

    useEffect(() => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
            const metrics: PerformanceMetrics = {
                renderTime,
                componentName,
                timestamp: Date.now()
            };

            // Store in sessionStorage for debugging
            const existingData = sessionStorage.getItem('performance-metrics');
            const allMetrics: PerformanceMetrics[] = existingData ? JSON.parse(existingData) : [];
            allMetrics.push(metrics);

            // Keep only last 100 entries to avoid memory issues
            if (allMetrics.length > 100) {
                allMetrics.splice(0, allMetrics.length - 100);
            }

            sessionStorage.setItem('performance-metrics', JSON.stringify(allMetrics));

            // Log slow renders (> 16ms)
            if (renderTime > 16) {
                console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        }
    });

    return renderStart;
};

// Hook to get performance data for debugging
export const usePerformanceData = (): PerformanceData => {
    const [data, setData] = useState<PerformanceData>({
        metrics: [],
        averageRenderTime: 0,
        slowestComponent: '',
        totalRenders: 0
    });

    useEffect(() => {
        const existingData = sessionStorage.getItem('performance-metrics');
        if (existingData) {
            const metrics: PerformanceMetrics[] = JSON.parse(existingData);
            
            const totalRenders = metrics.length;
            const averageRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalRenders;
            
            const slowestMetric = metrics.reduce((prev, current) => 
                (prev.renderTime > current.renderTime) ? prev : current
            );

            setData({
                metrics,
                averageRenderTime,
                slowestComponent: slowestMetric.componentName,
                totalRenders
            });
        }
    }, []);

    return data;
};

// Function to clear performance data
export const clearPerformanceData = () => {
    sessionStorage.removeItem('performance-metrics');
};

// Function to export performance data
export const exportPerformanceData = () => {
    const data = sessionStorage.getItem('performance-metrics');
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
