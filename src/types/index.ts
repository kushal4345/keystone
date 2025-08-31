/**
 * Core application types
 */

export interface GraphNode {
  id: string | number;
  label: string;
  level?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string | number;
  target: string | number;
  from?: number; // Keep for backward compatibility
  to?: number;   // Keep for backward compatibility
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'youtube';
  source: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ProcessDocumentResponse {
  documentId: string;
  title: string;
  status: 'success' | 'error';
  error?: string;
  graphData?: GraphData;
}

export interface AskQuestionResponse {
  answer: string;
  sources?: string[];
}