import { Tooltip } from '@mui/material';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { memo, useCallback } from 'react';

import SubMenu from './SubMenu';
import {
  deleteFlowModule,
  deleteFlowModules,
  deleteNewModule,
  cloneModules,
  setSelectedModule,
  pasteModules,
  updateEdge,
} from '../../redux/slices/flows';
import { dispatch } from '../../redux/store';
import Iconify from '../iconify';

const ContextMenuItems = ({ items, onClose, disabledMessageTooltip = null }) => {
  const executeAction = useCallback(
    async (action) => {
      onClose();
      if (action === null) {
        return;
      }
      const { k: key, p: payload } = action;

      switch (key) {
        case 'deleteModule':
          const module = payload.selected[0];
          if (module.status === 'new') {
            dispatch(deleteNewModule(module.data.after));
          } else {
            dispatch(deleteFlowModule(module.id));
          }
          break;
        case 'deleteModules':
          payload.selected.forEach((module) => {
            if (module.status === 'new') {
              dispatch(deleteNewModule(module.data.after ?? null));
            }
          });
          const moduleIds = payload.selected
            .filter((module) => module.status !== 'new')
            .map((module) => module.id);
          if (moduleIds.length > 0) {
            dispatch(deleteFlowModules(moduleIds));
          }
          break;
        case 'deleteEdge':
          const edge = payload.selected[0].data;
          dispatch(updateEdge(edge.sourceId, edge.condition, null, edge.isExcept));
          break;
        case 'deleteEdges':
          payload.selected.forEach((edge) => {
            const edgeData = edge.data;
            dispatch(updateEdge(edgeData.sourceId, edgeData.condition, null, edgeData.isExcept));
          });
          break;
        case 'cloneModule':
        case 'cloneModules':
          dispatch(cloneModules(payload.moduleIds));
          break;
        case 'copyModule':
        case 'copyModules':
          // TODO: copy modules
          if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');
            return false;
          }
          try {
            await navigator.clipboard.writeText(
              `___{{$modulesCopied}}(${payload.moduleIds.join('|')})`,
            );
          } catch (e) {
            console.error('could not copy modules');
          }
          // dispatch(cloneModules(payload.moduleIds));
          break;
        case 'renameModule':
          dispatch(setSelectedModule(payload.moduleId));
          break;
        case 'pasteModules':
          dispatch(pasteModules(payload.moduleIds, payload.coordinates));
          break;
        case 'createModule':
          break;
        default:
          break;
      }
    },
    [onClose],
  );

  if (!items?.length) {
    return null;
  }

  return items.map((item, index, array) => {
    return (
      <div key={`menu-item-${index}`}>
        {!!item.children ? (
          <SubMenu
            item={item}
            executeAction={executeAction}
          />
        ) : (
          <Tooltip
            title={item.a === null ? disabledMessageTooltip : null}
            followCursor
            arrow
          >
            <div>
              <MenuItem
                disabled={item.a === null}
                onClick={() => executeAction(item.a)}
              >
                <Stack
                  direction="row"
                  justifyContent="left"
                  alignItems="center"
                  spacing={2}
                  width="100%"
                >
                  <Iconify
                    width={15}
                    icon={item.i}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.8em' }}
                  >
                    {item.l}
                  </Typography>
                </Stack>
              </MenuItem>
            </div>
          </Tooltip>
        )}
        {index < array.length - 1 && <Divider style={{ margin: 0, padding: 0 }} />}
      </div>
    );
  });
};

export default memo(ContextMenuItems);
