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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Keystone
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Turn any content into a conversation. Upload a PDF or paste a YouTube link 
            to explore knowledge through interactive visualization and AI-powered discussions.
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          onUrlSubmit={handleUrlSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}