import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  error,
  required = false,
  placeholder
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  // Format the value for display
  const formatForDisplay = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return dateTimeString;
    }
  };

  return (
    <div className="relative">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      {/* Input Container */}
      <div className={`
        relative rounded-lg border transition-all duration-200
        ${isFocused 
          ? 'border-gold ring-2 ring-gold/20 shadow-lg shadow-gold/10' 
          : error 
            ? 'border-red-400' 
            : 'border-gray-600 hover:border-gray-500'
        }
        ${error ? 'bg-red-50/5' : 'bg-gray-800/50'}
      `}>
        {/* Calendar Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-5 h-5 transition-colors duration-200 ${
              isFocused ? 'text-gold' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        
        {/* Input Field */}
        <input
          type="datetime-local"
          value={formatForDisplay(value)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-gray-400
            focus:outline-none transition-all duration-200
            ${error ? 'text-red-300' : 'text-white'}
          `}
          style={{
            colorScheme: 'dark'
          }}
        />
        
        {/* Focus Ring Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold/5 to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center text-red-400 text-sm">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {/* Helper Text */}
      {!error && (
        <div className="mt-1 text-xs text-gray-500">
          {t('common.selectDateTime')}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
