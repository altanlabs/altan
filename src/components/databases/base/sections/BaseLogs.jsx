import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { RefreshCw, Download, Search, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { setSession } from '../../../../utils/auth';
import { optimai_cloud } from '../../../../utils/axios';

const SERVICES = [
  { value: 'all', label: 'All Services' },
  { value: 'postgres', label: 'postgres' },
  { value: 'postgrest', label: 'PostgREST' },
  { value: 'gotrue', label: 'Auth' },
  { value: 'pg-meta', label: 'pg-meta' },
  { value: 'storage', label: 'Storage' },
  { value: 'pypulse', label: 'Services' },
];

function BaseLogs({ baseId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const fetchLogs = useCallback(async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Always fetch more lines than we currently have
      // Start with a larger number to get all available logs
      const linesToFetch = append ? logs.length + 500 : 1000;

      // Build URL based on service filter
      let url = `/v1/instances/logs/cloud/${baseId}`;
      if (serviceFilter !== 'all') {
        url += `/service/${serviceFilter}`;
      }
      url += `?tail=${linesToFetch}`;

      const response = await optimai_cloud.get(url);
      const fetchedLogs = response.data?.lines || [];

      // Sort by timestamp, most recent first
      const sortedLogs = fetchedLogs.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp),
      );

      if (append) {
        // Check if we got more logs than before
        if (sortedLogs.length > logs.length) {
          setLogs(sortedLogs);
          setHasMore(true);
        } else {
          // No more logs available
          setHasMore(false);
        }
      } else {
        setLogs(sortedLogs);
        setHasMore(sortedLogs.length >= 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load logs',
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [baseId, logs.length, serviceFilter]);

  useEffect(() => {
    fetchLogs(false);
  }, [baseId, serviceFilter, fetchLogs]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore && !loading) {
          fetchLogs(true);
        }
      },
      { threshold: 0.1 },
    );

    const currentObserverTarget = observerTarget.current;
    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [fetchLogs, loadingMore, hasMore, loading]);

  const handleDownloadLogs = () => {
    const logsText = logs.map((log) => `[${log.timestamp}] ${log.message}`).join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${baseId}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevel = (message) => {
    if (!message) return 'info';
    const msg = message.toLowerCase();

    if (msg.includes('error') || msg.includes('fatal') || msg.includes('N exited')) {
      return 'error';
    }
    if (msg.includes('warn') || msg.includes('deprecation')) {
      return 'warning';
    }
    if (msg.includes('success') || msg.includes('✅')) {
      return 'success';
    }

    return 'info';
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  const filteredLogs = logs.filter((log) => {
    const message = log.message || '';
    const matchesSearch = !searchQuery ||
      message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' ||
      getLogLevel(log.message) === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading logs...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={3} sx={{ height: '100%' }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time application logs and system events
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh logs">
              <IconButton onClick={fetchLogs} disabled={loading}>
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download logs">
              <IconButton onClick={handleDownloadLogs} disabled={logs.length === 0}>
                <Download size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Service</InputLabel>
            <Select
              value={serviceFilter}
              label="Service"
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              {SERVICES.map((service) => (
                <MenuItem key={service.value} value={service.value}>
                  {service.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={levelFilter}
            exclusive
            onChange={(e, value) => value && setLevelFilter(value)}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="error">Errors</ToggleButton>
            <ToggleButton value="warning">Warnings</ToggleButton>
            <ToggleButton value="success">Success</ToggleButton>
            <ToggleButton value="info">Info</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary">
            {filteredLogs.length} {filteredLogs.length !== logs.length && `of ${logs.length}`} logs
          </Typography>
        </Stack>

        {/* Logs Console */}
        {filteredLogs.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.900',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Typography variant="h6" color="grey.500">
                No logs found
              </Typography>
              <Typography variant="body2" color="grey.600">
                {searchQuery || levelFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Logs will appear here when your application generates them'}
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              bgcolor: 'grey.900',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}
          >
            {filteredLogs.map((log, index) => {
              const level = getLogLevel(log.message);
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 16 }}>
                    {getLevelIcon(level)}
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      color: 'grey.500',
                      fontSize: '0.8rem',
                      minWidth: 95,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: level === 'error' ? 'error.light'
                        : level === 'warning' ? 'warning.light'
                          : level === 'success' ? 'success.light'
                            : 'grey.300',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      flex: 1,
                    }}
                  >
                    {log.message || 'No message'}
                  </Typography>
                </Box>
              );
            })}

            {/* Intersection Observer Target */}
            <Box ref={observerTarget} sx={{ height: 20, display: 'flex', justifyContent: 'center', py: 2 }}>
              {loadingMore && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} sx={{ color: 'grey.500' }} />
                  <Typography variant="caption" color="grey.500">
                    Loading more logs...
                  </Typography>
                </Stack>
              )}
              {!hasMore && logs.length > 0 && (
                <Typography variant="caption" color="grey.600">
                  No more logs available
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default BaseLogs;
