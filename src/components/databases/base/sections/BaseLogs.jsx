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
  Snackbar,
  Skeleton,
} from '@mui/material';
import {
  RefreshCw,
  Download,
  Search,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
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
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const observerTarget = useRef(null);
  const lastFetchTimeRef = useRef(null);

  const fetchLogs = useCallback(
    async (append = false) => {
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
        const sortedLogs = fetchedLogs.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
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
        setError(err.response?.data?.message || err.message || 'Failed to load logs');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [baseId, logs.length, serviceFilter],
  );

  useEffect(() => {
    fetchLogs(false);
  }, [baseId, serviceFilter, fetchLogs]);

  // Auto-refresh logs every 10 seconds - silently append new logs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !loadingMore) {
        fetchLogs(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLogs, loading, loadingMore]);

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

  const handleCopyLog = async (log) => {
    const logText = `[${log.timestamp}] ${log.message}`;
    try {
      await navigator.clipboard.writeText(logText);
      setShowCopyFeedback(true);
    } catch (err) {
      console.error('Failed to copy log:', err);
    }
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
        return (
          <AlertCircle
            size={16}
            className="text-red-500"
          />
        );
      case 'warning':
        return (
          <AlertTriangle
            size={16}
            className="text-yellow-500"
          />
        );
      case 'success':
        return (
          <CheckCircle
            size={16}
            className="text-green-500"
          />
        );
      default:
        return (
          <Info
            size={16}
            className="text-blue-500"
          />
        );
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
    const matchesSearch = !searchQuery || message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || getLogLevel(log.message) === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const renderLogsSkeleton = () => (
    <Box
      sx={{
        flex: 1,
        bgcolor: 'grey.900',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'auto',
        p: 1.5,
      }}
    >
      {Array.from({ length: 15 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: 1,
            py: 0.25,
            px: 0.75,
          }}
        >
          <Skeleton
            variant="text"
            width={90}
            height={20}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Skeleton
            variant="text"
            width={`${60 + Math.random() * 40}%`}
            height={20}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        spacing={2}
        sx={{ height: '100%' }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 600 }}
          >
            Logs
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
          >
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={fetchLogs}
                disabled={loading}
              >
                <RefreshCw size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
              >
                <Download size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ py: 0.5 }}
          >
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
          >
            <TextField
              size="small"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 220,
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  bgcolor: 'background.default',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  bgcolor: 'background.default',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            >
              <InputLabel sx={{ fontSize: '0.875rem', top: -4 }}>Service</InputLabel>
              <Select
                value={serviceFilter}
                label="Service"
                onChange={(e) => setServiceFilter(e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                {SERVICES.map((service) => (
                  <MenuItem
                    key={service.value}
                    value={service.value}
                    sx={{ fontSize: '0.875rem' }}
                  >
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
              sx={{
                bgcolor: 'background.default',
                borderRadius: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  margin: 0,
                  border: 0,
                  borderRadius: '6px !important',
                  mx: 0.25,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  height: 32,
                  textTransform: 'none',
                  fontWeight: 500,
                  border: 'none',
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="error">Errors</ToggleButton>
              <ToggleButton value="warning">Warnings</ToggleButton>
              <ToggleButton value="success">Success</ToggleButton>
              <ToggleButton value="info">Info</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* Logs Console */}
        {loading ? (
          renderLogsSkeleton()
        ) : filteredLogs.length === 0 ? (
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
            <Stack
              spacing={2}
              alignItems="center"
            >
              <Typography
                variant="h6"
                color="grey.500"
              >
                No logs found
              </Typography>
              <Typography
                variant="body2"
                color="grey.600"
              >
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
              p: 1.5,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            {filteredLogs.map((log, index) => {
              const level = getLogLevel(log.message);
              return (
                <Box
                  key={index}
                  onClick={() => handleCopyLog(log)}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    py: 0.25,
                    px: 0.75,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      color: 'grey.500',
                      fontSize: '0.75rem',
                      minWidth: 90,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color:
                        level === 'error'
                          ? 'error.light'
                          : level === 'warning'
                            ? 'warning.light'
                            : level === 'success'
                              ? 'success.light'
                              : 'grey.300',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
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
            <Box
              ref={observerTarget}
              sx={{ height: 16, display: 'flex', justifyContent: 'center', py: 1 }}
            >
              {loadingMore && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  <CircularProgress
                    size={14}
                    sx={{ color: 'grey.500' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.7rem', color: 'grey.500' }}
                  >
                    Loading more logs...
                  </Typography>
                </Stack>
              )}
              {!hasMore && logs.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.7rem', color: 'grey.600' }}
                >
                  No more logs available
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Stack>

      <Snackbar
        open={showCopyFeedback}
        autoHideDuration={2000}
        onClose={() => setShowCopyFeedback(false)}
        message="Log copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

export default BaseLogs;
