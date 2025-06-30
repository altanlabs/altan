import { m } from 'framer-motion';
import React, { memo, useCallback, useMemo } from 'react';
import { getBezierPath } from 'reactflow';

import './index.css';
import EdgeFilterRenderer from './menus/EdgeFilterRenderer.jsx';

const calculatePointsOnPath = (path, count) => {
  const length = path.getTotalLength();
  const points = [];
  for (let i = 0; i < count; i++) {
    const pointAtLength = path.getPointAtLength((i / count) * length);
    points.push({ x: pointAtLength.x + 6, y: pointAtLength.y });
  }
  return points;
};

const CircleEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  style = null,
}) => {
  // Generate the Bezier path

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const {
    sourceNodeColor,
    targetNodeColor,
    isRouteCondition,
    isDefault,
    condition,
    targetId,
    sourceId,
  } = useMemo(() => data || { sourceNodeColor: '#555', targetNodeColor: '#000' }, [data]);
  const enableFilter = useMemo(
    () => !data.isDefault && !data.after && !data.isConditionDisabled,
    [data.after, data.isConditionDisabled, data.isDefault],
  );

  // Create an SVG path element to use for calculations (not rendered)
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', edgePath);

  // Calculate points for circles
  const circles = useMemo(() => {
    const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
    const circleCount = Math.floor(distance / 12); // Example: one circle every 20px
    return calculatePointsOnPath(pathElement, circleCount);
  }, [pathElement, sourceX, sourceY, targetX, targetY]);

  const gradientId = `gradient-${id}`;

  const midleCircleIndex = Math.floor(circles.length / 2);
  const midCircle = circles[midleCircleIndex] || null;

  const renderCircle = useCallback(
    (circle, index) =>
      (!enableFilter || index !== midleCircleIndex) && (
        <m.circle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          key={`${index}_${selected}`}
          className="edge-circle"
          cx={circle.x}
          cy={circle.y}
          r="4" // Circle radius
          fill={`url(#${gradientId})`} // Use the gradient for filling circles
          style={{
            '--animation-delay': `${index * 50}ms`,
            ...(style ?? {}),
            ...(selected && {
              opacity: 1,
            }),
          }}
        />
      ),
    [enableFilter, gradientId, midleCircleIndex, selected, style],
  );

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
      {circles.map(renderCircle)}
      <EdgeFilterRenderer
        id={id}
        isRouteCondition={isRouteCondition}
        isDefault={isDefault}
        sourceId={sourceId}
        targetId={targetId}
        condition={condition}
        data={data}
        midCircle={midCircle}
      />
    </>
  );
};

export default memo(CircleEdge);

/**
 *
 * const [editingText, setEditingText] = useState(false);
  const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
    if (!!description) {
      setNewDescription(description);
    }
  }, [description]);

  const showDescription = !!(description?.length || editingText);

  <foreignObject
        x={midCircle.x - ((!showDescription || editingText) ? 0 : 100)}
        y={midCircle.y - 35}
        width={!showDescription ? 30 : (editingText ? 400 : 200)}
        height={editingText ? 70 : 30}
        style={{
          zIndex: 10001
        }}
      >
  <Stack
    direction="row"
    spacing={1}
    width="100%"
    alignItems="center"
    sx={{
      opacity: 0.5,
      '&:hover': {
        opacity: 1,
        '& .editbutton': {
          opacity: 1
        }
      },
      transition: 'opacity 300ms ease',
      borderRadius: 2,
      ...(!!editingText && bgBlur({ opacity: 0.5 }))
    }}
  >
    {
      showDescription && (
        editingText ? (
          <TextField
            multiline
            label="Add a description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            fullWidth
            size="small"
          />
        ) : (
          <Typography
            variant="body2"
          >
            { description }
          </Typography>
        )
      )
    }
    <IconButton
      size="small"
      className="editbutton"
      sx={{
        opacity: 0.2
      }}
      onClick={
        () => {
          if (!editingText) {
            setEditingText(true);
          } else {
            // save
          }
        }
      }
    >
      <Iconify
        icon={editingText ? "mdi:tick" : "mdi:edit"}
      />
    </IconButton>
    {
      !!editingText && (
        <IconButton
          size="small"
          onClick={
            () => {
              setEditingText(false);
              setNewDescription('');
            }
          }
        >
          <Iconify
            icon="mdi:close"
          />
        </IconButton>
      )
    }
  </Stack>
*/
