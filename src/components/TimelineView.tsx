import React, { useMemo, useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { GraphNode } from '@/types';

interface TimelineViewProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export function TimelineView({ isCollapsed = false, onToggleCollapse, onNodeHover }: TimelineViewProps) {
  const { currentGraphData, selectedEventId, setSelectedEventId } = useApp();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const timelineItems = useMemo(() => {
    if (!currentGraphData?.nodes) return [];

    // Show all nodes, not just events
    const allNodes = currentGraphData.nodes.map((node, index) => ({
      id: node.id.toString(),
      label: node.label,
      type: node.type || 'node',
      color: node.color || 'green',
      level: node.level || 0,
      hasDate: !!(node.properties?.date),
      date: node.properties?.date ? new Date(node.properties.date) : null,
      details: node.properties?.details || '',
      location: node.properties?.location || '',
      dateString: node.properties?.date ? new Date(node.properties.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : null,
      sortOrder: node.properties?.date ? new Date(node.properties.date).getTime() : index * 1000
    }));

    // Sort by date if available, otherwise by original order
    allNodes.sort((a, b) => a.sortOrder - b.sortOrder);

    return allNodes;
  }, [currentGraphData]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500 border-red-400';
      case 'yellow': return 'bg-yellow-500 border-yellow-400';
      case 'green': return 'bg-green-500 border-green-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '⏰';
      case 'entity': return '🏢';
      case 'clause': return '📄';
      case 'document': return '📋';
      default: return '●';
    }
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedEventId(nodeId === selectedEventId ? null : nodeId);
  }, [selectedEventId, setSelectedEventId]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
    if (onNodeHover) {
      onNodeHover(nodeId);
    }
  }, [onNodeHover]);

  if (timelineItems.length === 0) {
    return (
      <div className="bg-black h-full flex flex-col">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-white">Document Timeline</h3>
            <span className="text-xs text-gray-400 ml-2">No nodes found</span>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-xs">
              <div className="text-gray-500 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xs font-medium text-gray-300 mb-1">No Timeline Items</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                This document doesn't contain any nodes to display.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black h-full flex flex-col">
      <div className="px-3 py-2 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center min-w-0">
          <svg className="w-4 h-4 mr-1.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-white mr-2 flex-shrink-0">Document Timeline</h3>
          <span className="text-xs text-gray-400 truncate">
            {timelineItems.length} node{timelineItems.length !== 1 ? 's' : ''} • Hover to highlight
          </span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-800 rounded transition-colors flex-shrink-0 ml-2"
          >
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {timelineItems.map((item) => (
              <div
                key={item.id}
                className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedEventId === item.id
                    ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-400/20'
                    : hoveredNodeId === item.id
                    ? 'bg-gray-800 border-gray-600 shadow-md'
                    : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                }`}
                onClick={() => handleNodeClick(item.id)}
                onMouseEnter={() => handleNodeHover(item.id)}
                onMouseLeave={() => handleNodeHover(null)}
              >
                <div className="flex items-start space-x-3">
                  {/* Color indicator and type icon */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full border ${getColorClasses(item.color)}`}></div>
                    <span className="text-sm">{getTypeIcon(item.type)}</span>
                  </div>
                  
                  {/* Node content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium truncate ${
                        selectedEventId === item.id ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {item.label}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.type === 'event' ? 'bg-blue-500/20 text-blue-300' :
                        item.type === 'entity' ? 'bg-purple-500/20 text-purple-300' :
                        item.type === 'clause' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    
                    {item.dateString && (
                      <div className="text-xs text-gray-400 mt-1">
                        📅 {item.dateString}
                      </div>
                    )}
                    
                    {item.details && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.details}
                      </div>
                    )}
                    
                    {item.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {item.location}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hover indicator */}
                <div className={`absolute inset-0 rounded-lg border-2 pointer-events-none transition-opacity duration-200 ${
                  hoveredNodeId === item.id ? 'opacity-100 border-yellow-400' : 'opacity-0'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}