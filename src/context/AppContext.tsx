import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  currentDocumentId: string | null;
  setCurrentDocumentId: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global application context provider
 * Manages online/offline state and document state
 */
export function AppProvider({ children }: AppProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    isOnline,
    setIsOnline,
    currentDocumentId,
    setCurrentDocumentId,
    isLoading,
    setIsLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access the app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}