import { Box, Stack, Tooltip, alpha, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import React, { memo, useRef, useMemo } from 'react';
import { Position } from 'reactflow';

import ModuleExecutionsOverview from './executions/ModuleExecutionsOverview.jsx';
import ModuleHandle from './handles/ModuleHandle.jsx';
import ModuleNodeSourceHandles from './modulenode/ModuleNodeSourceHandles.jsx';
import PlusIconRouter from './modulenode/PlusIconRouter.jsx';
// import { useDebounce } from '../../../../hooks/useDebounce';
import { checkObjectsEqual } from '../../../../redux/helpers/memoize.ts';
import { makeSelectModule } from '../../../../redux/slices/flows';
import { useSelector } from '../../../../redux/store.ts';
import Iconify from '../../../iconify';
import {
  ModuleIcon,
  ModuleName,
  ModuleType,
  moduleTypes,
} from '../../schemas/modulePanelSections.jsx';
import './index.css';
// import FlowActiveStatus from './modulenode/FlowActiveStatus';

const getHandleStyle = (color, theme) => {
  return {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 40%, #ffffff22 100%)`,
    ...(theme === 'dark' && {
      background: `radial-gradient(circle, ${alpha(color, 0.4)} 40%, #ffffff22 100%)`,
    }),
    border: '2px solid #ffffff22',
    zIndex: -1,
    transition: 'all ease 200ms',
  };
};

const getModuleNodeBoxStyle = ({
  selected,
  dragging,
  color,
  contrastColor,
  theme = 'dark',
  unsavedChanges = false,
}) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: `radial-gradient(circle, ${color} 0%, ${contrastColor} 100%)`,
  ...(theme === 'dark' && {
    background: `radial-gradient(circle, ${contrastColor} 0%, ${alpha(color, 0.1)} 30%, ${alpha(color, 0.3)} 100%)`,
  }),
  // background: `radial-gradient(circle, #00000000 0%, ${contrastColor} 100%)`,
  // border: `5px solid ${contrastColor}`,
  borderRadius: '100%',
  display: 'flex',
  transition: 'all 500ms ease',
  border: `${unsavedChanges ? '8px dashed' : '5px solid'} ${unsavedChanges ? alpha(color, 0.2) : 'transparent'}`,
  '.source-handle': {
    transition: 'all 300ms ease',
    '&:hover': {
      right: -5,
      transform: 'scale(1.5)',
      '.plus-icon-handle': {
        opacity: 1,
      },
    },
  },
  cursor: 'pointer',
  ...(selected && {
    border: `5px ${unsavedChanges ? 'dashed' : 'solid'} ${alpha(color, 0.9)}`,
  }),
  ...(dragging && {
    boxShadow: '0px 0px 17px 3px rgba(0,0,0,0.37)',
    cursor: 'grabbing',
  }),
  '&:hover': {
    ...(!selected && {
      border: `5px ${unsavedChanges ? 'dashed' : 'solid'} ${alpha(color, 0.5)}`,
    }),
    '.plus-icon-router': {
      opacity: 1,
      display: 'flex',
    },
    // '.sources': {
    //   right: -10,
    // },
    // '.source-handle': {
    //   background: `radial-gradient(circle, ${color} 40%, #ffffffee 100%)`,
    //   border: '2px solid #fff',
    // }
  },
});

const moduleEqualityCheck = (prev = {}, next = {}) => {
  if (prev === next) return true; // Early exit if the references are the same
  const { meta_data: prevMeta = {}, ...restPrev } = prev;
  const { meta_data: nextMeta = {}, ...restNext } = next;

  // Extract other meta_data properties except 'position'
  const { position: _, ...restMetaPrev } = prevMeta;
  const { position: __, ...restMetaNext } = nextMeta;

  return checkObjectsEqual(restPrev, restNext) && checkObjectsEqual(restMetaPrev, restMetaNext);
};

// const useGetZoom = () => {
//   const { getZoom } = useReactFlow();
//   const zoom = getZoom();

//   return useDebounce(zoom, 500);
// };

// const hasTryExceptAvailable = (module) => {
//   if (['action', 'search'].includes(module.type)) {
//     return true;
//   }
//   return module.type === 'internal' && ['code', 'aigent', 'invoke'].includes(module.internal_type);
// };

const ModuleNode = ({
  // id,
  // type,
  data,
  selected,
  dragging,
}) => {
  // const [isRenaming, setIsRenaming] = useState(false);
  // const selectedModuleId = useSelector((state) => state.flows.selectedModuleId);
  // const zoom = useGetZoom();
  // console.log('zoom', zoom);
  const boxRef = useRef(null);
  const theme = useTheme();
  const moduleSelector = useMemo(makeSelectModule, []);
  const module = useSelector(
    (state) => moduleSelector(state, data.module.id, data.module.after),
    moduleEqualityCheck,
  );

  const color = useMemo(
    () => (!!module?.type && moduleTypes[module.type]?.color) || data.color,
    [module?.type, data],
  );

  // const startColor = useMemo(() =>
  //   alpha(color, 0.1), [color]);

  // const midColor = useMemo(() =>
  //   alpha(color, 0.4), [color]);

  // const contrastColor = theme.palette.mode === 'light' ? '#eeeeee22' : '#63738122';
  const themeMode = theme.palette.mode;
  const contrastColor = themeMode === 'light' ? '#fff' : '#63738122';
  const handleStyle = useMemo(() => getHandleStyle(color, themeMode), [color, themeMode]);

  const notNewModuleSkeleton = useMemo(
    () => !!module?.type && (module.type !== 'trigger' || !!module.trigger_type),
    [module],
  );

  const fullNew = useMemo(
    () => data.status === 'new' && notNewModuleSkeleton,
    [data.status, notNewModuleSkeleton],
  );

  const moduleStyle = useMemo(
    () =>
      getModuleNodeBoxStyle({
        selected,
        dragging,
        color,
        contrastColor,
        theme: themeMode,
        unsavedChanges: fullNew,
      }),
    [color, contrastColor, dragging, fullNew, selected, themeMode],
  );
  const highlightSourceHandle =
    !!module && module.type === 'trigger' && !module.next_module_id && data.status !== 'new';

  // useEffect(() => {
  //   if (selected && selectedModuleId === module?.id) {
  //     setIsRenaming(true);
  //   }
  // }, [selected, selectedModuleId, module?.id]);

  if (!module) {
    return null;
  }

  // const availableTryExcept = hasTryExceptAvailable(module);

  const hasModuleName =
    ['action', 'search'].includes(module.type) ||
    (module.internal_type === 'code' && ['java', 'c', 'python'].includes(module.logic?.language));

  return (
    <>
      <Tooltip
        followCursor
        arrow
        title={!notNewModuleSkeleton ? `Click to set up new ${module.type ?? 'module'}` : null}
      >
        <Box
          ref={boxRef}
          component={m.span}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: 'easeIn' }}
          sx={moduleStyle}
          className="group"
        >
          <div className="handles excepts opacity-10 transition-opacity group-hover:opacity-100">
            {(data.exceptHandles || []).map((handle) => (
              <ModuleHandle
                key={handle.id}
                id={handle.id}
                type="source"
                className="source-handle"
                position={Position.Top}
                style={{
                  ...handleStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                isConnectableStart={1}
              >
                <Iconify
                  icon="mdi:plus"
                  width={22}
                  className="plus-icon-handle"
                  sx={{
                    opacity: 0,
                    transition: 'all 300ms ease',
                    pointerEvents: 'none',
                    color: 'black',
                  }}
                />
              </ModuleHandle>
            ))}
          </div>
          <div className="handles targets">
            {(data.targetHandles || []).map((handle) => (
              <ModuleHandle
                key={handle.id}
                id={handle.id}
                type="target"
                position={Position.Left}
                style={handleStyle}
                isConnectableEnd={
                  module.type === 'internal' &&
                  module.internal_type === 'octopus' &&
                  data.status !== 'new'
                    ? true
                    : 1
                }
              />
            ))}
          </div>
          <Stack
            alignItems="center"
            justifyContent="center"
            height="100%"
            width="100%"
            padding={1}
            sx={{
              position: 'relative',
            }}
          >
            <ModuleIcon
              module={module}
              // key={`module-node-${module.id}-${zoom}`}
              size={data.size - 42}
              // animationMode="hover"
            />
            {data.status !== 'new' && module.type === 'router' && (
              <PlusIconRouter
                id={module.id}
                type={module.type}
                selected={selected}
              />
            )}
          </Stack>
          <ModuleNodeSourceHandles
            sourceHandles={data.sourceHandles}
            handleStyle={handleStyle}
            highlighted={highlightSourceHandle}
          />
          <div className="absolute z-[-1] bottom-[-15px] left-0 right-0 mx-auto w-[75%] h-[20px] bg-gray-300 opacity-50 dark:opacity-20 group-hover:opacity-90 group-hover:dark:opacity-50 rounded-full blur-md shadow-lg"></div>
        </Box>
      </Tooltip>
      {fullNew && (
        <Tooltip
          arrow
          followCursor
          title="Module is still temporary. Finish the set up and save it."
        >
          <div
            className="absolute -right-1 -top-1 z-[-1] flex h-5 w-5 items-center justify-center rounded-full
              bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-gray-300/20 dark:from-gray-800/20 from-20% to-transparent to-100%
              backdrop-blur-lg"
          >
            <Iconify
              icon="mdi:asterisk"
              width={13}
            />
          </div>
        </Tooltip>
      )}
      <ModuleExecutionsOverview
        id="ModuleExecutionsOverview"
        status={data.status}
        moduleId={module.id}
      />
      {!!notNewModuleSkeleton && (
        <Stack
          component={m.span}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          sx={{
            position: 'absolute',
            bottom: hasModuleName ? -55 : -30,
            zIndex: -1,
          }}
          alignItems="center"
          justifyContent="center"
        >
          <ModuleType module={module} />
          {hasModuleName && <ModuleName module={module} />}
        </Stack>
      )}
    </>
  );
};
function arePropsEqual(prev, next) {
  return (
    prev.id === next.id &&
    prev.type === next.type &&
    prev.selected === next.selected &&
    prev.dragging === next.dragging &&
    checkObjectsEqual(prev.data, next.data)
  );
}

export default memo(ModuleNode, arePropsEqual);
