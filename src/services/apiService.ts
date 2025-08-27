import type { GraphData, ProcessDocumentResponse, AskQuestionResponse } from '@/types';

/**
 * API service abstraction layer
 * Handles routing between offline (Electron IPC) and online (HTTP) modes
 */
class ApiService {
  private isOnline: boolean = false;
  private baseUrl: string = 'http://127.0.0.1:8000';

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
      if (this.isOnline) {
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
      if (this.isOnline) {
        return this.askQuestionOnline(documentId, question);
      } else {
        return this.askQuestionOffline(documentId, question);
      }
    } catch (error) {
      console.error('Question answering error:', error);
      throw new Error('Failed to get answer');
    }
  }

  // Private methods for offline mode (Electron IPC)

  private async processDocumentOffline(source: File | string): Promise<ProcessDocumentResponse> {
    let filePath: string;

    if (typeof source === 'string') {
      // Handle YouTube URL
      throw new Error('YouTube processing not implemented in offline mode');
    } else {
      // Handle file upload
      filePath = source.path || source.name;
    }

    const result = await window.electronAPI.processDocument(filePath);
    return result;
  }

  private async fetchGraphDataOffline(documentId: string): Promise<GraphData> {
    return window.electronAPI.fetchGraphData(documentId);
  }

  private async askQuestionOffline(documentId: string, question: string): Promise<AskQuestionResponse> {
    return window.electronAPI.askQuestion(documentId, question);
  }

  // Private methods for online mode (HTTP API)

  private async processDocumentOnline(source: File | string): Promise<ProcessDocumentResponse> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      // YouTube URL
      formData.append('url', source);
      formData.append('type', 'youtube');
    } else {
      // File upload
      formData.append('file', source);
      formData.append('type', 'pdf');
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async fetchGraphDataOnline(documentId: string): Promise<GraphData> {
    const response = await fetch(`${this.baseUrl}/api/graph/${documentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async askQuestionOnline(documentId: string, question: string): Promise<AskQuestionResponse> {
    const response = await fetch(`${this.baseUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        question,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();