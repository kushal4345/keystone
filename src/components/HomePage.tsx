import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';
import keystoneLogo from '@/media/keystone.png';
import { FileText, Brain } from 'lucide-react';

/**
 * Home page with central upload interface
 */
export function HomePage() {
  const navigate = useNavigate();
  const { setCurrentDocumentId, setCurrentGraphData, isOnline } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'topic' | 'summary' | null>(null);

  // Update API service mode
  React.useEffect(() => {
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  const handleFileSelect = async (file: File) => {
    if (selectedMode === 'summary') {
      // Navigate to summary page with the file
      navigate('/summary', { state: { file } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.processDocument(file);
      setCurrentDocumentId(result.documentId);
      
      // Store graph data if available
      if (result.graphData) {
        setCurrentGraphData(result.graphData);
      }
      
      navigate(`/graph/${result.documentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };


  const handleModeSelect = (mode: 'topic' | 'summary') => {
    setSelectedMode(mode);
    setError(null);
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-keystone-primary flex items-center px-8 py-12">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Logo/Title */}
          <div className="text-center lg:text-left animate-fade-in">
            <img src={keystoneLogo} alt="Keystone" className="max-w-full h-auto" />
          </div>

          {/* Right Side - Mode Selection or Upload Options */}
          <div className="animate-slide-up">
            {!selectedMode ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-keystone-text mb-2">
                    Choose Your Analysis Mode
                  </h2>
                  <p className="text-keystone-text-muted">
                    Select how you'd like to analyze your document
                  </p>
                </div>

                {/* Topic-based Analysis */}
                <div
                  className="relative overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-xl hover:shadow-yellow-500/30 cursor-pointer"
                  onClick={() => handleModeSelect('topic')}
                  style={{
                    clipPath: 'polygon(8% 0%, 92% 0%, 100% 15%, 96% 100%, 4% 100%, 0% 15%)',
                    background: '#2a2a2a',
                  }}
                >
                  <div className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 text-keystone-accent">
                      <Brain size={24} strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-2 tracking-wide text-keystone-text">
                        TOPIC-BASED ANALYSIS
                      </h3>
                      <p className="text-xs font-medium text-keystone-text-muted">
                        Interactive knowledge graph with Q&A and topic summaries
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-2 px-6 py-3 font-bold text-sm tracking-wide bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg"
                      style={{
                        clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
                      }}
                    >
                      <span>SELECT</span>
                    </div>
                  </div>
                </div>

                {/* Document Summary */}
                <div
                  className="relative overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-xl hover:shadow-yellow-500/30 cursor-pointer"
                  onClick={() => handleModeSelect('summary')}
                  style={{
                    clipPath: 'polygon(4% 0%, 96% 0%, 100% 20%, 92% 100%, 8% 100%, 0% 20%)',
                    background: '#2a2a2a',
                  }}
                >
                  <div className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 text-keystone-accent">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-2 tracking-wide text-keystone-text">
                        DOCUMENT SUMMARY
                      </h3>
                      <p className="text-xs font-medium text-keystone-text-muted">
                        Get a comprehensive summary of the entire document
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-2 px-6 py-3 font-bold text-sm tracking-wide bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg"
                      style={{
                        clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
                      }}
                    >
                      <span>SELECT</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <button
                    onClick={handleBackToModeSelection}
                    className="text-keystone-accent hover:text-yellow-400 transition-colors text-sm font-medium mb-4"
                  >
                    ← Back to Mode Selection
                  </button>
                  
                  <h2 className="text-xl font-bold text-keystone-text mb-2">
                    {selectedMode === 'topic' ? 'Topic-Based Analysis' : 'Document Summary'}
                  </h2>
                  <p className="text-keystone-text-muted text-sm">
                    {selectedMode === 'topic' 
                      ? 'Upload your document to explore the knowledge graph and ask questions'
                      : 'Upload your document to get a comprehensive summary'
                    }
                  </p>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}