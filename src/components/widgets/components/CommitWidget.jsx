import { Box, Typography, Tooltip, CircularProgress, Button } from '@mui/material';
import { memo, useState, useEffect } from 'react';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch.js';
import { fetchCommitDetails, restoreCommit, selectCommitDetails, selectIsRestoring } from '../../../redux/slices/commits.js';
import { useDispatch, useSelector } from '../../../redux/store.js';
import Iconify from '../../iconify/Iconify.jsx';

const CommitWidget = ({ hash }) => {
  const dispatch = useDispatch();
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [dispatchWithFeedback] = useFeedbackDispatch();

  // Get commit details and loading state from Redux
  const { data: details, loading } = useSelector((state) => selectCommitDetails(state, hash));
  const restoring = useSelector((state) => selectIsRestoring(state, hash));

  // Get current interfaceId from Redux state
  const currentInterfaceId = useSelector((state) => state.general?.account?.interfaces?.[0]?.id);

  // Auto-fetch details on mount - only when hash changes and not already loaded
  useEffect(() => {
    if (hash) {
      dispatch(fetchCommitDetails(hash, currentInterfaceId));
    }
  }, [hash, currentInterfaceId, dispatch]);

  const handleRestore = async () => {
    dispatchWithFeedback(() => dispatch(restoreCommit(hash, currentInterfaceId)), {
      successMessage: 'Successfully restored to commit',
      errorMessage: 'Failed to restore commit',
      useSnackbar: true,
    });
  };

  return (
    <Box
      sx={{
        my: 1,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={details ? 2 : 0}
      >
        <Typography variant="h6">
          Checkpoint
        </Typography>
        <Tooltip title="Restore to this checkpoint">
          <Button
            size="small"
            onClick={handleRestore}
            disabled={restoring}
            startIcon={restoring ? <CircularProgress size={16} /> : <Iconify icon="mdi:restore" width={16} />}
            variant="outlined"
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            Restore
          </Button>
        </Tooltip>
      </Box>

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          py={2}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {details && (
        <Box>
          <Typography
            variant="subtitle"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {details.message}
          </Typography>

          {details.changed_files?.length > 0 && (
            <Box>
              <Button
                size="small"
                onClick={() => setShowFileDetails(!showFileDetails)}
                startIcon={<Iconify icon={showFileDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={16} />}
                variant="text"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'none',
                  p: 0.5,
                  mb: showFileDetails ? 1 : 0,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {details.stats?.files_changed || details.changed_files.length} file{(details.stats?.files_changed || details.changed_files.length) !== 1 ? 's' : ''} changed
                {details.stats && ` (+${details.stats.total_additions}, -${details.stats.total_deletions})`}
              </Button>

              {showFileDetails && details.stats?.file_stats && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {details.stats.file_stats.map((fileStat, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      py={0.5}
                      sx={{
                        borderBottom: index < details.stats.file_stats.length - 1 ? '1px solid' : 'none',
                        borderBottomColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                        }}
                      >
                        {fileStat.file}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        {fileStat.additions > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.7rem',
                              color: 'success.main',
                              fontFamily: 'monospace',
                            }}
                          >
                            +{fileStat.additions}
                          </Typography>
                        )}
                        {fileStat.deletions > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.7rem',
                              color: 'error.main',
                              fontFamily: 'monospace',
                            }}
                          >
                            -{fileStat.deletions}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default memo(CommitWidget, (prevProps, nextProps) => {
  // Only re-render if hash changes
  return prevProps.hash === nextProps.hash;
});
