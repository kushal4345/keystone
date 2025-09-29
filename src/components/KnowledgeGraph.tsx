import { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { NodeContextMenu } from './NodeContextMenu';
import { useApp } from '@/context/AppContext';
import type { GraphData } from '@/types';

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeSelect?: (nodeId: string | number, nodeLabel: string) => void;
  onNodeExplain?: (nodeLabel: string) => void;
}

/**
 * Interactive knowledge graph visualization
 */
export function KnowledgeGraph({ data, onNodeSelect, onNodeExplain }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const { selectedEventId, setSelectedEventId, annotations, selectedTarget, setSelectedTarget } = useApp();
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string | number | null;
    nodeLabel: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    nodeLabel: '',
  });

  const handleNodeClick = useCallback((nodeId: string | number, nodeLabel: string) => {
    // Automatically explain the node when clicked
    if (onNodeExplain) {
      onNodeExplain(`Explain ${nodeLabel} in detail based on the document content.`);
    }

    // Also trigger the old callback for backward compatibility
    if (onNodeSelect) {
      onNodeSelect(nodeId, nodeLabel);
    }
  }, [onNodeSelect, onNodeExplain]);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      data.nodes.map(node => {
        const isSelectedEvent = selectedEventId && node.id.toString() === selectedEventId;
        const isEventNode = node.type === 'event';
        const hasAnnotations = annotations[node.id.toString()]?.length > 0;
        const isSelectedTarget = selectedTarget?.id === node.id.toString() && selectedTarget?.type === 'node';
        
        // Determine node colors based on API color property or fallback to level-based colors
        const nodeBackgroundColor = isSelectedEvent ? '#FF6B35' : 
                                   isSelectedTarget ? '#8B5CF6' :
                                   node.color ? node.color : getKeystoneNodeColor(node.level || 0);
        
        // Determine font color based on background color for better readability
        const fontColor = node.color && (node.color === 'red' || node.color === 'green') ? '#FFFFFF' : 
                         node.color === 'yellow' ? '#000000' : '#FFFFFF';
        
        return {
          id: node.id,
          label: node.label,
          level: node.level,
          type: node.type,
          color: {
            background: nodeBackgroundColor,
            border: isSelectedEvent ? '#FF4500' : 
                   isSelectedTarget ? '#7C3AED' :
                   hasAnnotations ? '#10B981' :
                   (isEventNode ? '#D4AF37' : getKeystoneBorderColor(node.level || 0)),
            highlight: {
              background: '#FFD700', // Keystone gold highlight
              border: '#D4AF37',
            },
            hover: {
              background: node.color ? node.color : getKeystoneHoverColor(node.level || 0),
              border: '#D4AF37',
            }
          },
          font: {
            size: 14,
            color: fontColor,
            face: 'Inter, sans-serif',
            bold: '600',
          },
          shape: isEventNode ? 'diamond' : 'hexagon',
          size: isSelectedEvent ? 40 : (25 + (3 - (node.level || 0)) * 8),
          borderWidth: isSelectedEvent ? 4 : 3,
          shadow: {
            enabled: true,
            color: isSelectedEvent ? 'rgba(255, 107, 53, 0.5)' : 'rgba(212, 175, 55, 0.3)',
            size: isSelectedEvent ? 12 : 8,
            x: 3,
            y: 3,
          },
          chosen: true
        };
      })
    );

        const edges = new DataSet(
      data.edges.map((edge, index) => {
        const edgeId = `edge-${edge.source}-${edge.target}`;
        const hasAnnotations = annotations[edgeId]?.length > 0;
        const isSelectedTarget = selectedTarget?.id === edgeId && selectedTarget?.type === 'edge';
        
        return {
          id: index,
          from: edge.from ?? edge.source,
          to: edge.to ?? edge.target,
          edgeId: edgeId, // Store for click handling
          color: { 
            color: isSelectedTarget ? '#8B5CF6' : 
                   hasAnnotations ? '#10B981' : '#666666',
            highlight: '#D4AF37',
            hover: '#FFD700',
            opacity: 0.8
          },
          width: 3,
          smooth: { 
            enabled: true,
            type: 'dynamic',
            roundness: 0.3,
            forceDirection: 'none'
          },
          arrows: {
            to: { 
              enabled: true, 
              scaleFactor: 1.2,
              type: 'arrow'
            },
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.1)',
            size: 3,
            x: 1,
            y: 1,
          }
        };
      })
    );

    const options = {
      layout: {
        improvedLayout: true,
        clusterThreshold: 150,
        hierarchical: {
          enabled: false, // Disable rigid hierarchy
        },
        randomSeed: 42, // Consistent layout
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 25,
          onlyDynamicEdges: false,
          fit: true
        },
        barnesHut: {
          gravitationalConstant: -8000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: 'barnesHut',
        timestep: 0.35,
        adaptiveTimestep: true
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: true,
        dragNodes: true,
        dragView: true,
        zoomView: true,
        multiselect: false,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          speed: { x: 10, y: 10, zoom: 0.02 },
          bindToWindow: false
        }
      },
      nodes: {
        borderWidth: 3,
        scaling: {
          min: 20,
          max: 40,
          label: {
            enabled: true,
            min: 14,
            max: 20,
            maxVisible: 30,
            drawThreshold: 5
          }
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      },
      edges: {
        scaling: {
          min: 1,
          max: 5,
          label: {
            enabled: false
          }
        },
        selectionWidth: 2,
        hoverWidth: 1.5
      },
      configure: {
        enabled: false
      }
    };

    const network = new Network(containerRef.current, { nodes: nodes as any, edges: edges as any }, options);
    networkRef.current = network;

    // Handle node interactions
    let hoverTimeout: NodeJS.Timeout | null = null;

    // Enhanced hover effects
    network.on('hoverNode', (event) => {
      const nodeId = event.node;
      const node = data.nodes.find(n => n.id === nodeId);

      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const canvasPosition = network.canvasToDOM({ x: event.pointer.canvas.x, y: event.pointer.canvas.y });

        // Clear existing timeout
        if (hoverTimeout) clearTimeout(hoverTimeout);

        // Show context menu after short delay
        hoverTimeout = setTimeout(() => {
          setContextMenu({
            visible: true,
            x: rect.left + canvasPosition.x,
            y: rect.top + canvasPosition.y - 10,
            nodeId: nodeId,
            nodeLabel: node.label,
          });
        }, 300); // Reduced delay for better responsiveness

        // Change cursor
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      }
    });

    network.on('blurNode', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      // Hide context menu with small delay to prevent flickering
      setTimeout(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }, 100);

      // Reset cursor
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    });

    // Handle clicks for RAG requests, event selection, and annotations
    network.on('click', (event) => {
      setContextMenu(prev => ({ ...prev, visible: false }));

      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        const node = data.nodes.find(n => n.id === nodeId);
        if (node) {
          // Set selected target for annotations
          setSelectedTarget({
            id: nodeId.toString(),
            type: 'node',
            label: node.label
          });

          // If it's an event node, update the selected event
          if (node.type === 'event') {
            setSelectedEventId(nodeId.toString() === selectedEventId ? null : nodeId.toString());
          }
          
          // Also trigger the regular node click behavior
          handleNodeClick(nodeId, node.label);
        }
      } else if (event.edges.length > 0) {
        const edgeIndex = event.edges[0];
        const edgeData = edges.get(edgeIndex);
        if (edgeData) {
          // Set selected target for edge annotations
          setSelectedTarget({
            id: edgeData.edgeId,
            type: 'edge',
            label: `Edge: ${edgeData.from} → ${edgeData.to}`
          });
        }
      } else {
        // Clicked on empty space, deselect everything
        setSelectedEventId(null);
        setSelectedTarget(null);
      }
    });

    // Handle double-click for zoom to node
    network.on('doubleClick', (event) => {
      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        network.focus(nodeId, {
          scale: 1.5,
          animation: {
            duration: 800,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    });

    // Fit the network initially
    network.once('stabilizationIterationsDone', () => {
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      });
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [data, onNodeSelect, selectedEventId, annotations, selectedTarget]);

  // Effect to handle selectedEventId changes from timeline
  useEffect(() => {
    if (!networkRef.current || !data.nodes) return;

    // Update node appearance based on selection
    const updatedNodes = data.nodes.map(node => {
      const isSelectedEvent = selectedEventId && node.id.toString() === selectedEventId;
      const isEventNode = node.type === 'event';
      
      // Use node color if available, otherwise fallback to level-based colors
      const nodeBackgroundColor = isSelectedEvent ? '#FF6B35' : 
                                 node.color ? node.color : getKeystoneNodeColor(node.level || 0);
      
      return {
        id: node.id,
        color: {
          background: nodeBackgroundColor,
          border: isSelectedEvent ? '#FF4500' : (isEventNode ? '#D4AF37' : getKeystoneBorderColor(node.level || 0)),
        },
        size: isSelectedEvent ? 40 : (25 + (3 - (node.level || 0)) * 8),
        borderWidth: isSelectedEvent ? 4 : 3,
        shadow: {
          enabled: true,
          color: isSelectedEvent ? 'rgba(255, 107, 53, 0.5)' : 'rgba(212, 175, 55, 0.3)',
          size: isSelectedEvent ? 12 : 8,
          x: 3,
          y: 3,
        }
      };
    });

    // Update the network
    const nodesDataSet = networkRef.current.body.data.nodes as DataSet<any>;
    nodesDataSet.update(updatedNodes);

    // Focus on selected event node if one is selected
    if (selectedEventId) {
      networkRef.current.focus(selectedEventId, {
        scale: 1.2,
        animation: {
          duration: 800,
          easingFunction: 'easeInOutQuad'
        }
      });
    }
  }, [selectedEventId, data.nodes]);

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
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        onMouseLeave={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        style={{
          background: '#000000',
        }}
      />

      {/* Graph Controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => networkRef.current?.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } })}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs rounded transition-colors"
        >
          Fit View
        </button>
        <button
          onClick={() => {
            if (networkRef.current) {
              const scale = networkRef.current.getScale();
              networkRef.current.moveTo({ scale: scale * 1.2 });
            }
          }}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs rounded transition-colors"
        >
          Zoom In
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-gray-400 text-xs">
        <p className="bg-black/80 px-3 py-1 rounded">
          Click nodes to explore • Drag to move • Double-click to focus
        </p>
      </div>

      <NodeContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        nodeLabel={contextMenu.nodeLabel}
        onGenerateQuiz={handleGenerateQuiz}
        onCreateFlashcards={handleCreateFlashcards}
      />
    </div>
  );
}

// Keystone-themed color functions
function getKeystoneNodeColor(level: number): string {
  const colors = [
    '#D4AF37', // Level 0: Gold
    '#B8860B', // Level 1: Dark goldenrod
    '#CD853F', // Level 2: Peru
    '#A0522D', // Level 3: Sienna
  ];
  return colors[Math.min(level, colors.length - 1)];
}

function getKeystoneBorderColor(level: number): string {
  const colors = [
    '#B8860B', // Level 0: Dark goldenrod
    '#8B7355', // Level 1: Dark khaki
    '#8B4513', // Level 2: Saddle brown
    '#654321', // Level 3: Dark brown
  ];
  return colors[Math.min(level, colors.length - 1)];
}

function getKeystoneHoverColor(level: number): string {
  const colors = [
    '#FFD700', // Level 0: Bright gold
    '#DAA520', // Level 1: Goldenrod
    '#DEB887', // Level 2: Burlywood
    '#BC8F8F', // Level 3: Rosy brown
  ];
  return colors[Math.min(level, colors.length - 1)];
}