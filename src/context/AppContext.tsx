import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GraphData, Annotations, SelectedTarget, Annotation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  currentDocumentId: string | null;
  setCurrentDocumentId: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentGraphData: GraphData | null;
  setCurrentGraphData: (data: GraphData | null) => void;
  modeSelected: boolean;
  setModeSelected: (selected: boolean) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  // Annotation system
  annotations: Annotations;
  setAnnotations: (annotations: Annotations) => void;
  selectedTarget: SelectedTarget | null;
  setSelectedTarget: (target: SelectedTarget | null) => void;
  addAnnotation: (targetId: string, text: string, author: string) => void;
  editAnnotation: (targetId: string, annotationId: string, newText: string) => void;
  deleteAnnotation: (targetId: string, annotationId: string) => void;
  // Document summary for export
  documentSummary: string | null;
  setDocumentSummary: (summary: string | null) => void;
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
  const [currentGraphData, setCurrentGraphData] = useState<GraphData | null>(null);
  const [modeSelected, setModeSelected] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Annotation system state
  const [annotations, setAnnotations] = useState<Annotations>({});
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);
  const [documentSummary, setDocumentSummary] = useState<string | null>(null);

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

  // Annotation management functions
  const addAnnotation = (targetId: string, text: string, author: string) => {
    const newAnnotation: Annotation = {
      id: uuidv4(),
      text,
      author,
      createdAt: new Date(),
    };

    setAnnotations(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newAnnotation]
    }));
  };

  const editAnnotation = (targetId: string, annotationId: string, newText: string) => {
    setAnnotations(prev => ({
      ...prev,
      [targetId]: prev[targetId]?.map(annotation =>
        annotation.id === annotationId
          ? { ...annotation, text: newText, editedAt: new Date() }
          : annotation
      ) || []
    }));
  };

  const deleteAnnotation = (targetId: string, annotationId: string) => {
    setAnnotations(prev => ({
      ...prev,
      [targetId]: prev[targetId]?.filter(annotation => annotation.id !== annotationId) || []
    }));
  };

  const value = {
    isOnline,
    setIsOnline,
    currentDocumentId,
    setCurrentDocumentId,
    isLoading,
    setIsLoading,
    currentGraphData,
    setCurrentGraphData,
    modeSelected,
    setModeSelected,
    selectedEventId,
    setSelectedEventId,
    // Annotation system
    annotations,
    setAnnotations,
    selectedTarget,
    setSelectedTarget,
    addAnnotation,
    editAnnotation,
    deleteAnnotation,
    // Document summary
    documentSummary,
    setDocumentSummary,
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