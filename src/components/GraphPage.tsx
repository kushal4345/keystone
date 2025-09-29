import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KnowledgeGraph } from './KnowledgeGraph';
import { TimelineView } from './TimelineView';
import { ChatInterface, type ChatInterfaceRef } from './ChatInterface';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';
import { generateSampleLegalData } from '@/utils/sampleEventData';
import { ArrowLeft } from 'lucide-react';

/**
 * Main graph workspace with three-panel layout
 */
export function GraphPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { isOnline, setCurrentDocumentId, currentGraphData, setCurrentGraphData } = useApp();
  const navigate = useNavigate();
  const chatRef = useRef<ChatInterfaceRef>(null);
  const [chatWidth, setChatWidth] = useState(384); // 384px = w-96
  const [timelineHeight, setTimelineHeight] = useState(180); // Default timeline height
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTimelineDragging, setIsTimelineDragging] = useState(false);

  useEffect(() => {
    if (documentId) {
      setCurrentDocumentId(documentId);
    }
  }, [documentId, setCurrentDocumentId]);

  // Load demo data by default for hackathon demonstration
  useEffect(() => {
    if (!currentGraphData) {
      const sampleData = generateSampleLegalData();
      setCurrentGraphData(sampleData);
      setCurrentDocumentId('sample-legal-contract');
    }
  }, [currentGraphData, setCurrentGraphData, setCurrentDocumentId]);

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

  const handleTimelineMouseDown = useCallback(() => {
    setIsTimelineDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 280;
      const maxWidth = window.innerWidth * 0.6;
      setChatWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    }
    
    if (isTimelineDragging) {
      const containerRect = document.querySelector('.main-container')?.getBoundingClientRect();
      if (containerRect) {
        const relativeY = e.clientY - containerRect.top;
        const availableHeight = containerRect.height;
        const newHeight = availableHeight - relativeY;
        const minHeight = 120;
        const maxHeight = availableHeight * 0.5;
        setTimelineHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
      }
    }
  }, [isDragging, isTimelineDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsTimelineDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging || isTimelineDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isTimelineDragging, handleMouseMove, handleMouseUp]);

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

  // Demo data loads automatically, but show loading state briefly if needed
  if (!currentGraphData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-white mb-2">Loading Demo</h2>
          <p className="text-gray-400">Preparing legal document analysis...</p>
        </div>
      </div>
    );
  }

  const handleBackToHome = () => {
    navigate('/');
  };

  const toggleTimelineCollapse = () => {
    setIsTimelineCollapsed(!isTimelineCollapsed);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#1a1a1a',
      }}
    >
      {/* Floating Back Button */}
      <button
        onClick={handleBackToHome}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-3 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-gray-800/90 transition-all duration-200 shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      <div className="flex h-screen">
        {/* Main Graph Canvas with Timeline */}
        <div className="flex-1 flex flex-col main-container">
          <div className="flex-1">
            <KnowledgeGraph 
              data={currentGraphData} 
              onNodeSelect={handleNodeSelect}
              onNodeExplain={handleNodeExplain}
            />
          </div>
          
          {/* Timeline Resize Handle */}
          {!isTimelineCollapsed && (
            <div
              className="h-1 bg-gray-700 hover:bg-yellow-500 cursor-row-resize transition-colors timeline-container"
              onMouseDown={handleTimelineMouseDown}
            />
          )}
          
          {/* Timeline at bottom */}
          <div 
            className="flex-shrink-0 border-t border-gray-700"
            style={{ height: isTimelineCollapsed ? 40 : timelineHeight }}
          >
            <TimelineView 
              isCollapsed={isTimelineCollapsed}
              onToggleCollapse={toggleTimelineCollapse}
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-700 hover:bg-yellow-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Chat Sidebar */}
        <div 
          className="border-l border-gray-700 flex flex-col"
          style={{ width: chatWidth, height: '100%' }}
        >
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-base font-semibold text-white">
              Chat
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Ask questions about the document
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatInterface ref={chatRef} documentId={documentId} />
          </div>
        </div>
      </div>
    </div>
  );
}