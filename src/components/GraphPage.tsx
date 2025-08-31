import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [chatWidth, setChatWidth] = useState(384); // 384px = w-96
  const [isDragging, setIsDragging] = useState(false);

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

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 280;
    const maxWidth = window.innerWidth * 0.6;
    
    setChatWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
      className="min-h-screen"
      style={{
        background: '#1a1a1a',
      }}
    >
      <div className="flex h-screen">
        {/* Main Graph Canvas */}
        <div className="flex-1">
          <KnowledgeGraph 
            data={currentGraphData} 
            onNodeSelect={handleNodeSelect}
            onNodeExplain={handleNodeExplain}
          />
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-700 hover:bg-yellow-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Chat Sidebar */}
        <div 
          className="border-l border-gray-700"
          style={{ width: chatWidth }}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
              <h3 className="text-base font-semibold text-white">
                Chat
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Ask questions about the document
              </p>
            </div>
            <div className="flex-1">
              <ChatInterface ref={chatRef} documentId={documentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}