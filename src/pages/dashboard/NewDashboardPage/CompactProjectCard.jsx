import { Box, Menu, MenuItem, alpha } from '@mui/material';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import FormDialog from '../../../components/FormDialog';
import Iconify from '../../../components/iconify/Iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import { deleteAltanerById, updateAltanerById } from '../../../redux/slices/altaners';
import { optimai_pods } from '../../../utils/axios';
import { fToNow } from '../../../utils/formatTime';

const CompactProjectCard = ({ id, name, icon_url, is_pinned, components = [], last_modified, description }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [coverUrl, setCoverUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Find interface component for preview
  const interfaceComponent = components.find((comp) => comp.type === 'interface');

  useEffect(() => {
    const fetchCoverUrl = async () => {
      if (interfaceComponent?.params?.id) {
        try {
          const response = await optimai_pods.get(`/interfaces/${interfaceComponent.params.id}/preview`);
          setCoverUrl(response.data.url);
        } catch (error) {
          setCoverUrl(null);
        }
      }
    };

    fetchCoverUrl();
  }, [interfaceComponent?.params?.id]);

  const handleClick = useCallback(() => {
    history.push(`/project/${id}`);
  }, [id, history]);

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : null,
      );
    },
    [contextMenu],
  );

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleClose();
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      dispatch(deleteAltanerById(id));
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete altaner:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, id]);

  const editSchema = {
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        default: name,
      },
      description: {
        type: 'string',
        title: 'Description',
        default: description,
      },
      icon_url: {
        type: 'string',
        title: 'Icon URL',
        default: icon_url,
        'x-component': 'IconAutocomplete',
      },
    },
    required: ['name'],
  };

  const handleEdit = useCallback(() => {
    setEditDialogOpen(true);
    handleClose();
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  const handleConfirmEdit = useCallback(
    async (data) => {
      try {
        dispatch(updateAltanerById(id, data));
        handleCloseEditDialog();
      } catch (error) {
        console.error('Failed to update altaner:', error);
      }
    },
    [dispatch, handleCloseEditDialog, id],
  );

  const handleTogglePin = useCallback(() => {
    try {
      dispatch(updateAltanerById(id, { is_pinned: !is_pinned }));
      handleClose();
    } catch (error) {
      console.error('Failed to toggle pin status:', error);
    }
  }, [dispatch, id, is_pinned]);

  return (
    <>
      <div
        className="cursor-pointer group w-[280px] sm:w-[320px] flex-shrink-0"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        {coverUrl ? (
          imageError ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <IconRenderer
                icon="mdi:image-off"
                size={48}
                sx={{ opacity: 0.5 }}
              />
            </Box>
          ) : (
            <img
              src={coverUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <IconRenderer
              icon={icon_url || 'mdi:apps'}
              size={64}
            />
          </Box>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center justify-between text-xs w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Pin indicator */}
            {is_pinned && (
              <div className="flex items-center">
                <Iconify
                  icon="mdi:pin"
                  width={14}
                  sx={{ color: 'inherit' }}
                />
              </div>
            )}
            {/* Name */}
            <span className="truncate max-w-[140px] font-semibold text-sm">{name}</span>
          </div>

          {/* Last modified */}
          {last_modified && (
            <div className="text-gray-400 dark:text-gray-500 text-xs">
              {fToNow(last_modified)}
            </div>
          )}
        </div>
      </div>
    </div>

    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
      }
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
        },
      }}
    >
      <MenuItem
        onClick={handleTogglePin}
        sx={{ gap: 1 }}
      >
        <Iconify
          icon={is_pinned ? 'mdi:pin-off' : 'mdi:pin'}
          width={20}
        />
        {is_pinned ? 'Unpin' : 'Pin'}
      </MenuItem>
      <MenuItem
        onClick={handleEdit}
        sx={{ gap: 1 }}
      >
        <Iconify
          icon="eva:edit-fill"
          width={20}
        />
        Quick Edit
      </MenuItem>

      <MenuItem
        onClick={handleDelete}
        sx={{
          color: 'error.main',
          gap: 1,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
          },
        }}
      >
        <Iconify
          icon="eva:trash-2-outline"
          width={20}
        />
        Delete
      </MenuItem>
    </Menu>

    <FormDialog
      open={editDialogOpen}
      onClose={handleCloseEditDialog}
      schema={editSchema}
      title="Edit Project"
      description="Update the project details"
      onConfirm={handleConfirmEdit}
    />

    <DeleteDialog
      openDeleteDialog={deleteDialogOpen}
      handleCloseDeleteDialog={handleCloseDeleteDialog}
      confirmDelete={handleConfirmDelete}
      isSubmitting={isDeleting}
      message={`Are you sure you want to delete "${name}"? This action can't be undone.`}
    />
  </>
  );
};

export default memo(CompactProjectCard);

