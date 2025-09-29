/**
 * Core application types
 */

export interface GraphNode {
  id: string | number;
  label: string;
  level?: number;
  x?: number;
  y?: number;
  type?: string;
  color?: 'red' | 'yellow' | 'green';
  properties?: {
    date?: string;
    details?: string;
    location?: string;
    [key: string]: any;
  };
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

export interface Annotation {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt?: Date;
}

export type Annotations = {
  [targetId: string]: Annotation[];
};

export interface SelectedTarget {
  id: string;
  type: 'node' | 'edge';
  label?: string;
}