import { Box, List, IconButton, Button, Menu, MenuItem, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState, memo, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import AltanerSwitcher from './AltanerSwitcher';
import {
  MinimalisticListButton,
  MinimalisticNavButton,
  MinimalisticCreateButton,
} from './MinimalisticButtons';
import DeleteDialog from '../../../../components/dialogs/DeleteDialog';
import Iconify from '../../../../components/iconify/Iconify';
import {
  deleteAltanerComponentById,
  updateAltanerPositionsById,
} from '../../../../redux/slices/altaners';
import { dispatch } from '../../../../redux/store.ts';
import { bgBlur } from '../../../../utils/cssStyles';

// Styled Components
const DrawerContainer = styled(Box)(({ iscollapsed }) => ({
  width: iscollapsed ? 80 : 250,
  minWidth: iscollapsed ? 80 : 250,
  borderRight: 1,
  borderColor: 'divider',
  overflowY: 'auto',
  overflowX: 'hidden',
  transition: 'width 0.3s ease-in-out',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: 0.5,
  width: 32,
  height: 32,
  position: 'absolute',
  right: -10,
  top: '50%',
  transform: 'translateY(-50%)',
  borderRadius: '50%',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  border: `solid 1px ${theme.palette.divider}`,
  ...bgBlur({ color: theme.palette.background.default }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  zIndex: 1,
}));

const StaticDrawerNavDesktop = ({
  activeTab,
  onTabChange,
  onClickCreateComponent,
  components = [],
  showSettings = true,
  showRoom = true,
  altanerId = null,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortedComponents, setSortedComponents] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [editedComponent, setEditedComponent] = useState(null);
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (Array.isArray(components)) {
      setSortedComponents(components);
    } else if (components && typeof components === 'object') {
      setSortedComponents(Object.values(components));
    } else {
      setSortedComponents([]);
    }
  }, [components]);

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const items = Array.from(sortedComponents);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      const updatedItems = items.map((item, index) => ({
        ...item,
        position: index,
      }));
      setSortedComponents(updatedItems);
    },
    [sortedComponents],
  );

  const handleSaveSorting = useCallback(() => {
    setIsSorting(false);
    dispatch(updateAltanerPositionsById(altanerId, { components: sortedComponents }));
  }, [altanerId, sortedComponents]);

  const handleContextMenu = useCallback(
    (event, component) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, component }
          : null,
      );
    },
    [contextMenu],
  );

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);
  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const onCancelSorting = useCallback(() => setIsSorting(false), []);

  const handleEdit = useCallback(() => {
    if (!!contextMenu?.component) {
      setEditedComponent(contextMenu.component);
    }
    handleCloseContextMenu();
  }, [contextMenu?.component, handleCloseContextMenu]);

  const handleDelete = useCallback(() => {
    if (!!contextMenu?.component) {
      setComponentToDelete(contextMenu.component);
    }
    handleCloseContextMenu();
  }, [contextMenu?.component, handleCloseContextMenu]);

  const handleReorder = useCallback(() => {
    setIsSorting(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      dispatch(deleteAltanerComponentById(altanerId, componentToDelete.id));
    } catch (error) {
      console.error('Failed to delete component:', error);
    } finally {
      setIsDeleting(false);
      setComponentToDelete(null);
    }
  }, [altanerId, componentToDelete]);

  return (
    <DrawerContainer iscollapsed={isCollapsed ? '1' : undefined}>
      <StyledIconButton onClick={toggleCollapsed}>
        <Iconify
          width={16}
          icon={isCollapsed ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
        />
      </StyledIconButton>

      {altanerId && (
        <Box sx={{ px: 1 }}>
          <AltanerSwitcher />
        </Box>
      )}

      {isSorting && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 1, alignItems: 'center', width: '100%' }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={onCancelSorting}
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon="dashicons:saved" />}
            fullWidth
            variant="contained"
            onClick={handleSaveSorting}
          >
            Save
          </Button>
        </Stack>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="components-list">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ px: 1, flexGrow: 1 }}
            >
              {sortedComponents.map((component, index) => (
                <Draggable
                  key={component.id}
                  draggableId={component.id}
                  index={index}
                  isDragDisabled={!isSorting}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...(isSorting ? provided.dragHandleProps : {})}
                    >
                      <MinimalisticListButton
                        component={component}
                        onTabChange={onTabChange}
                        selected={activeTab === component.id}
                        isCollapsed={isCollapsed}
                        isSorting={isSorting}
                        onContextMenu={handleContextMenu}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <List sx={{ px: 1, mt: 'auto' }}>
        {altanerId && !isSorting && (
          <MinimalisticCreateButton
            onClick={onClickCreateComponent}
            isCollapsed={isCollapsed}
          />
        )}

        {showRoom && (
          <MinimalisticNavButton
            icon="fluent:chat-multiple-16-filled"
            label="Room"
            onClick={() => onTabChange('room')}
            selected={activeTab === 'room'}
            isCollapsed={isCollapsed}
          />
        )}

        {showSettings && (
          <MinimalisticNavButton
            icon="mdi:cog"
            label="Settings"
            onClick={() => onTabChange('settings')}
            selected={activeTab === 'settings'}
            isCollapsed={isCollapsed}
          />
        )}
      </List>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
        slotProps={{
          paper: {
            sx: { maxWidth: 150 },
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={{ gap: 1 }}
        >
          <Iconify
            icon="mdi:pencil"
            width={16}
          />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleReorder}
          sx={{ gap: 1 }}
        >
          <Iconify
            icon="fa-solid:sort"
            width={16}
          />
          Reorder
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ gap: 1 }}
        >
          <Iconify
            icon="mdi:delete"
            width={16}
          />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      {componentToDelete && (
        <DeleteDialog
          openDeleteDialog={Boolean(componentToDelete)}
          handleCloseDeleteDialog={() => setComponentToDelete(null)}
          confirmDelete={confirmDelete}
          isSubmitting={isDeleting}
          message={`Are you sure you want to delete the component "${componentToDelete.name}"? This action can't be undone.`}
          confirmationText={componentToDelete.name}
        />
      )}
    </DrawerContainer>
  );
};

export default memo(StaticDrawerNavDesktop);
