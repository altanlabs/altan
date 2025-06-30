import { Menu } from '@mui/material';
import React from 'react';

import Iconify from '../../../components/iconify/Iconify.jsx';

const AltanerComponentContextMenu = ({
  contextMenu,
  onClose,
  onEdit,
  onDelete,
  onOpenInNewTab,
}) => {
  return (
    <Menu
      open={Boolean(contextMenu)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
      }
      PaperProps={{
        elevation: 2,
        sx: {
          minWidth: '140px',
          overflow: 'hidden',
          borderRadius: '0.5rem',
          bgcolor: '#1E1E1E',
          color: 'white',
          p: 0.5,
        },
      }}
    >
      <button
        onClick={onEdit}
        className="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs text-white hover:bg-white/10 transition-colors"
      >
        <Iconify
          icon="eva:edit-fill"
          width={14}
        />
        Edit
      </button>
      <button
        onClick={onOpenInNewTab}
        className="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs text-white hover:bg-white/10 transition-colors"
      >
        <Iconify
          icon="eva:external-link-outline"
          width={14}
        />
        Open in new tab
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs text-red-500 hover:bg-red-500/10 transition-colors"
      >
        <Iconify
          icon="eva:trash-2-outline"
          width={14}
          className="text-red-500"
        />
        Delete
      </button>
    </Menu>
  );
};

export default AltanerComponentContextMenu;
