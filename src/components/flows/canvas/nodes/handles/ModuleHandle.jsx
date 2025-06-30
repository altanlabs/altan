// import { Tooltip } from '@mui/material';
import { m } from 'framer-motion';
import React, { memo, useMemo } from 'react';
import { getConnectedEdges, Handle, useNodeId, useStore } from 'reactflow';

const selector = (s) => ({
  nodeInternals: s.nodeInternals,
  edges: s.edges,
});

const ModuleHandle = (props) => {
  const { nodeInternals, edges } = useStore(selector);
  const nodeId = useNodeId();
  const {
    id: handleId,
    type: handleType,
    isConnectableEnd,
    isConnectableStart,
    children,
    highlighted,
    style,
    ...restProps
  } = props;

  const node = nodeInternals.get(nodeId);
  const connectedEdges = getConnectedEdges([node], edges);

  // TODO: opacity based on connected edges

  const { isHandleConnectableEnd, isHandleConnectableStart } = useMemo(() => {
    const isHandleConnectable = {
      isHandleConnectableEnd: typeof isConnectableEnd === 'boolean' && !!isConnectableEnd,
      isHandleConnectableStart: false,
    };

    if (typeof isConnectableStart === 'number' && handleType === 'source') {
      isHandleConnectable.isHandleConnectableStart =
        connectedEdges.filter((e) => e.sourceHandle === handleId).length < isConnectableStart;
    }

    if (typeof isConnectableEnd === 'number' && handleType === 'target') {
      isHandleConnectable.isHandleConnectableEnd =
        connectedEdges.filter((e) => e.targetHandle === handleId).length < isConnectableEnd;
    }

    return isHandleConnectable;
  }, [isConnectableEnd, isConnectableStart, handleType, connectedEdges, handleId]);

  return (
    <Handle
      id={handleId}
      type={handleType}
      component={m.span}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut', delay: 0.75 }}
      isConnectableEnd={isHandleConnectableEnd}
      isConnectableStart={isHandleConnectableStart}
      style={{
        ...style,
        position: 'relative',
      }}
      {...restProps}
    >
      {children}
      {/* {
        !!children && (
          <Tooltip
            open={!!(highlighted && isHandleConnectableStart)}
            title="Click to add new module!"
            placement='right'
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  pointerEvents: 'none',
                  // position: 'absolute',
                  // right: 0,
                  // top: 0,
                }
              },
              popper: {
                sx: {
                  zIndex: 0,
                  background: 'transparent'
                },
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, 20],
                    },
                  },
                ],
              }
            }}
          >
            { children }
          </Tooltip>
        )
      } */}
    </Handle>
  );
};

export default memo(ModuleHandle);
