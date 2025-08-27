import React from 'react';
import { Brain, BookOpen } from 'lucide-react';

interface NodeContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  nodeLabel: string;
  onGenerateQuiz: () => void;
  onCreateFlashcards: () => void;
}

/**
 * Context menu that appears on node hover
 */
export function NodeContextMenu({ 
  visible, 
  x, 
  y, 
  nodeLabel, 
  onGenerateQuiz, 
  onCreateFlashcards 
}: NodeContextMenuProps) {
  if (!visible) return null;

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] animate-in fade-in-0 duration-200"
      style={{ left: x + 20, top: y - 50 }}
    >
      <div className="px-3 py-1 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate" title={nodeLabel}>
          {nodeLabel}
        </p>
      </div>
      
      <div className="py-1">
        <button
          onClick={onGenerateQuiz}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <Brain size={16} />
          <span>Generate Quiz</span>
        </button>
        
        <button
          onClick={onCreateFlashcards}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        >
          <BookOpen size={16} />
          <span>Create Flashcards</span>
        </button>
      </div>
    </div>
  );
}