import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ChatInterface } from './ChatInterface';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';

/**
 * Main graph workspace with three-panel layout
 */
export function GraphPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { isOnline, setCurrentDocumentId, currentGraphData } = useApp();

  useEffect(() => {
    if (documentId) {
      setCurrentDocumentId(documentId);
    }
  }, [documentId, setCurrentDocumentId]);

  useEffect(() => {
    // Update API service mode when online status changes
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  // No longer needed since graph data comes from context
  // const loadGraphData = async (docId: string) => { ... }

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

  // Remove loading and error states since we get data from context

  if (!currentGraphData) {
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
              data={currentGraphData} 
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