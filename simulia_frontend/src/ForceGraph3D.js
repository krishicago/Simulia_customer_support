import React, { useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";

export default function Graph3D() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Fetch the raw graph data from your Flask API
    // We'll use a special endpoint that returns all nodes and links
    fetch("/api/graph-data")
      .then((res) => res.json())
      .then((data) => {
        // Expect data = { nodes: [{ id, group }], links: [{ source, target, value }] }
        setGraphData(data);
      })
      .catch(console.error);
  }, []);

  return (
    <ForceGraph3D
      graphData={graphData}
      nodeAutoColorBy="group"
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      linkWidth={1}
      nodeLabel="id"
      linkLabel="value"
      width={800}
      height={600}
    />
  );
}
