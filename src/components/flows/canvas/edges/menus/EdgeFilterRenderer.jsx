import { Stack, Tooltip, Typography } from '@mui/material';
import { truncate } from 'lodash';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { batch } from 'react-redux';

import { cn } from '@lib/utils';

import FilterPopover from './../menus/FilterPopover.jsx';
import {
  setModuleInMenu,
  clearModuleInMenu,
  makeSelectHasModuleFilter,
  makeSelectHasConditionFilter,
  makeSelectEdgeDescription,
  makeSelectConditionDescription,
} from '../../../../../redux/slices/flows';
import { closeGlobalVarsMenu } from '../../../../../redux/slices/general';
import { dispatch, useSelector } from '../../../../../redux/store';
import { bgBlur } from '../../../../../utils/cssStyles';
import Iconify from '../../../../iconify';

const NO_FILTER_MESSAGE = "There's no filter yet. Click to set up filter.";

const EdgeFilterRenderer = ({
  id,
  isRouteCondition,
  isDefault,
  sourceId,
  targetId,
  condition,
  data,
  midCircle,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const enableFilter = useMemo(
    () => !data.isDefault && !data.after && !data.isConditionDisabled,
    [data.after, data.isConditionDisabled, data.isDefault],
  );
  const hasFilterSelector = useMemo(() => {
    const selector = !isRouteCondition
      ? makeSelectHasModuleFilter()
      : makeSelectHasConditionFilter();
    return (state) =>
      !isRouteCondition
        ? selector(state, sourceId, targetId)
        : selector(state, sourceId, null, condition);
  }, [isRouteCondition, sourceId, targetId, condition]);

  const edgeDescriptionSelector = useMemo(() => {
    const selector = !isRouteCondition
      ? makeSelectEdgeDescription()
      : makeSelectConditionDescription();
    return (state) =>
      !isRouteCondition
        ? selector(state, sourceId, targetId)
        : selector(state, sourceId, null, condition);
  }, [isRouteCondition, sourceId, targetId, condition]);

  // Using separate useSelector calls to avoid object reference issues
  const hasFilter = useSelector(hasFilterSelector);
  const description = useSelector(edgeDescriptionSelector);

  const handleClick = useCallback(
    (event) => {
      dispatch(
        setModuleInMenu({
          module: {
            id: !data.after ? data.targetId : null,
            after: data.after,
          },
        }),
      );
      setAnchorEl(event.currentTarget);
    },
    [data.after, data.targetId],
  );

  const handleClose = useCallback(() => {
    batch(() => {
      dispatch(closeGlobalVarsMenu());
      dispatch(clearModuleInMenu());
    });
    setAnchorEl(null);
  }, []);

  const popoverId = Boolean(anchorEl) ? `edge-popover-${id}` : undefined;

  if (!enableFilter && !hasFilter && !description?.length && !isDefault) {
    return null;
  }

  return (
    <>
      {midCircle && (description?.length > 0 || isDefault) && (
        <foreignObject
          x={midCircle.x - 65}
          y={midCircle.y - (!isDefault ? 35 : 15)}
          width={120}
          height={30}
          style={{
            zIndex: 10001,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            width="100%"
            sx={{
              textAlign: 'center',
              ...bgBlur({ opacity: 0.5 }),
              borderRadius: 3,
            }}
          >
            <Tooltip
              arrow
              title={description}
            >
              <Typography
                variant="body2"
                onClick={handleClick}
              >
                {isDefault ? 'Default' : truncate(description, { length: 20 })}
              </Typography>
            </Tooltip>
          </Stack>
        </foreignObject>
      )}
      {midCircle && !isDefault && (
        <foreignObject
          x={midCircle.x - (!enableFilter ? 20 : 10)}
          y={midCircle.y - (!enableFilter ? 20 : 10)}
          width={!enableFilter ? 40 : 20}
          height={!enableFilter ? 40 : 20}
          className="relative"
        >
          <Tooltip
            arrow
            title={
              !hasFilter && (
                <Stack>
                  <Typography variant="caption">{NO_FILTER_MESSAGE}</Typography>
                </Stack>
              )
            }
          >
            <button
              className={cn(
                'filteredgeicon absolute transform transition-transform:opacity opacity-50 hover:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-120 z-index-[999] h-4 w-4',
                !enableFilter && 'opacity-100 h-8 w-8',
              )}
              aria-describedby={popoverId}
              onClick={handleClick}
              size="small"
            >
              <Iconify
                icon={!!hasFilter ? 'ion:filter-circle' : 'ion:filter-circle-outline'}
                width={!enableFilter ? 34 : 17}
                className={!enableFilter && 'text-red-400'}
              />
            </button>
          </Tooltip>
        </foreignObject>
      )}
      {(!!enableFilter || hasFilter) && (
        <FilterPopover
          popoverId={popoverId}
          anchorEl={anchorEl}
          onClose={handleClose}
          data={data}
        />
      )}
    </>
  );
};

export default memo(EdgeFilterRenderer);

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
