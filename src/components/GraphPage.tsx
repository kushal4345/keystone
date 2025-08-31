import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ChatInterface, type ChatInterfaceRef } from './ChatInterface';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';

/**
 * Main graph workspace with three-panel layout
 */
export function GraphPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { isOnline, setCurrentDocumentId, currentGraphData } = useApp();
  const chatRef = useRef<ChatInterfaceRef>(null);

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

  const handleNodeSelect = (nodeId: string | number, nodeLabel: string) => {
    // This will trigger a question in the chat interface
    console.log('Node selected:', nodeId, nodeLabel);
  };

  const handleNodeExplain = async (message: string) => {
    // Send message to chat interface
    if (chatRef.current) {
      try {
        await chatRef.current.sendMessage(message);
      } catch (error) {
        console.error('Failed to send message to chat:', error);
      }
    }
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
    <div 
      className="min-h-screen pt-20"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 30%, #1a1a1a 60%, #333333 100%)',
      }}
    >
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Main Graph Canvas */}
        <div className="flex-1 p-6">
          <div className="h-full rounded-xl overflow-hidden">
            <KnowledgeGraph 
              data={currentGraphData} 
              onNodeSelect={handleNodeSelect}
              onNodeExplain={handleNodeExplain}
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 p-6 pl-0">
          <div className="h-full rounded-xl overflow-hidden">
            <div 
              className="px-6 py-4"
              style={{
                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                border: '2px solid #D4AF37',
                borderBottom: '2px solid #D4AF37',
              }}
            >
              <h3 className="text-lg font-bold text-yellow-400 tracking-wide">
                ⚡ KEYSTONE CHAT
              </h3>
              <p className="text-sm text-yellow-600 mt-1 font-medium">
                Explore content through AI conversation
              </p>
            </div>
            <div className="h-[calc(100%-5rem)]">
              <ChatInterface ref={chatRef} documentId={documentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}