import type { GraphData, ProcessDocumentResponse, AskQuestionResponse } from '@/types';
import { 
  processPdfOffline, 
  getSummaryOffline, 
  chatWithTopicOffline, 
  summarizeLegalDocumentOffline,
  isOnline 
} from './offlineService';

/**
 * API service abstraction layer
 * Handles routing between offline (Electron IPC) and online (HTTP) modes
 */
class ApiService {
  private isOnline: boolean = false;
  private baseUrl: string = this.getBaseUrl();

  private getBaseUrl(): string {
    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;
    
    // Check if running in development mode in browser
    const isDevelopmentBrowser = import.meta.env.DEV && !isElectron;
    
    if (isDevelopmentBrowser) {
      // Use proxy in browser development
      return '';
    } else {
      // Use full URL for Electron or production builds
      return 'https://hybrid-ai-tutor-2.onrender.com';
    }
  }

  /**
   * Set the online/offline mode
   */
  setOnlineMode(online: boolean): void {
    this.isOnline = online;
  }

  /**
   * Process a document (PDF file or YouTube URL)
   */
  async processDocument(source: File | string): Promise<ProcessDocumentResponse> {
    try {
      if (this.isOnline && isOnline()) {
        return this.processDocumentOnline(source);
      } else {
        return this.processDocumentOffline(source);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error('Failed to process document');
    }
  }

  /**
   * Fetch knowledge graph data for a document
   */
  async fetchGraphData(documentId: string): Promise<GraphData> {
    try {
      if (this.isOnline) {
        return this.fetchGraphDataOnline(documentId);
      } else {
        return this.fetchGraphDataOffline(documentId);
      }
    } catch (error) {
      console.error('Graph fetch error:', error);
      throw new Error('Failed to fetch graph data');
    }
  }

  /**
   * Ask a question about the document content
   */
  async askQuestion(documentId: string, question: string): Promise<AskQuestionResponse> {
    try {
      if (this.isOnline && isOnline()) {
        return this.askQuestionOnline(documentId, question);
      } else {
        return this.askQuestionOffline(documentId, question);
      }
    } catch (error) {
      console.error('Question answering error:', error);
      throw new Error('Failed to get answer');
    }
  }

  /**
   * Get a summary for a specific topic from the document
   */
  async getSummary(documentId: string, topic: string): Promise<{ summary: string }> {
    try {
      if (this.isOnline && isOnline()) {
        return this.getSummaryOnline(documentId, topic);
      } else {
        return getSummaryOffline(topic);
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Get a contextual summary with traceability information
   */
  async getContextualSummary(clickedNodeId: string, graphData: GraphData, indexName: string): Promise<{ summary: string }> {
    try {
      if (this.isOnline && isOnline()) {
        return this.getContextualSummaryOnline(clickedNodeId, graphData, indexName);
      } else {
        // For offline mode, fall back to simple topic-based summary
        const clickedNode = graphData.nodes.find(n => n.id === clickedNodeId);
        const topic = clickedNode ? clickedNode.label : 'Unknown topic';
        return getSummaryOffline(topic);
      }
    } catch (error) {
      console.error('Contextual summary generation error:', error);
      throw new Error('Failed to generate contextual summary');
    }
  }

  /**
   * Summarize the entire legal document
   */
  async summarizeLegalDocument(file: File): Promise<{ summary: string }> {
    try {
      if (this.isOnline && isOnline()) {
        return this.summarizeLegalDocumentOnline(file);
      } else {
        return summarizeLegalDocumentOffline(file);
      }
    } catch (error) {
      console.error('Document summarization error:', error);
      throw new Error('Failed to summarize document');
    }
  }

  // Private methods for offline mode (Electron IPC)

  private async processDocumentOffline(source: File | string): Promise<ProcessDocumentResponse> {
    if (typeof source === 'string') {
      // Handle YouTube URL
      throw new Error('YouTube processing not implemented in offline mode');
    } else {
      // Handle file upload using LangChain offline service
      const result = await processPdfOffline(source);
      return {
        documentId: result.index_name,
        title: source.name || 'Processed Document',
        status: 'success' as const,
        graphData: result.graphData
      };
    }
  }

  private async fetchGraphDataOffline(documentId: string): Promise<GraphData> {
    return window.electronAPI.fetchGraphData(documentId);
  }

  private async askQuestionOffline(documentId: string, question: string): Promise<AskQuestionResponse> {
    const result = await chatWithTopicOffline(documentId, question);
    return {
      answer: result.ai_response,
      sources: [] // Offline mode doesn't return sources
    };
  }

  // Private methods for online mode (HTTP API)

  private async processDocumentOnline(source: File | string): Promise<ProcessDocumentResponse> {
    if (typeof source === 'string') {
      // YouTube URL processing not available in current backend
      throw new Error('YouTube processing is not available with the current backend');
    }
    
    // File upload to /api/process-pdf endpoint
    const formData = new FormData();
    formData.append('file', source);

    const response = await fetch(`${this.baseUrl}/api/process-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const backendResponse = await response.json();
    
    // Transform backend response to match frontend expectations
    return {
      documentId: backendResponse.index_name || 'nerv',
      title: source.name || 'Processed Document',
      status: 'success' as const,
      graphData: backendResponse.graph_data
    };
  }

  private async fetchGraphDataOnline(documentId: string): Promise<GraphData> {
    // For now, graph data is returned with the process-pdf response
    // This method is kept for compatibility but should be enhanced 
    // if the backend provides a separate graph endpoint
    throw new Error('Graph data is included in the document processing response. Use processDocument instead.');
  }

  private async askQuestionOnline(documentId: string, question: string): Promise<AskQuestionResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: documentId,
        index_name: 'nerv', // Using the fixed index name from backend
        user_message: question,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const backendResponse = await response.json();
    
    // Transform backend response to match frontend expectations
    return {
      answer: backendResponse.ai_response,
      sources: [] // Backend doesn't return sources in current implementation
    };
  }

  private async getSummaryOnline(documentId: string, topic: string): Promise<{ summary: string }> {
    const response = await fetch(`${this.baseUrl}/api/get-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        index_name: 'nerv', // Using the fixed index name from backend
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async getContextualSummaryOnline(clickedNodeId: string, graphData: GraphData, indexName: string): Promise<{ summary: string }> {
    const response = await fetch(`${this.baseUrl}/api/get-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clicked_node_id: clickedNodeId,
        nodes: graphData.nodes.map(node => ({
          id: node.id,
          label: node.label,
          color: node.color || 'green' // Default to green if no color provided
        })),
        edges: graphData.edges.map(edge => ({
          source: edge.source,
          target: edge.target
        })),
        index_name: indexName
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async summarizeLegalDocumentOnline(file: File): Promise<{ summary: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/summarize-legal-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();