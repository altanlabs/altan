import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { optimai } from '../../../../utils/axios';

function DeploymentLogsDialog({ open, onClose, deploymentId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await optimai.get(`/interfaces/deployment/${deploymentId}/logs`);
      setLogs(response.data.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when dialog opens
  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, deploymentId]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Deployment Logs</DialogTitle>
      <DialogContent>
        {loading && <Typography>Loading logs...</Typography>}
        {error && <Typography color="error">Error loading logs: {error}</Typography>}
        {!loading && !error && logs.length === 0 && <Typography>No logs available</Typography>}
        {!loading && !error && logs.length > 0 && (
          <Box sx={{ height: '60vh' }}>
            <Virtuoso
              data={logs}
              itemContent={(index, log) => (
                <Box
                  sx={{
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    color:
                      log.type === 'error' || log.state === 'ERROR' ? 'error.main' : 'text.primary',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block' }}
                  >
                    {formatTimestamp(log.created || log.payload?.date)}
                  </Typography>
                  <Typography
                    component="pre"
                    sx={{
                      m: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {log.payload.text}
                  </Typography>
                </Box>
              )}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={fetchLogs}
          disabled={loading}
        >
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeploymentLogsDialog;
