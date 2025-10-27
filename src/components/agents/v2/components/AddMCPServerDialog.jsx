import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useTheme,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

import Iconify from '../../../iconify';

function AddMCPServerDialog({
  open,
  onClose,
  accountServers,
  connecting,
  onConnect,
  onCreateNew,
}) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600 }}
        >
          Add MCP Server
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          {/* Available Account Servers */}
          {accountServers.map((server) => (
            <Box
              key={server.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {/* Server Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon="mdi:server"
                  sx={{ fontSize: '1.25rem', color: 'text.primary' }}
                />
              </Box>

              {/* Server Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 0.25 }}
                >
                  {server.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {server.url}
                </Typography>
              </Box>

              {/* Connect Button */}
              <Button
                variant="text"
                size="small"
                onClick={() => onConnect(server.id)}
                disabled={connecting === server.id}
                startIcon={
                  connecting === server.id ? (
                    <CircularProgress
                      size={14}
                      color="inherit"
                    />
                  ) : null
                }
                sx={{
                  minWidth: 70,
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                }}
              >
                {connecting === server.id ? '' : 'Connect'}
              </Button>
            </Box>
          ))}

          {/* New Custom MCP Server Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.grey[500], 0.02),
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
            onClick={onCreateNew}
          >
            <Iconify
              icon="eva:plus-circle-outline"
              sx={{ fontSize: '1.25rem', color: 'text.secondary' }}
            />
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}
            >
              New Custom MCP Server
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AddMCPServerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountServers: PropTypes.array.isRequired,
  connecting: PropTypes.string,
  onConnect: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
};

export default AddMCPServerDialog;

