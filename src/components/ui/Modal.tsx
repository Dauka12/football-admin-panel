import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Delay to allow CSS transitions to work properly
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsActive(true), 10);
        } else {
            setIsActive(false);
            // Delay removing the element to allow for exit animations
            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`modal-overlay ${isActive ? 'active' : ''}`}>
            <div className={`modal-content ${isActive ? 'active' : ''}`}>
                <div className="flex justify-between items-center p-4 border-b border-darkest-bg">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Modal);
