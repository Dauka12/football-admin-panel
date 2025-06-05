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
    }    return (
        <div className={`modal-overlay ${isActive ? 'active' : ''}`}>
            <div className={`modal-content ${isActive ? 'active' : ''} bg-gradient-to-b from-card-bg to-darkest-bg border border-gray-800/50 rounded-lg shadow-2xl overflow-hidden`}>
                <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-accent-pink to-gold opacity-50"></div>
                    <div className="flex justify-between items-center p-5 border-b border-gray-800/50 bg-darkest-bg/30">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-accent-pink transition-all duration-300 p-1.5 rounded-full hover:bg-darkest-bg/70"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Modal);
