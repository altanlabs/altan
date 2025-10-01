/* eslint-disable no-console */
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import {
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, memo, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { selectTablesByBaseId, updateTableById } from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import DeleteDialog from '../../dialogs/DeleteDialog.jsx';
import Iconify from '../../iconify';
import CreateTableDialog from '../table/CreateTableDialog.jsx';
import EditTableDrawer from '../table/EditTableDrawer.jsx';

const StyledTabs = styled(Tabs)(() => ({
  minHeight: '30px',
  position: 'relative',
  backgroundColor: 'transparent',
  padding: '0 0 0 8px',
  minWidth: 0,
  maxWidth: '100%',
  width: '100%',
  flex: 1,
  overflow: 'hidden',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-flexContainer': {
    gap: '0px',
    minWidth: 0,
    '& > *': {
      margin: '0 !important',
    },
  },
  '& .MuiTabs-scroller': {
    overflow: 'auto !important',
    flexGrow: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  '& .MuiTabs-scrollButtons': {
    flexShrink: 0,
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
  '& .MuiButtonBase-root': {
    margin: '0 !important',
    minWidth: '0 !important',
    padding: '6px 12px !important',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  height: '30px',
  padding: '0 16px',
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '0.01em',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  borderRadius: '6px 6px 0 0',
  margin: '0 2px !important',
  minWidth: '0 !important',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: 'transparent',
  position: 'relative',
  overflow: 'hidden',

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
  },

  '&.Mui-selected': {
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.9)',
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
    borderBottom: theme.palette.mode === 'dark' 
      ? '2px solid rgba(255, 255, 255, 0.2)' 
      : '2px solid rgba(0, 0, 0, 0.1)',

    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.12)' 
        : 'rgba(255, 255, 255, 1)',
    },
  },

  '& .drag-handle': {
    cursor: 'grab',
    opacity: 0.3,
    fontSize: '14px',
    marginRight: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: 0.6,
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  marginRight: '4px',
  borderRadius: '6px',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: 'transparent',
  height: '28px',
  width: '28px',

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    transform: 'scale(1.05)',
  },

  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const TableDropdownButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '6px',
  padding: '4px',
  minWidth: 'auto',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  marginRight: '8px',
  height: '28px',
  width: '28px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
  },
}));

// Update the CustomTab component to match the new styling
const CustomTab = React.forwardRef(({ dragHandleProps, isLoading, ...props }, ref) => {
  return (
    <StyledTab
      ref={ref}
      {...props}
      label={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
        >
          <span
            {...dragHandleProps}
            style={{
              cursor: 'grab',
              opacity: 0.5,
              fontSize: '14px',
              touchAction: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            ⋮
          </span>
          <span>{props.label}</span>
          {isLoading && props.selected && (
            <CircularProgress
              size={14}
              thickness={4}
              sx={{ ml: 1 }}
              color="inherit"
            />
          )}
        </div>
      }
    />
  );
});

CustomTab.displayName = 'CustomTab';

// Create a memoized version of the tabs content
const TabsList = memo(
  ({
    tables,
    activeTableId,
    onTableChange,
    handleContextMenu,
    onCreateTable,
    isLoading,
    onOpenTableDropdown,
  }) => {
    // Sort tables by order and ensure valid data
    const sortedTables = useMemo(() => {
      if (!Array.isArray(tables)) return [];
      return [...tables]
        .filter((table) => table && table.id) // Filter out invalid tables
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [tables]);

    // Validate activeTableId exists in tables (convert to number for comparison)
    const numericActiveId = typeof activeTableId === 'string' ? parseInt(activeTableId, 10) : activeTableId;
    const isValidTableId = useMemo(() => {
      return sortedTables.some((table) => table.id === numericActiveId);
    }, [sortedTables, numericActiveId]);

    // If activeTableId is invalid, use first table or null
    const effectiveTableId = isValidTableId ? numericActiveId : sortedTables[0]?.id || null;

    // No need to get active table name since we're only showing an icon in the dropdown
    return (
      <>
        <div
          className="google-sheets-controls"
          style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}
        >
          {' '}
          <Tooltip title="Add new table">
            <AddButton
              onClick={(e) => {
                e.stopPropagation();
                onCreateTable();
              }}
              size="small"
              disabled={isLoading}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </AddButton>
          </Tooltip>
          <Tooltip title="Select table">
            <TableDropdownButton
              onClick={onOpenTableDropdown}
              disabled={isLoading || sortedTables.length === 0}
              size="small"
            >
              <ArrowDropDownIcon fontSize="small" />
            </TableDropdownButton>
          </Tooltip>
        </div>

        {sortedTables.filter(table => table && table.id).map((table, index) => (
          <Draggable
            key={String(table.id)}
            draggableId={String(table.id)}
            index={index}
            disableInteractiveElementBlocking={true}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                style={{
                  ...provided.draggableProps.style,
                  display: 'inline-block',
                }}
              >
                <CustomTab
                  dragHandleProps={provided.dragHandleProps}
                  label={table.name || `Table ${index + 1}`}
                  value={table.id}
                  onContextMenu={(e) => handleContextMenu(e, table.id)}
                  selected={table.id === effectiveTableId}
                  onClick={() => onTableChange(table.id)}
                  isLoading={isLoading && table.id === effectiveTableId}
                />
              </div>
            )}
          </Draggable>
        ))}
      </>
    );
  },
  (prevProps, nextProps) => {
    const tablesEqual = JSON.stringify(prevProps.tables) === JSON.stringify(nextProps.tables);
    const activeEqual = prevProps.activeTableId === nextProps.activeTableId;
    const loadingEqual = prevProps.isLoading === nextProps.isLoading;
    return tablesEqual && activeEqual && loadingEqual;
  },
);

TabsList.displayName = 'TabsList';

// Main component using the memoized TabsList
function TableTabs({
  activeTableId,
  onTableChange,
  onDeleteTable,
  onImportTable,
  isLoading = false,
  baseId = null,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createTableDialogOpen, setCreateTableDialogOpen] = useState(false);
  const [tableDropdownAnchor, setTableDropdownAnchor] = useState(null);

  const tables = useSelector((state) => selectTablesByBaseId(state, baseId));

  // Validate and sanitize tables prop
  const validTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    return tables.filter((table) => table && typeof table === 'object' && table.id);
  }, [tables]);

  // Ensure activeTableId is valid (convert to number for comparison)
  const effectiveTableId = useMemo(() => {
    if (!activeTableId || validTables.length === 0) {
      return validTables[0]?.id || null;
    }
    // Convert activeTableId to number for comparison (pg-meta IDs are numeric)
    const numericActiveId = typeof activeTableId === 'string' ? parseInt(activeTableId, 10) : activeTableId;
    const isValidId = validTables.some((table) => table?.id === numericActiveId);
    return isValidId ? numericActiveId : validTables[0]?.id || null;
  }, [activeTableId, validTables]);

  const handleContextMenu = useCallback((event, tableId) => {
    event.preventDefault();
    setSelectedTableId(tableId);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  }, [handleCloseMenu]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedTableId) {
      onDeleteTable(selectedTableId);
      setDeleteDialogOpen(false);
      setSelectedTableId(null);
    }
  }, [selectedTableId, onDeleteTable]);

  const handleEditClick = useCallback(() => {
    setEditDialogOpen(true);
    handleCloseMenu();
  }, [handleCloseMenu]);

  const handleImportClick = useCallback(() => {
    if (selectedTableId && onImportTable) {
      onImportTable(selectedTableId);
      handleCloseMenu();
    }
  }, [selectedTableId, onImportTable, handleCloseMenu]);

  const handleDragEnd = useCallback(
    async (result) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      const movedTable = tables[sourceIndex];

      try {
        // Note: pg-meta doesn't support table ordering directly
        // We'll need to store this in a separate metadata table or use RLS policies
        // For now, skip the API call and just update local state
        // TODO: Implement table ordering via metadata table
        // await dispatch(
        //   updateTableById(movedTable.base_id, movedTable.id, {
        //     order: destinationIndex,
        //   }),
        // );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update table order:', error);
      }
    },
    [tables],
  );

  const handleDragStart = () => {};

  const handleCreateTable = () => {
    setCreateTableDialogOpen(true);
  };

  const handleOpenTableDropdown = (event) => {
    setTableDropdownAnchor(event.currentTarget);
  };

  const handleCloseTableDropdown = () => {
    setTableDropdownAnchor(null);
  };

  const handleSelectTableFromDropdown = (tableId) => {
    onTableChange(tableId);
    handleCloseTableDropdown();
  };

  // Don't render if we don't have any valid tables and no effective table ID
  if (validTables.length === 0 && !effectiveTableId) {
    return (
      <div className="relative w-full min-w-0 p-0">
        <div
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
            minWidth: 0,
            overflowX: 'auto',
            minHeight: '30px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No tables available
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 p-0">
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <Droppable
          droppableId="tables"
          direction="horizontal"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                minWidth: 0,
                overflowX: 'auto',
                minHeight: '30px',
              }}
            >
              <StyledTabs
                value={effectiveTableId || false}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Tables"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: '100%',
                  width: '100%',
                  '& .MuiTabs-scrollButtons': {
                    flexShrink: 0,
                  },
                  '& .MuiTabs-scroller': {
                    flexGrow: 1,
                    minWidth: 0,
                  },
                }}
              >
                <TabsList
                  tables={validTables}
                  activeTableId={activeTableId}
                  onTableChange={onTableChange}
                  handleContextMenu={handleContextMenu}
                  onCreateTable={handleCreateTable}
                  onOpenTableDropdown={handleOpenTableDropdown}
                  isLoading={isLoading}
                />
                {provided.placeholder}
              </StyledTabs>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        <MenuItem
          onClick={handleEditClick}
          disabled={isLoading}
        >
          <DriveFileRenameOutlineIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleImportClick}
          disabled={isLoading}
        >
          <Iconify
            icon="mdi:upload"
            width={16}
            height={16}
            sx={{ mr: 1 }}
          />
          Import
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          disabled={isLoading}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Delete
        </MenuItem>
      </Menu>

      {/* Table Selection Dropdown */}
      <Menu
        anchorEl={tableDropdownAnchor}
        open={Boolean(tableDropdownAnchor)}
        onClose={handleCloseTableDropdown}
        sx={{ maxHeight: '300px' }}
      >
        {validTables.map((table) => (
          <MenuItem
            key={table.id}
            onClick={() => handleSelectTableFromDropdown(table.id)}
            selected={table.id === effectiveTableId}
            sx={{
              fontSize: '13px',
              minHeight: '36px',
              padding: '4px 16px',
            }}
          >
            {table.name || 'Untitled Table'}
          </MenuItem>
        ))}
        {validTables.length === 0 && (
          <MenuItem
            disabled
            sx={{ fontSize: '13px', opacity: 0.7 }}
          >
            No tables available
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleCloseTableDropdown();
            handleCreateTable();
          }}
          divider
          sx={{
            fontSize: '13px',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AddIcon fontSize="small" />
          Add new table
        </MenuItem>
      </Menu>

      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={() => {
          setDeleteDialogOpen(false);
          setSelectedTableId(null);
        }}
        confirmDelete={handleConfirmDelete}
        title="Delete Table"
        message="Are you sure you want to delete this table? All data will be permanently lost."
      />

      <EditTableDrawer
        baseId={baseId}
        tableId={selectedTableId}
        table={validTables.find((t) => t.id === selectedTableId)}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedTableId(null);
        }}
      />

      <CreateTableDialog
        baseId={baseId}
        open={createTableDialogOpen}
        onClose={() => setCreateTableDialogOpen(false)}
      />
    </div>
  );
}

export default memo(TableTabs);
