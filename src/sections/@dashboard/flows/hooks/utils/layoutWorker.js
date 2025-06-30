/**
 * Force-directed refinement using a basic physics simulation.
 */
self.onmessage = (event) => {
  const { positions, edges } = event.data;
  const forces = { repulsion: 8000, attraction: 0.5 };
  const iterations = 500;

  // Convert positions object to mutable format
  const mutablePositions = { ...positions };

  // Perform force-directed layout
  for (let i = 0; i < iterations; i++) {
    // Repulsion
    Object.keys(mutablePositions).forEach((nodeA) => {
      Object.keys(mutablePositions).forEach((nodeB) => {
        if (nodeA === nodeB) return;

        const posA = mutablePositions[nodeA];
        const posB = mutablePositions[nodeB];
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distSq = dx * dx + dy * dy || 1; // Avoid division by zero
        const repulsion = forces.repulsion / distSq;

        posA.x += (dx / Math.sqrt(distSq)) * repulsion;
        posA.y += (dy / Math.sqrt(distSq)) * repulsion;
        posB.x -= (dx / Math.sqrt(distSq)) * repulsion;
        posB.y -= (dy / Math.sqrt(distSq)) * repulsion;
      });
    });

    // Attraction
    edges.forEach(({ sources, targets }) => {
      const source = sources[0];
      const target = targets[0];

      const posA = mutablePositions[source];
      const posB = mutablePositions[target];
      if (!posA || !posB) return;

      const dx = posA.x - posB.x;
      const dy = posA.y - posB.y;
      const distSq = dx * dx + dy * dy || 1;
      const attraction = forces.attraction * Math.sqrt(distSq);

      posA.x -= (dx / Math.sqrt(distSq)) * attraction;
      posA.y -= (dy / Math.sqrt(distSq)) * attraction;
      posB.x += (dx / Math.sqrt(distSq)) * attraction;
      posB.y += (dy / Math.sqrt(distSq)) * attraction;
    });
  }

  // Return refined positions
  self.postMessage({ refinedPositions: mutablePositions });
};
