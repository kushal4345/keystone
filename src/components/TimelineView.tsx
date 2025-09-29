import React, { useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import type { GraphNode } from '@/types';

interface TimelineViewProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TimelineView({ isCollapsed = false, onToggleCollapse }: TimelineViewProps) {
  const { currentGraphData, selectedEventId, setSelectedEventId } = useApp();

  const timelineEvents = useMemo(() => {
    if (!currentGraphData?.nodes) return [];

    // Filter nodes that are events and have dates
    const eventNodes = currentGraphData.nodes.filter(
      (node): node is GraphNode & { properties: { date: string } } =>
        node.type === 'event' && node.properties?.date
    );

    // Sort events by date
    eventNodes.sort(
      (a, b) =>
        new Date(a.properties.date).getTime() -
        new Date(b.properties.date).getTime()
    );

    return eventNodes.map((node, index) => ({
      id: node.id.toString(),
      label: node.label,
      date: new Date(node.properties.date),
      details: node.properties.details || '',
      location: node.properties.location || '',
      dateString: new Date(node.properties.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [currentGraphData]);

  const handleEventClick = useCallback((eventId: string) => {
    // Toggle selection - if already selected, deselect
    setSelectedEventId(eventId === selectedEventId ? null : eventId);
  }, [selectedEventId, setSelectedEventId]);

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-gray-900 h-full flex flex-col">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-white">Document Timeline</h3>
            <span className="text-xs text-gray-400 ml-2">No events found</span>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
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
              <h4 className="text-xs font-medium text-gray-300 mb-1">No Timeline Events</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                This document doesn't contain any dated events or deadlines.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 h-full flex flex-col">
      <div className="px-3 py-2 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center min-w-0">
          <svg className="w-4 h-4 mr-1.5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-white mr-2 flex-shrink-0">Document Timeline</h3>
          <span className="text-xs text-gray-400 truncate">
            {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''} • Click to highlight
          </span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0 ml-2"
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
        <div className="flex-1 p-4 overflow-x-auto">
          <div className="relative min-w-max">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-600 via-yellow-400 to-gray-600"></div>
            
            {/* Timeline Events */}
            <div className="flex items-start space-x-8 relative">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="flex flex-col items-center min-w-0">
                  {/* Event Dot */}
                  <button
                    onClick={() => handleEventClick(event.id)}
                    className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      selectedEventId === event.id
                        ? 'bg-yellow-400 border-yellow-300 scale-125 shadow-lg shadow-yellow-400/50'
                        : 'bg-gray-700 border-gray-500 hover:bg-yellow-500 hover:border-yellow-400 hover:scale-110'
                    }`}
                  >
                    <div className={`absolute inset-1 rounded-full ${
                      selectedEventId === event.id ? 'bg-yellow-300' : 'bg-transparent'
                    }`}></div>
                  </button>
                  
                  {/* Event Content */}
                  <div className="mt-3 text-center max-w-32">
                    <div className={`text-xs font-medium mb-1 transition-colors ${
                      selectedEventId === event.id ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {event.dateString}
                    </div>
                    <div className={`text-xs font-medium mb-1 transition-colors ${
                      selectedEventId === event.id ? 'text-yellow-300' : 'text-gray-300'
                    }`}>
                      {event.label}
                    </div>
                    {event.details && (
                      <div className="text-xs text-gray-400 line-clamp-2">
                        {event.details}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
