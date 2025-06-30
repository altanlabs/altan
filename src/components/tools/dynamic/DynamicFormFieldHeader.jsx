import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, memo, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { cn } from '@lib/utils';

import Iconify from '../../iconify';
import IconRenderer from '../../icons/IconRenderer.jsx';

// function toTitleCase(str) {
//   const result = str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
//   const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
//   return finalResult;
// }

const DynamicFormFieldHeader = ({
  fieldKey,
  schema,
  required,
  requiredValid = false,
  showSchemaType = false,
  canBeCollapsed = false,
  enableAIFill = false,
  isArrayElement = false,
  onDeleteArrayElement = null,
  dragRef = null,
  dragListeners = null,
  isDragging = false,
  expanded = false,
  // onMoveUpArrayElement = null,
  // onMoveDownArrayElement = null,
  sneakPeek = null,
  isCollapsed = true,
  toggleCollapse = null,
}) => {
  const { setValue } = useFormContext();
  const optionValue = useWatch({ name: `${fieldKey}_option` });

  const onOptionChange = useCallback(
    (e, option) =>
      setValue(`${fieldKey}_option`, option, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      }),
    [setValue, fieldKey],
  );
  const title = schema?.title || fieldKey.split('.').slice(-1)[0];

  const onToggleCollapse = useCallback(
    (e) => {
      e.stopPropagation();
      if (!!toggleCollapse) {
        toggleCollapse();
      }
    },
    [toggleCollapse],
  );

  const isCollapsable = useMemo(
    () => !!canBeCollapsed && !!toggleCollapse,
    [canBeCollapsed, toggleCollapse],
  );

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="left"
      width="100%"
      className={cn('group', isCollapsable && 'cursor-pointer')}
      onClick={onToggleCollapse}
    >
      {isCollapsable && (
        <Tooltip
          title={`${!isCollapsed ? 'Collapse' : 'Expand'} object`}
          arrow
        >
          <Iconify
            className="opacity-70 group-hover:opacity-100 transition-opacity min-w-[20px]"
            icon={`mdi:chevron-${!isCollapsed ? 'up' : 'down'}`}
            width={17}
            onClick={onToggleCollapse}
          />
        </Tooltip>
      )}
      {!!schema['x-icon'] && <IconRenderer icon={schema['x-icon']} />}
      {!!enableAIFill && (
        <FormControl size="small">
          <ToggleButtonGroup
            size="small"
            value={optionValue ?? 'fill'}
            exclusive
            onChange={onOptionChange}
            aria-label="Option"
            sx={{ width: 85, mr: 2 }}
          >
            <Tooltip
              arrow
              title="Manual parameter selection."
            >
              <ToggleButton
                value="fill"
                aria-label="Fill"
                size="small"
              >
                <Iconify
                  icon="pajamas:todo-add"
                  width={15}
                />
              </ToggleButton>
            </Tooltip>
            <Tooltip
              title="Let AI fill the parameter."
              arrow
            >
              <ToggleButton
                value="ai"
                aria-label="AI"
                size="small"
              >
                <Iconify
                  icon="mdi:robot-happy"
                  width={15}
                />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormControl>
      )}
      {!!showSchemaType && (
        <Chip
          variant="soft"
          color="warning"
          size="small"
          sx={{ fontSize: '.6rem' }}
          label={schema.type}
        />
      )}
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="left"
        width="100%"
      >
        <Tooltip
          title={
            <Typography variant="caption">
              {schema.description} ({schema.type}) {schema.default}
            </Typography>
          }
          arrow
          followCursor
          placement="top"
        >
          {!!title && (
            <Typography
              variant="body2"
              onClick={onToggleCollapse}
            >
              {title}
              {/* {!schema['x-extra'] ? (isArrayElement ? null : toTitleCase(title)) : title} */}
            </Typography>
          )}
        </Tooltip>
        {!!required && (
          <Tooltip
            title="(Required)"
            arrow
            followCursor
          >
            <Typography
              variant="h5"
              className={!!requiredValid ? 'text-[#36B37E]' : 'text-[#FF5630]'}
            >
              *
            </Typography>
          </Tooltip>
        )}
        {!!isArrayElement && !!dragRef && !expanded && (
          <Iconify
            ref={dragRef}
            icon="system-uicons:drag"
            {...(dragListeners || {})}
            // onClick={onMoveDownArrayElement}
            className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          />
        )}
        {!!isArrayElement && !!onDeleteArrayElement && (
          <Iconify
            icon="mdi:delete"
            onClick={onDeleteArrayElement}
            className="text-[#FF5630] width-[15] cursor-pointer"
          />
        )}
      </Stack>
      {isCollapsable && !!sneakPeek && (
        <div
          className="w-full relative"
          onClick={onToggleCollapse}
        >
          <p className="group-hover:opacity-80 text-xs transition-opacity opacity-25">
            {sneakPeek}
          </p>
        </div>
      )}
    </Stack>
  );
};

export default memo(DynamicFormFieldHeader);

// <Stack
//   width="100%"
//   sx={{
//     position: 'relative',
//     cursor: 'pointer',
//     ...!isCollapsed && {
//       '& .expand-collapsed-icon': {
//         opacity: 1
//       }
//     },
//     '&:hover': {
//       '& .expand-collapsed-icon': {
//         opacity: 1
//       }
//     }
//   }}
// >
//   {
//     !!toggleCollapse && (
//       <Typography
//         variant='caption'
//         className='transition transition-opacity opacity-25'
//         onClick={toggleCollapse}
//       >
//         {sneakPeek}
//       </Typography>
//     )
//   }
// </Stack>
