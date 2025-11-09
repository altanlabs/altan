/* eslint-disable react/display-name */
import { Typography, Box, alpha, Menu, MenuItem } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import DeleteDialog from './dialogs/DeleteDialog';
import FormDialog from './FormDialog';
import Iconify from './iconify/Iconify';
import IconRenderer from './icons/IconRenderer';
import { deleteAltanerById, updateAltanerById } from '../redux/slices/altaners';

const AltanerAppBox = memo(({ id, name, iconUrl, description }) => {
  const history = useHistory();;
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleClick = useCallback(() => {
    history.push(`/altaners/${id}`);
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
        default: iconUrl,
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
        await dispatch(updateAltanerById(id, data));
        handleCloseEditDialog();
      } catch (error) {
        console.error('Failed to update altaner:', error);
      }
    },
    [dispatch, id],
  );

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleClose();
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteAltanerById(id));
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete altaner:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, id]);

  const isValidUrl = useCallback((string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }, []);

  const icon =
    iconUrl ||
    'https://platform-api.altan.ai/media/07302874-5d8b-46e5-ad18-6570f8ba8258?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285';
  const useBackgroundImage = isValidUrl(icon);

  return (
    <>
      <Box
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          width: '100px',
          margin: '10px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <Box
          sx={{
            borderRadius: '20%',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: (theme) => `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
            ...(useBackgroundImage && {
              backgroundImage: `url(${icon})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }),
          }}
        >
          {!useBackgroundImage && (
            <IconRenderer
              icon={icon.startsWith('@lottie:') ? `${icon}:autoplay,loop` : icon}
              size={62}
            />
          )}
        </Box>
        <Typography
          className="app-name"
          variant="caption"
          sx={{
            mt: 1,
            fontWeight: 'bold',
            transition: 'color 0.3s ease-in-out',
            textAlign: 'center',
          }}
        >
          {name}
        </Typography>
      </Box>
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
});

export default AltanerAppBox;
