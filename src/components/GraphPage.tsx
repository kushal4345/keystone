import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KnowledgeGraph } from './KnowledgeGraph';
import { TimelineView } from './TimelineView';
import { ChatInterface, type ChatInterfaceRef } from './ChatInterface';
import { AnnotationPanel } from './AnnotationPanel';
import { ExportModal } from './ExportModal';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/apiService';
import { generateSampleLegalData } from '@/utils/sampleEventData';
import { ExportService } from '@/services/exportService';
import type { ExportOptions } from '@/services/exportService';
import type { GraphData, GraphNode, GraphEdge } from '@/types';
import { ArrowLeft, Download } from 'lucide-react';

/**
 * Main graph workspace with three-panel layout
 */
export function GraphPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { 
    isOnline, 
    setCurrentDocumentId, 
    currentGraphData, 
    setCurrentGraphData, 
    annotations, 
    documentSummary,
    setDocumentSummary 
  } = useApp();
  const navigate = useNavigate();
  const chatRef = useRef<ChatInterfaceRef>(null);
  const [chatWidth, setChatWidth] = useState(384); // 384px = w-96
  const [timelineHeight, setTimelineHeight] = useState(180); // Default timeline height
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTimelineDragging, setIsTimelineDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'annotations'>('chat');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Global variables for contextual summary
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [indexName, setIndexName] = useState<string>('nerv');
  
  // Hover state for timeline-graph interaction
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
      setGraphData(sampleData); // Update local graph data state
      setCurrentDocumentId('sample-legal-contract');
      
      // Set sample document summary
      const sampleSummary = `This legal service agreement establishes a comprehensive partnership between TechCorp Inc. and Legal Services LLC for ongoing legal consultation and support services.

Key Terms:
• Contract Duration: 12 months with automatic renewal option
• Service Scope: General legal consultation, contract review, and compliance advisory
• Payment Structure: $50,000 initial payment with quarterly installments
• Confidentiality: Strict non-disclosure provisions protecting both parties
• Liability: Limited liability clause capping damages at contract value

Important Dates:
• Contract Signing: January 15, 2024
• Effective Date: February 1, 2024
• First Milestone: March 15, 2024
• Payment Due: March 30, 2024
• Quarterly Review: May 1, 2024
• Renewal Deadline: December 31, 2024

This agreement includes standard legal protections, intellectual property clauses, and termination provisions. Both parties maintain the right to terminate with 30-day notice under specified conditions.`;
      
      setDocumentSummary(sampleSummary);
    } else {
      // Update local graph data when currentGraphData changes
      setGraphData(currentGraphData);
    }
  }, [currentGraphData, setCurrentGraphData, setCurrentDocumentId, setDocumentSummary]);

  useEffect(() => {
    // Update API service mode when online status changes
    apiService.setOnlineMode(isOnline);
  }, [isOnline]);

  // Traceability analysis function (for internal use only)
  const analyzeNodeConnections = useCallback((nodeId: string, graphData: GraphData) => {
    if (!graphData) return null;

    const node = graphData.nodes.find(n => n.id.toString() === nodeId);
    if (!node) return null;

    // Find all edges connected to this node
    const connectedEdges = graphData.edges.filter(edge => 
      edge.source.toString() === nodeId || edge.target.toString() === nodeId
    );

    // Find connected nodes
    const connectedNodeIds = new Set<string>();
    connectedEdges.forEach(edge => {
      if (edge.source.toString() === nodeId) {
        connectedNodeIds.add(edge.target.toString());
      }
      if (edge.target.toString() === nodeId) {
        connectedNodeIds.add(edge.source.toString());
      }
    });

    const connectedNodes = graphData.nodes.filter(n => 
      connectedNodeIds.has(n.id.toString())
    );

    // Analyze relationships
    const outgoingConnections = connectedEdges.filter(edge => edge.source.toString() === nodeId);
    const incomingConnections = connectedEdges.filter(edge => edge.target.toString() === nodeId);

    return {
      node,
      connectedNodes,
      connectedEdges,
      outgoingConnections,
      incomingConnections,
      connectionCount: connectedNodeIds.size
    };
  }, []);

  // Simple node selection - sends clean message to chat
  const handleNodeSelect = useCallback((nodeId: string | number, nodeLabel: string) => {
    // Send a simple, clean message to the chat
    if (chatRef.current) {
      const message = `Tell me more about "${nodeLabel}".`;
      chatRef.current.sendMessage(message);
    }

    // Perform internal traceability analysis (hidden from user)
    if (graphData) {
      const analysis = analyzeNodeConnections(nodeId.toString(), graphData);
      if (analysis) {
        // Log detailed analysis to console for debugging/development
        console.log('Node Analysis:', {
          node: analysis.node,
          connections: analysis.connectionCount,
          connectedNodes: analysis.connectedNodes.map(n => n.label),
          outgoing: analysis.outgoingConnections.length,
          incoming: analysis.incomingConnections.length
        });
      }
    }
  }, [graphData, analyzeNodeConnections]);

  // Handle node hover from timeline
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  const handleExport = async (options: ExportOptions) => {
    try {
      // Capture graph image
      const graphImageBase64 = await ExportService.captureGraphImage('.knowledge-graph-container');
      
      // Prepare export data
      const exportData = {
        graphImageBase64: options.includeGraph ? graphImageBase64 : undefined,
        summary: options.includeSummary ? documentSummary || undefined : undefined,
        annotations: options.includeAnnotations ? annotations : {},
        documentTitle: options.title || 'Legal Document Analysis Report'
      };

      // Export the report
      await ExportService.exportReport(exportData, options);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const getTotalAnnotationCount = () => {
    return Object.values(annotations).reduce((total, annotationList) => total + annotationList.length, 0);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#000000',
      }}
    >
      {/* Floating Back Button */}
      <button
        onClick={handleBackToHome}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-3 py-2 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-black/95 transition-all duration-200 shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      {/* Floating Export Button */}
      <button
        onClick={() => setIsExportModalOpen(true)}
        className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-all duration-200 shadow-lg"
      >
        <Download size={18} />
        <span className="text-sm">Export Report</span>
      </button>

      <div className="flex h-screen">
        {/* Main Graph Canvas with Timeline */}
        <div className="flex-1 flex flex-col main-container">
          <div className="flex-1 knowledge-graph-container">
            <KnowledgeGraph 
              data={currentGraphData} 
              onNodeSelect={handleNodeSelect}
              onNodeHover={handleNodeHover}
              hoveredNodeId={hoveredNodeId}
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
              onNodeHover={handleNodeHover}
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-700 hover:bg-yellow-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Sidebar with Tabs */}
        <div 
          className="border-l border-gray-700 flex flex-col"
          style={{ width: chatWidth, height: '100%' }}
        >
          {/* Tab Switcher */}
          <div className="bg-black border-b border-gray-700 flex-shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('annotations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'annotations'
                    ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                Annotations
              </button>
            </div>
            
            {/* Tab Content Header */}
            <div className="px-4 py-2 bg-black">
              {activeTab === 'chat' ? (
                <>
                  <h3 className="text-base font-semibold text-white">Chat</h3>
                  <p className="text-sm text-gray-400">Ask questions about the document</p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-white">Annotations</h3>
                  <p className="text-sm text-gray-400">Collaborative comments on graph elements</p>
                </>
              )}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {activeTab === 'chat' ? (
              <ChatInterface ref={chatRef} documentId={documentId} />
            ) : (
              <AnnotationPanel />
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        annotationCount={getTotalAnnotationCount()}
        hasSummary={!!documentSummary}
      />
    </div>
  );
}