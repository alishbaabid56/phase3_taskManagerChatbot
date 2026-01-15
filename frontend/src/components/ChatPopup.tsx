'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from './auth/AuthProvider';

// Dynamic import to avoid SSR issues
const DynamicChatComponent = dynamic(() => import('./ChatComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
    </div>
  ),
});

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Popup */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{ width: '380px', height: '560px', maxWidth: '90%', maxHeight: '90%' }}
      >
        <div className="h-full flex flex-col bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700">

          {/* Minimal Header */}
          <div className="flex justify-end px-3 py-2 border-b border-gray-700">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            {user ? (
              <DynamicChatComponent />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Please log in to use the assistant
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPopup;
