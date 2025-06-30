/* eslint-disable react/display-name */
import { Box, Menu, MenuItem, alpha } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import DeleteDialog from './dialogs/DeleteDialog';
import DuplicateAltanerDialog from './dialogs/DuplicateAltanerDialog';
import FormDialog from './FormDialog';
import Iconify from './iconify/Iconify';
import IconRenderer from './icons/IconRenderer';
import { deleteAltanerById, updateAltanerById } from '../redux/slices/altaners';
import { fToNow } from '../utils/formatTime';

const selectInterface = (id) => (state) =>
  state.general.account?.interfaces?.find((i) => i.id === id);

const AltanerCard = memo(
  ({ id, name, iconUrl, description, components = [], last_modified, isPinned }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [contextMenu, setContextMenu] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Find interface component if it exists
    const interfaceComponent = components.find((comp) => comp.type === 'interface');
    const interfaceData = useSelector(
      interfaceComponent?.params?.id ? selectInterface(interfaceComponent.params.id) : () => null,
    );
    const coverUrl = interfaceData?.cover_url;

    const handleClick = useCallback(() => {
      navigate(`/project/${id}`);
    }, [id, navigate]);

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

    const handleCloseDuplicateDialog = useCallback(() => {
      setDuplicateDialogOpen(false);
    }, []);

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
        dispatch(updateAltanerById(id, { is_pinned: !isPinned }));
        handleClose();
      } catch (error) {
        console.error('Failed to toggle pin status:', error);
      }
    }, [dispatch, id, isPinned]);

    return (
      <>
        <div
          className="cursor-pointer group"
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
                  icon={iconUrl || 'mdi:apps'}
                  size={64}
                />
              </Box>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Single line with all info */}
            <div className="flex items-center justify-between text-xs w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Icon */}
                <div className="w-4 h-4 flex-shrink-0">
                  <IconRenderer
                    icon={iconUrl || 'mdi:apps'}
                    size={16}
                  />
                </div>

                {/* Name */}
                <span className="truncate max-w-[120px] font-semibold">
                  {name}
                </span>

                {/* Pin indicator */}
                {isPinned && (
                  <div className="flex items-center">
                    <Iconify
                      icon="mdi:pin"
                      width={10}
                      sx={{
                        color: 'inherit',
                      }}
                    />
                  </div>
                )}
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
              icon={isPinned ? 'mdi:pin-off' : 'mdi:pin'}
              width={20}
            />
            {isPinned ? 'Unpin' : 'Pin'}
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

        <DuplicateAltanerDialog
          open={duplicateDialogOpen}
          onClose={handleCloseDuplicateDialog}
          altanerToClone={{
            id,
            name,
            account_id: components[0]?.params?.account_id, // Assuming the first component has the account_id
          }}
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
  },
);

export default AltanerCard;
