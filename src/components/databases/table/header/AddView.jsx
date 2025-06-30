import {
  Add as AddIcon,
  GridOn as GridIcon,
  Collections as GalleryIcon,
  ViewKanban as KanbanIcon,
  CalendarMonth as CalendarIcon,
  Description as FormIcon,
  Extension as PluginIcon,
} from '@mui/icons-material';
import {
  Button,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useState } from 'react';

const VIEW_TYPES = {
  GRID: 'grid',
  GALLERY: 'gallery',
  KANBAN: 'kanban',
  CALENDAR: 'calendar',
  FORM: 'form',
};

const VIEW_INFO_LIST = [
  {
    name: 'Table',
    type: VIEW_TYPES.GRID,
    Icon: GridIcon,
  },
  {
    name: 'Gallery',
    type: VIEW_TYPES.GALLERY,
    Icon: GalleryIcon,
  },
  {
    name: 'Kanban',
    type: VIEW_TYPES.KANBAN,
    Icon: KanbanIcon,
  },
  {
    name: 'Calendar',
    type: VIEW_TYPES.CALENDAR,
    Icon: CalendarIcon,
  },
  {
    name: 'Form',
    type: VIEW_TYPES.FORM,
    Icon: FormIcon,
  },
];

export const AddView = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewTypeSelect = (type, name) => {
    // TODO: Implement view creation logic
    console.log(`Creating new ${type} view named ${name}`);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        sx={{
          minWidth: 'auto',
          width: 32,
          height: 32,
          padding: 0,
        }}
        onClick={handleClick}
      >
        <AddIcon fontSize="small" />
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList sx={{ width: 180, py: 0.5 }}>
          {VIEW_INFO_LIST.map(({ name, type, Icon }) => (
            <MenuItem
              key={type}
              onClick={() => handleViewTypeSelect(type, name)}
              sx={{ py: 1 }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={name} />
            </MenuItem>
          ))}

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={handleClose}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <PluginIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Plugin View" />
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};
