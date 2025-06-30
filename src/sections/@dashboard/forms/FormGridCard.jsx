import {
  Description as DescriptionIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Typography, Box, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import React, { memo, useState } from 'react';

import useResponsive from '../../../hooks/useResponsive';
import { fToNow } from '../../../utils/formatTime';

const FormGridCard = ({ form, onEdit, onShare, onViewResponses, onDelete }) => {
  const isSmallScreen = useResponsive('down', 'md');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action, event) => {
    event.stopPropagation();
    handleCloseMenu(event);
    action(form);
  };

  const handleOpenInNewTab = (event) => {
    event.stopPropagation();
    handleCloseMenu(event);
    window.open(`https://app.altan.ai/form/${form.id}`, '_blank');
  };

  return (
    <Card
      sx={{
        m: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.shadows[2],
        },
      }}
      onClick={() => onEdit(form)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ mb: 0.5 }}
              >
                {form.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Created {fToNow(form.date_creation)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onEdit, e);
                }}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onShare, e);
                }}
                color="primary"
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Responses">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onViewResponses, e);
                }}
                color="primary"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in new tab">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInNewTab(e);
                }}
                color="primary"
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onDelete, e);
                }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default memo(FormGridCard);
