import React, { useEffect, useRef, useState } from 'react';

interface YandexMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLat?: number;
  initialLng?: number;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export const YandexMapPicker: React.FC<YandexMapPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat = 51.1694,
  initialLng = 71.4491
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([initialLat, initialLng]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Обновляем координаты при изменении начальных значений
  useEffect(() => {
    setSelectedCoords([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  // Закрываем результаты поиска при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showResults && !(event.target as Element).closest('.search-results')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResults]);

  useEffect(() => {
    if (!isOpen) return;

    const loadYandexMaps = () => {
      if (window.ymaps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(initializeMap);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 10,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      // Добавляем начальную метку
      placemarkRef.current = new window.ymaps.Placemark([initialLat, initialLng], {
        balloonContent: 'Выберите местоположение площадки'
      }, {
        preset: 'islands#redDotIcon',
        draggable: true
      });

      mapInstance.current.geoObjects.add(placemarkRef.current);

      // Обработчик клика по карте
      mapInstance.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        setSelectedCoords(coords);

        // Обновляем позицию метки
        placemarkRef.current.geometry.setCoordinates(coords);
      });

      // Обработчик перетаскивания метки
      placemarkRef.current.events.add('dragend', (e: any) => {
        const coords = e.get('target').geometry.getCoordinates();
        setSelectedCoords(coords);
      });

      setIsMapReady(true);
    };

    loadYandexMaps();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng]);

  const handleConfirmSelection = () => {
    onLocationSelect(selectedCoords[0], selectedCoords[1]);
    onClose();
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || !window.ymaps) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const geocoder = window.ymaps.geocode(query, {
        results: 5,
        boundedBy: [[49.0, 46.0], [87.0, 71.0]] // Ограничиваем поиск территорией Казахстана
      });

      geocoder.then((res: any) => {
        const results = [];
        const geoObjects = res.geoObjects;
        
        for (let i = 0; i < geoObjects.getLength(); i++) {
          const geoObject = geoObjects.get(i);
          const coords = geoObject.geometry.getCoordinates();
          const name = geoObject.getAddressLine();
          
          results.push({
            name,
            coords,
            description: geoObject.properties.get('text')
          });
        }
        
        setSearchResults(results);
        setShowResults(results.length > 0);
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (coords: [number, number]) => {
    setSelectedCoords(coords);
    setShowResults(false);
    setSearchQuery('');
    
    // Обновляем позицию метки
    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates(coords);
    }
    
    // Центрируем карту на выбранной точке
    if (mapInstance.current) {
      mapInstance.current.setCenter(coords, 15);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 2) {
      // Debounce search
      setTimeout(() => {
        handleSearch(value);
      }, 500);
    } else {
      setShowResults(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl text-black font-semibold flex items-center gap-2">
            📍 Выберите местоположение площадки
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-4">
          {/* Поисковая строка */}
          <div className="mb-4 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Поиск по адресу (например: Нур-Султан, улица Абая)"
                className="w-full px-4 py-2 pl-10 pr-4 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Результаты поиска */}
            {showResults && searchResults.length > 0 && (
              <div className="search-results absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    onClick={() => handleSelectSearchResult(result.coords)}
                  >
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={mapRef} className="w-full rounded-lg border" style={{ height: 'calc(100% - 80px)' }} />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Выбранные координаты: {selectedCoords[0].toFixed(6)}, {selectedCoords[1].toFixed(6)}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-red-400 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                onClick={onClose}
              >
                Отмена
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleConfirmSelection}
                disabled={!isMapReady}
              >
                Подтвердить выбор
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
