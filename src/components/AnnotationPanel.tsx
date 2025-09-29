import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Edit2, Trash2, Plus, User, Clock } from 'lucide-react';

/**
 * Annotation panel for viewing and managing comments on graph nodes and edges
 */
export function AnnotationPanel() {
  const { 
    selectedTarget, 
    annotations, 
    addAnnotation, 
    editAnnotation, 
    deleteAnnotation 
  } = useApp();
  
  const [newCommentText, setNewCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [authorName, setAuthorName] = useState('Legal Analyst'); // Default author

  const targetAnnotations = selectedTarget ? annotations[selectedTarget.id] || [] : [];

  const handleAddComment = () => {
    if (!selectedTarget || !newCommentText.trim()) return;

    addAnnotation(selectedTarget.id, newCommentText.trim(), authorName);
    setNewCommentText('');
  };

  const handleEditComment = (annotationId: string) => {
    if (!selectedTarget || !editText.trim()) return;

    editAnnotation(selectedTarget.id, annotationId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteComment = (annotationId: string) => {
    if (!selectedTarget) return;
    deleteAnnotation(selectedTarget.id, annotationId);
  };

  const startEditing = (annotation: any) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedTarget) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-base font-semibold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
            Annotations
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Select a node or edge to view comments
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-sm font-medium text-gray-300 mb-2">No Selection</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click on any node or edge in the knowledge graph to view and add comments for collaborative analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-base font-semibold text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
          Annotations
        </h3>
        <p className="text-sm text-gray-400 mt-0.5">
          {selectedTarget.type === 'node' ? 'Node' : 'Edge'}: {selectedTarget.label || selectedTarget.id}
        </p>
        <div className="text-xs text-yellow-400 mt-1">
          {targetAnnotations.length} comment{targetAnnotations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {targetAnnotations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No comments yet</p>
            <p className="text-xs text-gray-500">Be the first to add a comment!</p>
          </div>
        ) : (
          targetAnnotations.map((annotation) => (
            <div key={annotation.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <User size={12} className="text-black" />
                  </div>
                  <span className="text-xs font-medium text-gray-300">{annotation.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock size={10} />
                    <span>{formatDate(annotation.createdAt)}</span>
                    {annotation.editedAt && <span className="text-gray-600">(edited)</span>}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditing(annotation)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 size={12} className="text-gray-400 hover:text-yellow-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(annotation.id)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              {editingId === annotation.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(annotation.id)}
                      className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {annotation.text}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Section */}
      <div className="border-t border-gray-700 p-4 space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="flex-1 px-3 py-1 text-xs bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>
        
        <div className="space-y-2">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full p-3 text-sm bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none resize-none"
            rows={3}
            placeholder="Add a comment about this element..."
          />
          <button
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-yellow-500 text-black font-medium text-sm rounded hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            <span>Add Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
