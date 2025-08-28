import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';

/**
 * Home page with central upload interface
 */
export function HomePage() {
  const navigate = useNavigate();
  const { setCurrentDocumentId, isOnline } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update API service mode
  React.useEffect(() => {
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.processDocument(file);
      setCurrentDocumentId(result.documentId);
      navigate(`/graph/${result.documentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.processDocument(url);
      setCurrentDocumentId(result.documentId);
      navigate(`/graph/${result.documentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-keystone-primary px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-serif font-bold text-keystone-accent mb-4">
            Keystone
          </h1>
        </div>

        <div className="animate-slide-up">
          <FileUpload
            onFileSelect={handleFileSelect}
            onUrlSubmit={handleUrlSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}