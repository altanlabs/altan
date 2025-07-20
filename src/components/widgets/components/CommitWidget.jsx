/* eslint-disable react/display-name */
import { Box, Typography, Chip, Tooltip, CircularProgress, Button } from '@mui/material';
import { memo, useState, useEffect } from 'react';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch.js';
import { optimai } from '../../../utils/axios.js';
import Iconify from '../../iconify/Iconify.jsx';

const CommitWidget = memo(({ hash }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const fetchCommitDetails = async () => {
    if (loading || details) return;

    setLoading(true);
    try {
      const response = await optimai.get(`/interfaces/commits/${hash}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching commit details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await optimai.post(`/interfaces/commits/${hash}/restore`);
      dispatchWithFeedback(null, {
        successMessage: 'Successfully restored to commit',
        errorMessage: 'Failed to restore commit',
        useSnackbar: true,
      });
    } catch (error) {
      console.error('Error restoring commit:', error);
    } finally {
      setRestoring(false);
    }
  };

  // Auto-fetch details on mount
  useEffect(() => {
    fetchCommitDetails();
  }, [hash]);

  return (
    <Box
      sx={{
        my: 1,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'background.neutral',
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={details ? 2 : 0}
      >
        <Typography variant="subtitle2">
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
            variant="h6"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {details.message}
          </Typography>
          {details.changed_files?.length > 0 && (
            <Box
              display="flex"
              gap={0.5}
              flexWrap="wrap"
            >
              {details.changed_files.map((file, index) => (
                <Chip
                  key={index}
                  label={file}
                  size="small"
                  variant="soft"
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

export default CommitWidget;
