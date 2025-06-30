// src/components/databases/table/header/TableHeader.jsx
import {
  Settings as SettingsIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  Help as HelpIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { Stack, Button, IconButton, Menu, MenuItem, Tabs, Tab, Tooltip } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AddView } from './AddView';

export const TableHeader = ({ table, views, currentView, viewId }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (event, newValue) => {
    // Handle view change navigation
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        height: 42,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {/* Table name */}
      <div className="shrink-0 font-medium">{table?.name}</div>

      {/* Views tabs */}
      <Tabs
        value={viewId}
        onChange={handleViewChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ flex: 1 }}
      >
        {views.map((view) => (
          <Tab
            key={view.id}
            label={view.name}
            value={view.id}
          />
        ))}
      </Tabs>

      {/* Add view button */}
      <AddView />

      {/* Right side actions */}
      <Stack
        direction="row"
        spacing={1}
      >
        <Tooltip title="History">
          <IconButton size="small">
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton
            size="small"
            component={Link}
            to={`/bases/${table?.baseId}/tables/${table.id}/settings`}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Help">
          <IconButton size="small">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          size="small"
          startIcon={<PersonAddIcon />}
          variant="contained"
          sx={{ ml: 1 }}
        >
          Invite
        </Button>

        {/* Mobile menu */}
        <IconButton
          size="small"
          sx={{ display: { md: 'none' } }}
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </Stack>

      {/* Mobile menu items */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <PersonAddIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Invite
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <HistoryIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          History
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Trash
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/bases/${table?.baseId}/tables/${table.id}/settings`}
          onClick={handleMenuClose}
        >
          <SettingsIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <HelpIcon
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Help
        </MenuItem>
      </Menu>
    </Stack>
  );
};
