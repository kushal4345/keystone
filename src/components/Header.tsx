import React from 'react';
import { Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

/**
 * Application header with mode toggle and navigation
 */
export function Header() {
  const { isOnline, setIsOnline } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  const handleModeToggle = () => {
    setIsOnline(!isOnline);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Home</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">Keystone</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-blue-700'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={handleModeToggle}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                isOnline 
                  ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              title={`Switch to ${isOnline ? 'Offline' : 'Online'} mode`}
            >
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}