import React from 'react';
import { getBezierPath } from 'reactflow';

const CirclesConnection = (props) => {
  // Generate the Bezier path
  const {
    // connectionLineType,
    fromNode,
    // fromHandle,
    fromX: sourceX,
    fromY: sourceY,
    toX: targetX,
    toY: targetY,
    fromPosition: sourcePosition,
    toPosition: targetPosition,
    // connectionStatus
  } = props;
  const id = `temp-connection-${fromNode.id}`;

  const [
    edgePath,
    // labelX, labelY
  ] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const sourceNodeColor = fromNode.data.color;
  const targetNodeColor = '#000';

  const calculatePointsOnPath = (path, count) => {
    const length = path.getTotalLength();
    const points = [];
    for (let i = 0; i < count; i++) {
      const pointAtLength = path.getPointAtLength((i / count) * length);
      points.push({ x: pointAtLength.x + 6, y: pointAtLength.y });
    }
    return points;
  };
  // Create an SVG path element to use for calculations (not rendered)
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', edgePath);

  // Calculate points for circles
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const circleCount = Math.floor(distance / 12); // Example: one circle every 20px
  const circles = calculatePointsOnPath(pathElement, circleCount);
  const gradientId = `gradient-${id}`;

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop
            offset="0%"
            stopColor={sourceNodeColor}
          />
          <stop
            offset="100%"
            stopColor={targetNodeColor}
          />
        </linearGradient>
      </defs>
      {circles.map((circle, index) => (
        <circle
          key={index}
          className="edge-circle"
          cx={circle.x}
          cy={circle.y}
          r="4" // Circle radius
          fill={`url(#${gradientId})`} // Use the gradient for filling circles
          style={{ '--animation-delay': `${index * 50}ms` }}
        />
      ))}
    </>
  );
};

export default CirclesConnection;
