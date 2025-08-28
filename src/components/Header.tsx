import React from 'react';
import { Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

/**
 * Application header with automatic connectivity status and navigation
 */
export function Header() {
  const { isOnline } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <header className="flex-shrink-0 bg-keystone-secondary/90 backdrop-blur-sm border-b border-keystone-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-3 py-1.5 text-keystone-text-muted hover:text-keystone-accent hover:bg-keystone-border/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Home</span>
            </button>
          )}
          <h1 className="text-xl font-serif font-bold text-keystone-accent">Keystone</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}