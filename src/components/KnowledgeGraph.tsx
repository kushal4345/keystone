import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { NodeContextMenu } from './NodeContextMenu';
import type { GraphData, GraphNode } from '@/types';

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeSelect?: (nodeId: number, nodeLabel: string) => void;
}

/**
 * Interactive knowledge graph visualization
 */
export function KnowledgeGraph({ data, onNodeSelect }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: number | null;
    nodeLabel: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    nodeLabel: '',
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        level: node.level,
        color: {
          background: getLevelColor(node.level || 0),
          border: getLevelBorderColor(node.level || 0),
          highlight: {
            background: getHighlightColor(node.level || 0),
            border: getLevelBorderColor(node.level || 0),
          }
        },
        font: {
          size: 14,
          color: '#374151',
          face: 'Inter, sans-serif',
        },
        shape: 'dot',
        size: 20 + (3 - (node.level || 0)) * 5,
      }))
    );

    const edges = new DataSet(
      data.edges.map(edge => ({
        from: edge.from ?? edge.source,
        to: edge.to ?? edge.target,
        color: { color: '#9CA3AF', highlight: '#4F46E5' },
        width: 2,
        smooth: { type: 'continuous', roundness: 0.2 },
      }))
    );

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          levelSeparation: 100,
          nodeSpacing: 100,
          treeSpacing: 200,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          direction: 'UD',
          sortMethod: 'directed',
        },
      },
      physics: {
        enabled: false,
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
      },
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 5,
          x: 2,
          y: 2,
        },
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 0.8 },
        },
      },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    // Handle node hover
    let hoverTimeout: NodeJS.Timeout | null = null;

    network.on('hoverNode', (event) => {
      const nodeId = event.node;
      const node = data.nodes.find(n => n.id === nodeId);
      
      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const canvasPosition = network.canvasToDOM({ x: event.pointer.canvas.x, y: event.pointer.canvas.y });
        
        if (hoverTimeout) clearTimeout(hoverTimeout);
        
        hoverTimeout = setTimeout(() => {
          setContextMenu({
            visible: true,
            x: rect.left + canvasPosition.x,
            y: rect.top + canvasPosition.y,
            nodeId: nodeId,
            nodeLabel: node.label,
          });
        }, 500);
      }
    });

    network.on('blurNode', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      setContextMenu(prev => ({ ...prev, visible: false }));
    });

    network.on('click', (event) => {
      setContextMenu(prev => ({ ...prev, visible: false }));
      
      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        const node = data.nodes.find(n => n.id === nodeId);
        if (node && onNodeSelect) {
          onNodeSelect(nodeId, node.label);
        }
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [data, onNodeSelect]);

  const handleGenerateQuiz = () => {
    if (contextMenu.nodeId && onNodeSelect) {
      onNodeSelect(contextMenu.nodeId, `Generate a quiz about: ${contextMenu.nodeLabel}`);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCreateFlashcards = () => {
    if (contextMenu.nodeId && onNodeSelect) {
      onNodeSelect(contextMenu.nodeId, `Create flashcards for: ${contextMenu.nodeLabel}`);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gray-50 rounded-lg"
        onMouseLeave={() => setContextMenu(prev => ({ ...prev, visible: false }))}
      />
      
      <NodeContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        nodeLabel={contextMenu.nodeLabel}
        onGenerateQuiz={handleGenerateQuiz}
        onCreateFlashcards={handleCreateFlashcards}
      />
    </>
  );
}

// Helper functions for node styling
function getLevelColor(level: number): string {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  return colors[Math.min(level, colors.length - 1)];
}

function getLevelBorderColor(level: number): string {
  const colors = ['#1D4ED8', '#059669', '#D97706', '#DC2626'];
  return colors[Math.min(level, colors.length - 1)];
}

function getHighlightColor(level: number): string {
  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];
  return colors[Math.min(level, colors.length - 1)];
}