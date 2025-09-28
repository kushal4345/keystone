import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { LoadingState } from './LoadingState';
import { apiService } from '@/services/apiService';
import { useApp } from '@/context/AppContext';
import { formatResponseForDisplay } from '@/utils/formatResponse';

/**
 * Summary page for document summarization
 */
export function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileFromState, setFileFromState] = useState<File | null>(null);

  // Update API service mode
  useEffect(() => {
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  // Check for file passed from navigation state
  useEffect(() => {
    if (location.state?.file) {
      setFileFromState(location.state.file);
      // Automatically process the file
      handleFileSelect(location.state.file);
    }
  }, [location.state]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setFileName(file.name);

    try {
      const result = await apiService.summarizeLegalDocument(file);
      setSummary(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDownloadSummary = () => {
    if (!summary || !fileName) return;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.pdf', '')}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-keystone-primary">
      {/* Header with back button */}
      <div className="p-6 border-b border-keystone-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 text-keystone-accent hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <h1 className="text-2xl font-bold text-keystone-text">
            Document Summary
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!summary && !isLoading && !fileFromState && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-keystone-accent/20 rounded-full mb-4">
                <FileText size={32} className="text-keystone-accent" />
              </div>
              <h2 className="text-xl font-bold text-keystone-text mb-2">
                Upload Document for Summary
              </h2>
              <p className="text-keystone-text-muted">
                Upload a PDF document to get a comprehensive summary of its contents.
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingState message="📄 SUMMARIZING DOCUMENT..." size="large" />
            <p className="text-keystone-text-muted mt-4 text-center">
              Analyzing your document and generating a comprehensive summary...
            </p>
          </div>
        )}

        {summary && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-keystone-text">
                  Document Summary
                </h2>
                {fileName && (
                  <p className="text-keystone-text-muted text-sm">
                    {fileName}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleDownloadSummary}
                className="flex items-center space-x-2 px-4 py-2 bg-keystone-accent hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>

            <div 
              className="bg-keystone-secondary p-6 rounded-lg border border-keystone-border"
              style={{
                clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)'
              }}
            >
              <div className="prose prose-invert max-w-none">
                <div className="text-keystone-text leading-relaxed space-y-4">
                  {formatResponseForDisplay(summary).map((segment, index) => (
                    <div key={index}>
                      {segment.type === 'headline' ? (
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-keystone-accent mb-2 tracking-wide">
                            {segment.content}
                          </h3>
                          <div className="w-full h-0.5 bg-keystone-accent/30"></div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-keystone-text leading-relaxed">
                          {segment.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-keystone-secondary hover:bg-keystone-border text-keystone-text font-medium rounded-lg transition-colors border border-keystone-border"
              >
                Back to Home
              </button>
              
              <button
                onClick={() => {
                  setSummary(null);
                  setFileName(null);
                  setError(null);
                  setFileFromState(null);
                }}
                className="px-6 py-3 bg-keystone-accent hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
              >
                Summarize Another Document
              </button>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8">
            <div 
              className="p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 shadow-lg rounded-lg"
              style={{
                clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)'
              }}
            >
              <p className="text-red-300 font-medium">{error}</p>
            </div>
            
            <button
              onClick={() => {
                setError(null);
                setSummary(null);
                setFileName(null);
                setFileFromState(null);
              }}
              className="mt-4 px-6 py-3 bg-keystone-accent hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
