// src/components/GraphVisualizer.js
import React, { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export const GraphVisualizer = ({ graphData, activeTier }) => {
  const fgRef = useRef();

  useEffect(() => {
    // Highlight nodes related to activeTier
    if (fgRef.current && activeTier) {
      const graph = fgRef.current;
      
      // Reset all nodes first
      graph.nodeColor(node => 
        node.group === 'Tier' 
          ? node.id === 'Basic' 
            ? '#4299E1' 
            : node.id === 'Standard' 
              ? '#38B2AC' 
              : '#805AD5'
          : node.group === 'Feature' 
            ? '#F6AD55' 
            : node.group === 'Limitation' 
              ? '#FC8181' 
              : '#68D391'
      );
      
      // If a tier is active, highlight its nodes
      if (activeTier) {
        // Find all links connected to the active tier
        const connectedLinks = graphData.links.filter(link => 
          (typeof link.source === 'object' ? link.source.id : link.source) === activeTier || 
          (typeof link.target === 'object' ? link.target.id : link.target) === activeTier
        );
        
        // Get IDs of all connected nodes
        const connectedNodes = new Set();
        connectedNodes.add(activeTier);
        
        connectedLinks.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          connectedNodes.add(sourceId);
          connectedNodes.add(targetId);
        });
        
        // Highlight connected nodes
        graph.nodeColor(node => 
          connectedNodes.has(node.id) 
            ? node.group === 'Tier' 
              ? node.id === 'Basic' 
                ? '#4299E1' 
                : node.id === 'Standard' 
                  ? '#38B2AC' 
                  : '#805AD5'
              : node.group === 'Feature' 
                ? '#F6AD55' 
                : node.group === 'Limitation' 
                  ? '#FC8181' 
                  : '#68D391'
            : '#E2E8F0' // Dim unrelated nodes
        );
      }
    }
  }, [graphData, activeTier]);

  // Handle node click
  const handleNodeClick = node => {
    if (fgRef.current) {
      // Focus on the node
      const distance = 80;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1000
      );
    }
  };

  return (
    <div className="h-full w-full relative">
      {graphData.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No graph data available
        </div>
      ) : (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label"
          nodeColor={node => node.color}
          nodeRelSize={6}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          linkLabel="label"
          onNodeClick={handleNodeClick}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          backgroundColor="#f8fafc"
          showNavInfo={false}
        />
      )}
      
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Node Types</h3>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-xs">Basic Tier</span>
          </li>
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-teal-500 mr-2"></span>
            <span className="text-xs">Standard Tier</span>
          </li>
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
            <span className="text-xs">Premium Tier</span>
          </li>
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></span>
            <span className="text-xs">Features</span>
          </li>
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-400 mr-2"></span>
            <span className="text-xs">Limitations</span>
          </li>
          <li className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-400 mr-2"></span>
            <span className="text-xs">Support Options</span>
          </li>
        </ul>
        <div className="mt-3 text-xs text-gray-500">
          Click a node to focus on it
        </div>
      </div>
    </div>
  );
};