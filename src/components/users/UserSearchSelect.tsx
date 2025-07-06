import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi } from '../../api/users';
import type { User } from '../../types/users';

interface UserSearchSelectProps {
    value: number;
    onChange: (userId: number) => void;
    error?: string;
    disabled?: boolean;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
    value,
    onChange,
    error,
    disabled = false
}) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setUsers([]);
            return;
        }

        console.log('Searching users with query:', query); // Add debug log

        setIsLoading(true);
        try {
            // Разделяем запрос на слова
            const words = query.trim().split(/\s+/);
            
            let response;
            
            if (words.length === 1) {
                // Если одно слово - ищем или по имени или по фамилии
                // Делаем два отдельных запроса и объединяем результаты
                const [firstNameResults, lastNameResults] = await Promise.all([
                    usersApi.getAll(0, 5, { firstName: query }),
                    usersApi.getAll(0, 5, { lastName: query })
                ]);
                
                // Объединяем результаты и убираем дубликаты
                const allUsers = [...firstNameResults.content, ...lastNameResults.content];
                const uniqueUsers = allUsers.filter((user, index, arr) => 
                    arr.findIndex(u => u.id === user.id) === index
                );
                
                setUsers(uniqueUsers.slice(0, 10)); // Ограничиваем до 10 результатов
            } else if (words.length === 2) {
                // Если два слова - предполагаем что первое имя, второе фамилия
                response = await usersApi.getAll(0, 10, {
                    firstName: words[0],
                    lastName: words[1]
                });
                setUsers(response.content || []);
            } else {
                // Если больше двух слов - ищем по полному запросу как по имени
                response = await usersApi.getAll(0, 10, {
                    firstName: query
                });
                setUsers(response.content || []);
            }
        } catch (error) {
            console.error('Failed to search users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchQuery]);

    // Load selected user info when value changes
    useEffect(() => {
        if (value && !selectedUser) {
            const loadUser = async () => {
                try {
                    const user = await usersApi.getById(value);
                    setSelectedUser(user);
                } catch (error) {
                    console.error('Failed to load user:', error);
                }
            };
            loadUser();
        }
    }, [value, selectedUser]);

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        onChange(user.id);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        setSelectedUser(null);
        onChange(0);
        setSearchQuery('');
    };

    // Функция для подсветки совпадений
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-gold text-darkest-bg">$1</mark>');
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium mb-1">
                {t('players.user')} *
            </label>
            
            {selectedUser ? (
                <div className={`w-full px-3 py-2 bg-darkest-bg border rounded-md flex items-center justify-between ${
                    error ? 'border-red-500' : 'border-gray-600'
                }`}>
                    <div>
                        <span className="text-white font-medium">
                            {selectedUser.firstname} {selectedUser.lastname}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                            (ID: {selectedUser.id}, {selectedUser.phone})
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-white ml-2"
                        disabled={disabled}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={t('players.searchUser')}
                        disabled={disabled}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors ${
                            error ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    
                    {isOpen && (searchQuery.length >= 2 || isLoading) && (
                        <div className="absolute z-10 w-full mt-1 bg-darkest-bg border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-400">
                                    <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-2">{t('common.loading')}</span>
                                </div>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleUserSelect(user)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0"
                                    >
                                        <div className="font-medium text-white">
                                            <span 
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightMatch(`${user.firstname} ${user.lastname}`, searchQuery)
                                                }}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ID: {user.id} • {user.phone}
                                        </div>
                                        {user.roles.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {user.roles.map(role => role.name).join(', ')}
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : searchQuery.length >= 2 ? (
                                <div className="p-4 text-center text-gray-400">
                                    {t('users.noUsersFound')}
                                    <div className="text-xs mt-1">
                                        {t('users.searchHint')} "{searchQuery}"
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-400">
                                    {t('users.typeToSearch')}
                                    <div className="text-xs mt-1">
                                        {t('users.searchInstructions')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default UserSearchSelect;
