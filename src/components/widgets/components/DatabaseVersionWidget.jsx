/* eslint-disable react/display-name */
import { Box, Typography, Tooltip, CircularProgress, Button, Chip } from '@mui/material';
import { memo, useState, useEffect } from 'react';

import { optimai } from '../../../utils/axios.js';
import Iconify from '../../iconify/Iconify.jsx';

const DatabaseVersionWidget = memo(({ id }) => {
  const [templateVersion, setTemplateVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplateVersion = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await optimai.get(`/templates/versions/${id}`);
        setTemplateVersion(response.data.template_version);
        setError(null);
      } catch (error) {
        console.error('Error fetching template version:', error);
        setError('Failed to load template version');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateVersion();
  }, [id]);

  const versionString = templateVersion?.version_string || templateVersion?.version || 'Unknown';

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
        mb={templateVersion && !loading ? 2 : 0}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Iconify
            icon="mdi:database"
            width={16}
            sx={{ color: 'text.secondary' }}
          />
          <Typography variant="subtitle2">Checkpoint</Typography>
        </Box>
        <Box
          display="flex"
          gap={1}
          alignItems="center"
        >
          {templateVersion && (
            <Chip
              label={`v${versionString}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 24,
                borderColor: 'divider',
                color: 'text.secondary',
              }}
            />
          )}
        </Box>
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

      {error && (
        <Typography
          variant="body2"
          color="error.main"
          sx={{ textAlign: 'center', py: 1 }}
        >
          {error}
        </Typography>
      )}

      {templateVersion && !loading && (
        <Box>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 2, fontSize: '0.875rem' }}
          >
            {templateVersion?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default DatabaseVersionWidget;
