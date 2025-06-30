import { Box, List, Tooltip, IconButton, Button, Menu, MenuItem, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState, memo, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { cn } from '@lib/utils';

import { MovingComponent } from '../../components/aceternity/buttons/moving-border';
import { CardTitle } from '../../components/aceternity/cards/card-hover-effect';
import DeleteDialog from '../../components/dialogs/DeleteDialog';
import Iconify from '../../components/iconify/Iconify';
import { bgBlur } from '../../utils/cssStyles';

// Styled Components
const DrawerContainer = styled(Box)(({ iscollapsed }) => ({
  width: iscollapsed ? 80 : 220,
  minWidth: iscollapsed ? 80 : 220,
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

const IconContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  width: 24,
  flexShrink: 0,
});

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

// List Component Button
const ListComponentButton = memo(
  ({ component, onTabChange, selected = false, isCollapsed = false, isSorting, onContextMenu }) => {
    const onButtonClick = useCallback(() => {
      component.type === 'external_link'
        ? window.open(component.params?.url, '_blank')
        : onTabChange(component.id);
    }, [component, onTabChange]);

    const onContextMenuClick = useCallback(
      (e) => onContextMenu(e, component),
      [component, onContextMenu],
    );

    return (
      <MovingComponent
        onClick={onButtonClick}
        onContextMenu={onContextMenuClick}
        borderRadius="0.75rem"
        duration={isCollapsed ? 4000 : 12000}
        containerClassName={cn(
          'h-[40] w-full transform hover:opacity-100 transition-transform:opacity duration-300 ease-in-out opacity-75 border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
          isCollapsed && 'hover:scale-110',
          selected && 'border-gray-300 dark:border-gray-700 shadow-lg',
        )}
        borderClassName={cn(isCollapsed ? 'h-[20px] w-[60px]' : 'h-[80px] w-[150px]')}
        enableBorder={selected}
        className={cn(
          'p-2 bg-white dark:bg-black overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20',
        )}
      >
        <Tooltip
          title={isCollapsed ? component.name : ''}
          placement="left"
        >
          <IconContainer>
            {isSorting ? (
              <Iconify
                icon="mi:drag"
                width={17}
              />
            ) : (
              <Iconify
                icon={
                  component.icon ||
                  (component.type === 'external_link'
                    ? 'akar-icons:link-out'
                    : 'iconamoon:component')
                }
                width={isCollapsed ? 20 : 17}
              />
            )}
          </IconContainer>
        </Tooltip>
        {!isCollapsed && (
          <CardTitle className="text-left truncate w-full ml-2">{component.name}</CardTitle>
        )}
      </MovingComponent>
    );
  },
);

const StaticDrawerNavDesktop = ({
  activeTab,
  onTabChange,
  onClickCreateComponent,
  onDeleteComponent,
  components = [],
  showSettings = true,
  showRoom = true,
  id = null,
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
    // dispatch(updateAltanerPositionsById(id, { components: sortedComponents }));
  }, [id, sortedComponents]);

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

  return (
    <DrawerContainer iscollapsed={isCollapsed ? '1' : undefined}>
      <StyledIconButton onClick={toggleCollapsed}>
        <Iconify
          width={16}
          icon={isCollapsed ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
        />
      </StyledIconButton>

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
                      <ListComponentButton
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
        {id && !isSorting && (
          <Tooltip
            arrow
            followCursor
            title="Create"
          >
            <MovingComponent
              onClick={onClickCreateComponent}
              borderRadius="0.75rem"
              // duration={15000}
              containerClassName="h-[40] w-full transform hover:scale-105 transition-transform duration-300 ease-in-out border border-gray-300 dark:border-gray-700"
              // borderClassName={`h-[80px] w-[250px]`}
              enableBorder={false}
              className="p-1 overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20"
            >
              <Iconify
                icon="mdi:plus"
                width={24}
              />
            </MovingComponent>
          </Tooltip>
        )}
        {showRoom && (
          <MovingComponent
            onClick={() => onTabChange('room')}
            borderRadius="0.75rem"
            containerClassName={cn(
              'h-[40] w-full transform hover:opacity-100 transition-transform:opacity duration-300 ease-in-out opacity-75 border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
              isCollapsed && 'hover:scale-110',
              activeTab === 'room' && 'border-gray-300 dark:border-gray-700 shadow-lg',
            )}
            duration={isCollapsed ? 4000 : 15000}
            borderClassName={cn(isCollapsed ? 'h-[20px] w-[60px]' : 'h-[80px] w-[150px]')}
            enableBorder={activeTab === 'room'}
            className="p-2 bg-white dark:bg-black overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20"
          >
            <Tooltip
              title={isCollapsed ? 'Room' : ''}
              placement="right"
            >
              <Iconify
                icon="fluent:chat-multiple-16-filled"
                width={24}
              />
            </Tooltip>
            {!isCollapsed && <CardTitle className="text-left truncate w-full ml-2">Room</CardTitle>}
          </MovingComponent>
        )}
        {showSettings && (
          <MovingComponent
            onClick={() => onTabChange('settings')}
            borderRadius="0.75rem"
            containerClassName={cn(
              'h-[40] w-full transform hover:opacity-100 transition-transform:opacity duration-300 ease-in-out opacity-75 border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
              isCollapsed && 'hover:scale-110',
              activeTab === 'settings' && 'border-gray-300 dark:border-gray-700 shadow-lg',
            )}
            duration={isCollapsed ? 4000 : 15000}
            borderClassName={cn(isCollapsed ? 'h-[20px] w-[60px]' : 'h-[80px] w-[150px]')}
            enableBorder={activeTab === 'settings'}
            className="p-2 bg-white dark:bg-black overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20"
          >
            <Tooltip
              title={isCollapsed ? 'Settings' : ''}
              placement="right"
            >
              <Iconify
                icon="mdi:cog"
                width={24}
              />
            </Tooltip>
            {!isCollapsed && (
              <CardTitle className="text-left truncate w-full ml-2">Settings</CardTitle>
            )}
          </MovingComponent>
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
          confirmDelete={() => {
            onDeleteComponent(componentToDelete.id);
            setComponentToDelete(null);
          }}
          isSubmitting={isDeleting}
          message={`Are you sure you want to delete the component "${componentToDelete.name}"? This action can't be undone.`}
          confirmationText={componentToDelete.name}
        />
      )}
    </DrawerContainer>
  );
};

export default memo(StaticDrawerNavDesktop);
