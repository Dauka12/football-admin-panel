import React, { useEffect, useRef } from 'react';

interface YandexMapDisplayProps {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
    className?: string;
}

declare global {
    interface Window {
        ymaps: any;
    }
}

export const YandexMapDisplay: React.FC<YandexMapDisplayProps> = ({
    latitude,
    longitude,
    address,
    name,
    className = "w-full h-64"
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        const loadYandexMaps = () => {
            if (window.ymaps) {
                initializeMap();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU';
            script.async = true;
            script.onload = () => {
                window.ymaps.ready(initializeMap);
            };
            document.head.appendChild(script);
        };

        const initializeMap = () => {
            if (!mapRef.current) return;

            mapInstance.current = new window.ymaps.Map(mapRef.current, {
                center: [latitude, longitude],
                zoom: 15,
                controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
            });

            // Добавляем метку
            const placemark = new window.ymaps.Placemark([latitude, longitude], {
                balloonContent: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0;">${name || 'Спортивная площадка'}</h3>
                        ${address ? `<p style="margin: 0; color: #666;">${address}</p>` : ''}
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
                            Координаты: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                        </p>
                    </div>
                `
            }, {
                preset: 'islands#redDotIcon'
            });

            mapInstance.current.geoObjects.add(placemark);
        };

        loadYandexMaps();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.destroy();
                mapInstance.current = null;
            }
        };
    }, [latitude, longitude, address, name]);

    return (
        <div className={`${className} rounded-lg border overflow-hidden`}>
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};
