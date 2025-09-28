import { memo, useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Box, Typography, Popover, Stack, Chip } from '@mui/material';

import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import { useSelector } from '../../redux/store.js';
import { selectActiveResponsesByThread } from '../../redux/slices/room.js';

// Status text mapping for better UX
const statusMessages = {
  submitted: 'is notified',
  scheduled: 'is preparing',
  enqueued: 'is waiting',
  dequeued: 'is ready',
  failed: 'failed',
  started: 'is thinking',
  suspended: 'is paused',
  resumed: 'resumed',
  requeued: 'is waiting again',
  generating: 'is working',
};

// Status colors for visual feedback
const statusColors = {
  submitted: '#3B82F6', // blue
  scheduled: '#6366F1', // indigo
  enqueued: '#F59E0B', // amber
  dequeued: '#10B981', // emerald
  failed: '#EF4444', // red
  started: '#8B5CF6', // violet
  suspended: '#F97316', // orange
  resumed: '#06B6D4', // cyan
  requeued: '#EAB308', // yellow
  generating: '#8B5CF6', // violet
};

const ResponseStatusBar = ({ threadId, className = '' }) => {
  const activeResponses = useSelector((state) => selectActiveResponsesByThread(threadId)(state));
  const [hoveredResponse, setHoveredResponse] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAgentHover = useCallback((event, response) => {
    setAnchorEl(event.currentTarget);
    setHoveredResponse(response);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
    setHoveredResponse(null);
  }, []);

  if (!activeResponses || activeResponses.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusMessage = (status) => {
    return statusMessages[status] || status;
  };

  const getStatusColor = (status) => {
    return statusColors[status] || '#6B7280';
  };

  const renderSingleAgent = (response) => {
    const statusColor = getStatusColor(response.status);
    
    return (
      <m.div
        key={response.response_id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        onMouseEnter={(e) => handleAgentHover(e, response)}
        onMouseLeave={handlePopoverClose}
      >
        <div className="relative">
          <CustomAvatar
            src={response.agent?.avatar}
            name={response.agent?.name || 'Agent'}
            sx={{ 
              width: 24, 
              height: 24,
              fontSize: '0.75rem',
            }}
          />
          <m.div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900"
            style={{ backgroundColor: statusColor }}
            animate={{ 
              scale: response.status === 'generating' ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: response.status === 'generating' ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <Typography 
          variant="caption" 
          className="text-gray-700 dark:text-gray-300 font-medium"
          sx={{ fontSize: '0.75rem' }}
        >
          {response.agent?.name || 'Agent'} {getStatusMessage(response.status)}
        </Typography>
      </m.div>
    );
  };

  const renderMultipleAgents = () => {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-1 px-3 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
        onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
        onMouseLeave={() => setAnchorEl(null)}
      >
        <div className="flex -space-x-1">
          {activeResponses.slice(0, 3).map((response, index) => (
            <div key={response.response_id} className="relative">
              <CustomAvatar
                src={response.agent?.avatar}
                name={response.agent?.name || 'Agent'}
                sx={{ 
                  width: 20, 
                  height: 20,
                  fontSize: '0.6rem',
                  border: '1px solid',
                  borderColor: 'background.paper',
                  zIndex: 3 - index,
                }}
              />
              <m.div
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-gray-900"
                style={{ backgroundColor: getStatusColor(response.status) }}
                animate={{ 
                  scale: response.status === 'generating' ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: response.status === 'generating' ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            </div>
          ))}
        </div>
        
        <Typography 
          variant="caption" 
          className="text-gray-700 dark:text-gray-300 font-medium ml-2"
          sx={{ fontSize: '0.75rem' }}
        >
          {activeResponses.length} agents working
        </Typography>
      </m.div>
    );
  };

  return (
    <AnimatePresence>
      <div className={`flex justify-center ${className}`}>
        {activeResponses.length === 1 ? renderSingleAgent(activeResponses[0]) : renderMultipleAgents()}
      </div>

      {/* Detailed popover for hover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            sx: {
              pointerEvents: 'auto',
              maxWidth: 320,
              maxHeight: 400,
              overflow: 'auto',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {activeResponses.length === 1 && hoveredResponse ? (
            // Single agent detailed view
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CustomAvatar
                  src={hoveredResponse.agent?.avatar}
                  name={hoveredResponse.agent?.name || 'Agent'}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {hoveredResponse.agent?.name || 'Agent'}
                  </Typography>
                  <Chip
                    label={getStatusMessage(hoveredResponse.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(hoveredResponse.status),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                </Box>
              </Stack>

              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Timeline
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {hoveredResponse.events.map((event, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(event.type.replace(/^(activation|response)\./, '')),
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ flex: 1 }}>
                        {event.type.replace(/^(activation|response)\./, '')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        {formatTimestamp(event.timestamp)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            // Multiple agents overview
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight="medium">
                Active Responses ({activeResponses.length})
              </Typography>
              {activeResponses.map((response) => (
                <Box key={response.response_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <div className="relative">
                    <CustomAvatar
                      src={response.agent?.avatar}
                      name={response.agent?.name || 'Agent'}
                      sx={{ width: 28, height: 28 }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(response.status),
                        border: '1px solid',
                        borderColor: 'background.paper',
                      }}
                    />
                  </div>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {response.agent?.name || 'Agent'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getStatusMessage(response.status)} • {formatTimestamp(response.updated_at)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Popover>
    </AnimatePresence>
  );
};

export default memo(ResponseStatusBar);
