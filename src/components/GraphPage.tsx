import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ChatInterface } from './ChatInterface';
import { LoadingState } from './LoadingState';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';
import type { GraphData } from '@/types';

/**
 * Main graph workspace with three-panel layout
 */
export function GraphPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { isOnline, setCurrentDocumentId } = useApp();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      setCurrentDocumentId(documentId);
      loadGraphData(documentId);
    }
  }, [documentId, setCurrentDocumentId]);

  useEffect(() => {
    // Update API service mode when online status changes
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  const loadGraphData = async (docId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.fetchGraphData(docId);
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeSelect = (nodeId: number, nodeLabel: string) => {
    // This will trigger a question in the chat interface
    // The actual implementation would depend on how you want to handle this
    console.log('Node selected:', nodeId, nodeLabel);
  };

  if (!documentId) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h2>
          <p className="text-gray-600">Please upload a document to continue.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <LoadingState message="Loading knowledge graph..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadGraphData(documentId)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600">Unable to generate knowledge graph for this document.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Main Graph Canvas */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <KnowledgeGraph 
              data={graphData} 
              onNodeSelect={handleNodeSelect}
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 p-6 pl-0">
          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ask Questions
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Explore the content through conversation
              </p>
            </div>
            <div className="h-[calc(100%-5rem)]">
              <ChatInterface documentId={documentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}