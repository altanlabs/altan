import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoadingButton } from '@mui/lab';
import { TextField, Grid, Stack, Typography, Chip, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PATH_DASHBOARD } from '@routes/paths';
import React, { useState } from 'react';

import FileThumbnail from '@components/file-thumbnail/FileThumbnail';
import Iconify from '@components/iconify';
import Label from '@components/label';
import { cn } from '@lib/utils';
import {
  deleteKnowledgeLink,
  setDialogActive,
  deleteToolLink,
  deleteResourceLink,
} from '@redux/slices/spaces';
import { dispatch } from '@redux/store';

import IconRenderer from '../../../components/icons/IconRenderer';

export function BaseCard({
  item,
  mode = 'space',
  children,
  onDelete = null,
  onEdit = null,
  onSettings = null,
  isEditMode,
  isEditLayout,
  draggable = true,
  content = null,
  viewFile = null,
  onClick = null,
  onDoubleClick = null,
  buttonsChildren = null,
  dragOnButton = false,
}) {
  const { active, isDragging, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item?.id,
      transition: {
        duration: 250,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

  const updatedTransform = active
    ? { ...transform, scaleY: isDragging ? 1.05 : 1, scaleX: isDragging ? 1.05 : 1 }
    : transform;

  const draggableActive = isEditLayout && draggable && !!item && item.id !== 'new';

  return (
    <div
      ref={draggableActive ? setNodeRef : null}
      style={{ transform: CSS.Transform.toString(updatedTransform), transition }}
      className={cn(
        'relative flex items-center gap-3 p-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600',
        'active:translate-y-0 active:shadow-sm',
        draggableActive ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'opacity-70 shadow-lg scale-[1.02]' : '',
        onClick ? 'cursor-pointer' : '',
      )}
      {...(draggableActive ? attributes : {})}
      {...(draggableActive && !dragOnButton ? listeners : {})}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {draggableActive && (
        <Iconify
          icon="mdi:drag"
          className={cn(
            'text-gray-500 dark:text-gray-400',
            dragOnButton ? 'cursor-grab active:cursor-grabbing' : '',
          )}
          {...(draggableActive && dragOnButton ? listeners : {})}
        />
      )}

      {children}

      {(!draggableActive || dragOnButton) && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10 flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          {buttonsChildren}
          {viewFile && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() => viewFile()}
              disabled={content !== null && !content.length}
            >
              <Iconify
                icon="carbon:view"
                className="text-blue-500"
              />
            </button>
          )}
          {onEdit && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() =>
                !(isEditMode && mode === 'widget' && item.type !== 'custom_message') &&
                onEdit(item.id)}
              disabled={content !== null && !content.length}
            >
              <Iconify
                icon={
                  isEditMode
                    ? !content || content !== item.name
                        ? 'mdi:tick'
                        : 'mdi:close'
                    : 'material-symbols:edit'
                }
                className="text-green-500"
              />
            </button>
          )}
          {!item?.type && onSettings && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() =>
                mode === 'attribute'
                  ? onSettings()
                  : dispatch(
                      setDialogActive({ item: { id: item.id, type: mode }, dialog: 'settings' }),
                    )}
            >
              <Iconify
                icon="solar:settings-bold-duotone"
                className="text-yellow-500"
              />
            </button>
          )}
          {onDelete && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() => onDelete(item.id)}
            >
              <Iconify
                icon="ic:twotone-delete"
                className="text-red-500"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  if (status === 'uploaded') {
    return 'secondary';
  } else if (status === 'learning') {
    return 'info';
  } else if (status === 'learned') {
    return 'success';
  } else {
    return 'error';
  }
}

export const DataSourceCard = ({ item }) => {
  // console.log(item)
  return (
    <>
      <BaseCard
        item={item}
        mode="dataSource"
        onDelete={() => dispatch(deleteResourceLink(item.id))}
        draggable={false}
        // viewFile={viewFile}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
        >
          <Iconify icon="majesticons:data" />
          <Chip label={item.resource_type.name} />

          <Typography
            noWrap
            variant="inherit"
          >
            {item.name}
          </Typography>
        </Stack>
      </BaseCard>
    </>
  );
};

export const KnowledgeCard = ({ item }) => {
  const knowledge = item.knowledge;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const viewFile = () => {
    if (knowledge.file.meta_data.file_type === 'sheets') {
      const visitUrl = knowledge.file.meta_data.file_url.replace('&single=true&output=csv', '');
      window.open(visitUrl, '_blank');
    } else if (knowledge.file.meta_data.file_type === 'snippet') {
      setSnippetDialog(true);
    } else {
    }
  };

  return (
    <>
      <BaseCard
        item={item}
        mode="knowledge"
        onDelete={() => dispatch(deleteKnowledgeLink(item.id))}
        draggable={false}
        viewFile={viewFile}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
        >
          <FileThumbnail file={knowledge.file.meta_data.file_type} />
          {knowledge.file.meta_data.status && (
            <Label
              color={getStatusColor(knowledge.file.meta_data.status)}
              startIcon={
                knowledge.file.meta_data.status === 'learning' ||
                knowledge.file.meta_data.status === 'processing' ? (
                      <Iconify icon="line-md:loading-twotone-loop" />
                    ) : null
              }
            >
              {knowledge.file.meta_data.status}
            </Label>
          )}
          <Typography
            noWrap
            variant="inherit"
            sx={{ maxWidth: isMobile ? '125px' : '400px' }}
          >
            {knowledge?.meta_data?.file_name || knowledge.file.meta_data?.file_name}
          </Typography>
        </Stack>
      </BaseCard>
    </>
  );
};

export const SpaceToolCard = ({ item, onEdit }) => {
  const isClientTool = item.tool?.tool_type === 'client';
  const onClickEdit = () => onEdit(item);
  
  return (
    <BaseCard
      item={item}
      mode="tool"
      draggable={false}
      onDelete={() => dispatch(deleteToolLink(item.id))}
    >
      <div
        className="flex items-center space-x-2 w-full cursor-pointer"
        onClick={onClickEdit}
      >
        <Chip
          icon={
            <IconRenderer
              icon={
                isClientTool 
                  ? 'mdi:desktop-classic'
                  : item.tool?.action_type?.connection_type?.icon ||
                    item?.tool?.action_type?.connection_type?.external_app?.icon ||
                    'ri:hammer-fill'
              }
            />
          }
          label={
            isClientTool 
              ? 'Client Tool'
              : item?.tool?.action_type?.connection_type?.name || 'Server Tool'
          }
          color={isClientTool ? 'secondary' : 'primary'}
          variant="soft"
        />
        <Typography
          noWrap
          variant="subtitle"
          sx={{ maxWidth: 360, flex: 1 }}
        >
          {item.tool.name}
        </Typography>
      </div>
    </BaseCard>
  );
};

export const SpaceCard = ({
  navigate,
  item,
  cardEditing,
  onDelete,
  onEdit,
  mode = 'space',
  isEditLayout = false,
  isSubmitting = false,
}) => {
  const currentName = mode === 'link' ? item.reference.name : item.name;
  const [textValue, setTextValue] = useState(currentName || '');
  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') onEdit(id, textValue, currentName);
  };

  const handleNavigation = async () => {
    try {
      const id = mode === 'link' ? item.reference.id : item.id;
      await navigate(PATH_DASHBOARD.spaces.view(id), { replace: true });
    } catch {}
  };
  const isEmptySpace =
    item?.children?.spaces?.length === 0 && item?.children?.knowledge?.length === 0;
  const renderSpaceLink = mode === 'link' && (
    <Tooltip title={`Link to space ${item.reference.name}`}>
      <Iconify
        icon="uil:link"
        width={15}
        sx={{ position: 'absolute', top: -5, left: -5 }}
      />
    </Tooltip>
  );
  return (
    <BaseCard
      item={item}
      mode={mode}
      onDelete={onDelete}
      onEdit={mode === 'space' && !!onEdit ? () => onEdit(item.id, textValue, currentName) : null}
      isEditMode={cardEditing}
      isEditLayout={isEditLayout}
      content={textValue}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        {cardEditing ? (
          <TextField
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            InputProps={{
              startAdornment: renderSpaceLink,
            }}
          />
        ) : (
          <>
            <Tooltip title={isEmptySpace ? 'This is an end space without knowledge' : ''}>
              <LoadingButton
                sx={{ textTransform: 'none' }}
                variant="soft"
                color={isEmptySpace ? 'warning' : 'primary'}
                loading={isSubmitting}
                onClick={handleNavigation}
                startIcon={<Iconify icon="solar:folder-bold-duotone" />}
              >
                {textValue || 'New Space'}
                {renderSpaceLink}
              </LoadingButton>
            </Tooltip>

            <Tooltip
              arrow
              title={
                <Stack
                  spacing={1}
                  sx={{ p: 1, display: 'flex', flexWrap: 'wrap' }}
                >
                  <Typography variant="subtitle2">Spaces</Typography>
                  <Grid
                    container
                    spacing={1}
                  >
                    {item?.children?.spaces?.map((space, index) => (
                      <Grid
                        item
                        xs={4}
                        key={index}
                      >
                        <Chip label={space?.child?.name} />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              }
              enterTouchDelay={500}
              enterDelay={500}
              enterNextDelay={500}
              followCursor
              slotProps={{
                tooltip: {
                  sx: {
                    maxHeight: '80vh',
                  },
                },
              }}
            >
              <Chip
                variant="soft"
                color="primary"
                label={`${item?.children_count + item?.links_count || 0} Spaces`}
              />
            </Tooltip>
          </>
        )}
      </Stack>
    </BaseCard>
  );
};
