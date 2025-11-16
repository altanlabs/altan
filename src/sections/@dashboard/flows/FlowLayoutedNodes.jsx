import { isEqual, isObject, transform } from 'lodash';
import { useEffect, useCallback, useState, useMemo, memo } from 'react';
import { useReactFlow } from 'reactflow';

import { getLayoutedNodes, getNodeDimensions } from './hooks/utils/index.ts';
import ControlPanel from '../../../components/control-panel/ControlPanel.jsx';
import { useSettingsContext } from '../../../components/settings/SettingsContext.jsx';
import { setInitializedNodes } from '../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../redux/store.ts';

// elk layouting options can be found here:
// https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html

const getNodesToSet = (initialNodes, sourceHandles) => {
  // console.log("@useLayoutNodes (nodesToSet): rerender");
  const noSourceModules = new Set();
  let changesMade = true;

  while (changesMade) {
    changesMade = false;

    for (const [nodeId, n] of initialNodes) {
      // const nodeId = n.id;
      const previousNodeId = n.data.previousId;
      const moduleType = n.data.module?.type;

      // Determine if the current node should be marked as 'no source'
      const isPreviousNoSource = Array.isArray(previousNodeId)
        ? previousNodeId.every((prevId) => noSourceModules.has(prevId)) // All previous IDs must be in noSourceModules
        : noSourceModules.has(previousNodeId); // Single ID check

      const isNoSource =
        noSourceModules.has(nodeId) ||
        isPreviousNoSource ||
        (!previousNodeId && moduleType !== 'trigger');
      // If the node is identified as 'no source' and is not already in the set, add it
      if (isNoSource && !noSourceModules.has(nodeId)) {
        noSourceModules.add(nodeId);
        changesMade = true; // Indicate that a change occurred, so we need another iteration
      }
    }
  }

  return Array.from(initialNodes, ([, n]) => {
    const nodeId = n.id;
    const sHandles = sourceHandles[nodeId] ?? [];
    const noSource = noSourceModules.has(nodeId);
    const dimensions = getNodeDimensions(n, sHandles.length, noSource);
    return {
      ...n,
      style: {
        ...n.style,
        ...dimensions,
        ...(noSource && {
          opacity: 0.5,
        }),
      },
      ...dimensions,
      data: {
        ...(n.data || {}),
        noSource,
        size: dimensions.width,
        sourceHandles: sHandles,
      },
    };
  });
};

const useNodesToSet = (nodesSelector, sourceHandlesSelector) => {
  const initialNodes = useSelector(nodesSelector);
  const sourceHandles = useSelector(sourceHandlesSelector);
  return useMemo(() => getNodesToSet(initialNodes, sourceHandles), [initialNodes, sourceHandles]);
};

const useInvalidPositions = (nodesToSet, positions) => {
  return !nodesToSet || nodesToSet.some((n) => !Object.keys(positions[n.id] ?? {}).length);
};

const useInitialNodesSize = (nodesSelector) => {
  const initialNodes = useSelector(nodesSelector);
  return initialNodes?.size ?? 0;
};

const getNewValues = (oldObj, newObj) =>
  transform(newObj, (result, value, key) => {
    if (!isEqual(oldObj[key], value)) {
      // eslint-disable-next-line no-param-reassign
      result[key] =
        isObject(value) && isObject(oldObj[key]) ? getNewValues(oldObj[key], value) : value;
    }
  });

const FlowLayoutedNodes = ({
  nodesSelector,
  edgesSelector,
  sourceHandlesSelector,
  modulePositionsSelector = null,
  nextModuleMappingsSelector = null,
  updateModulePosition = null,
  initializedNodesSelector = null,
  fromTemplate = false,
  extraControlButtons = [],
}) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [autoAlignCount, setAutoAlignCount] = useState(0);
  const [layoutingNodes, setLayoutingNodes] = useState(false);
  const { animations, onToggleAnimation } = useSettingsContext();
  // const ws = useHermesWebSocket();
  // const sendCommand = ws?.sendCommand;
  const initializedNodes = useSelector(initializedNodesSelector);
  const nextMappings = useSelector(nextModuleMappingsSelector);
  const positions = useSelector(modulePositionsSelector);

  const initialEdges = useSelector(edgesSelector);

  const { setNodes, getEdges, setEdges, fitView, zoomIn, zoomOut } = useReactFlow();

  const edgesInFlow = getEdges();
  const edgesLength = useMemo(() => edgesInFlow?.length, [edgesInFlow]);
  const nodesToSet = useNodesToSet(nodesSelector, sourceHandlesSelector);

  const initialNodesSize = useInitialNodesSize(nodesSelector);
  const invalidPositions = useInvalidPositions(nodesToSet, positions);

  const layoutNodes = useCallback(async () => {
    // console.log("@useLayoutNodes (layoutNodes): calling");
    setLayoutingNodes(true);
    // const flowNodes = getNodes();
    // const nodesToSet = (!flowNodes?.length ? initialNodes : flowNodes).map((n) => ({ ...n, position: positions[n.id] }));
    // const someNodeDragging = nodesToSet.some(n => !!n.dragging);
    setAutoAlignCount(0);
    const nodesMini = nodesToSet.map((n) => ({
      id: n.id,
      width: n.width,
      height: n.height,
      data: {
        targetHandles: n.data.targetHandles,
        exceptHandles: n.data.exceptHandles,
        sourceHandles: n.data.sourceHandles,
        noSource: n.data.noSource,
      },
    }));
    const newPositions = await getLayoutedNodes(nodesMini, initialEdges);
    const updatedPositions = getNewValues(positions, newPositions);
    if (Object.keys(updatedPositions)?.length) {
      dispatch(
        updateModulePosition(
          () => null,
          Object.entries(updatedPositions).map(([nodeId, updatedPosition]) => ({
            ...nodesToSet.find((node) => node.id === nodeId),
            position: { ...positions[nodeId], ...updatedPosition },
          })),
          true,
        ),
      );
      setNodes(
        nodesToSet.map((n) => ({
          ...n,
          position: { ...positions[n.id], ...updatedPositions[n.id] },
        })),
      );
    }
    // if (isFirstTime.current) {
    //   isFirstTime.current = false;
    // } else {
    // }
    setLayoutingNodes(false);
  }, [nodesToSet, initialEdges, positions, setNodes, updateModulePosition]);

  useEffect(() => {
    // console.log("swetting nodes init", !!initialNodes?.length, !initializedNodes);
    if (!!initialNodesSize && !initializedNodes) {
      const timer = setTimeout(() => dispatch(setInitializedNodes()), 500);
      return () => clearTimeout(timer);
    }
  }, [initialNodesSize, initializedNodes]);

  // useEffect(() => {
  //   if (!!isFirstTime) {
  //     console.log('useEffect 1');
  //     setNodes(nodesToSet.map(n => ({ ...n, position: positions[n.id] ?? {} })));
  //   }
  // }, [positions, nodesToSet]);

  useEffect(() => {
    if (!isFirstTime) {
      setNodes(nodesToSet.map((n) => ({ ...n, position: positions[n.id] ?? {} })));
      if (fromTemplate) {
        const timer = setTimeout(() => fitView(), 0);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, nodesToSet, isFirstTime]);

  useEffect(() => {
    if (!layoutingNodes && initializedNodes) {
      const mustLayout = !!autoAlignCount || invalidPositions;
      if (isFirstTime || mustLayout) {
        if (mustLayout) {
          layoutNodes().then(() => {
            if (isFirstTime || fromTemplate) {
              const timer = setTimeout(() => fitView(), 0);
              setIsFirstTime(false);
              return () => clearTimeout(timer);
            }
          });
        } else {
          setNodes(nodesToSet.map((n) => ({ ...n, position: positions[n.id] ?? {} })));
          if (isFirstTime) {
            const timer = setTimeout(() => fitView(), 0);
            setIsFirstTime(false);
            return () => clearTimeout(timer);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialNodesSize,
    invalidPositions,
    autoAlignCount,
    layoutingNodes,
    nextMappings,
    initializedNodes,
  ]);

  // useEffect(() => {
  //   if (!!positions?.length) {
  //     setNodes(prev => prev.map(n => ({ ...n, position: positions[n.id] })));
  //   }
  // }, [positions]);

  const initialEdgesKey = useMemo(
    () => (!initialEdges ? null : [...initialEdges.keys()].join(',')),
    [initialEdges],
  );

  useEffect(() => {
    if ((!!initialEdges?.size || (!!edgesLength && !initialEdges?.size)) && initialNodesSize) {
      setEdges(Array.from(initialEdges, ([, edge]) => edge));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEdgesKey]);

  const onFitView = useCallback(() => setAutoAlignCount((prev) => prev + 1), []);

  return (
    <ControlPanel
      className="z-[99] bg-transparent dark:bg-transparent p-1"
      groupClassName="transition-opacity opacity-100 hover:opacity-40"
      buttons={[
        ...extraControlButtons,
        {
          title: 'Zoom',
          icon: 'material-symbols:zoom-out-map',
          children: [
            {
              title: 'Zoom In',
              icon: 'material-symbols:zoom-in',
              onClick: zoomIn,
            },
            {
              title: 'Zoom Out',
              icon: 'material-symbols:zoom-out',
              onClick: zoomOut,
            },
            {
              title: 'Zoom Fit',
              icon: 'fluent:zoom-fit-20-regular',
              onClick: fitView,
            },
          ],
        },
        {
          title: 'Settings',
          icon: 'mdi:cog-outline',
          children: [
            {
              title: 'Auto-layout modules',
              icon: 'fluent:wand-16-regular',
              onClick: onFitView,
            },
            {
              title: !animations.all
                ? 'Enable general animations to enable workflows animations'
                : 'Toggle Animation',
              icon: !animations.flows ? 'mdi:animation-play' : 'mdi:animation',
              onClick: !animations.all ? null : () => onToggleAnimation('flows'),
              disabled: !animations.all,
            },
          ],
        },
      ]}
    />
  );
};

export default memo(FlowLayoutedNodes);
