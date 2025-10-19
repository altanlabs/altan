import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { optimai_pods } from '../../../../utils/axios';

export default function NoDevBuildOverlay({ interfaceId, onRebuildStart }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleRebuild = async () => {
    setIsRebuilding(true);
    onRebuildStart?.();

    try {
      // Step 1: Fetch current README.md content
      let readmeContent = '';
      try {
        const response = await optimai_pods.get(
          `/interfaces/dev/${interfaceId}/files/content?path=README.md`
        );
        readmeContent = response.data.content || '';
      } catch (error) {
        // README might not exist, that's okay
        console.log('README.md not found, creating new one');
        readmeContent = '';
      }

      // Step 2: Append an empty line to trigger a change
      const updatedContent = readmeContent + '\n';

      // Step 3: Save the file
      await optimai_pods.post(`/interfaces/dev/${interfaceId}/files/create`, {
        file_name: 'README.md',
        content: updatedContent,
      });

      // Step 4: Commit the change
      await optimai_pods.post(`/interfaces/dev/${interfaceId}/repo/commit`, {
        message: 'Rebuild',
      });

      enqueueSnackbar('Rebuild triggered successfully! Building your preview...', {
        variant: 'success',
        autoHideDuration: 4000,
      });
      
      // Don't reset isRebuilding here - let the parent component handle it
      // when the new commit arrives via WebSocket
    } catch (error) {
      console.error('Failed to rebuild:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to trigger rebuild. Please try again.',
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
      setIsRebuilding(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        zIndex: 1000,
        p: 3,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Welcome to preivews v2
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          The preview build hasn't been created yet or might have failed. Click the button below to
          trigger a new build.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleRebuild}
          disabled={isRebuilding}
          startIcon={isRebuilding ? <CircularProgress size={20} /> : null}
          sx={{
            minWidth: 150,
            textTransform: 'none',
            fontSize: '1rem',
            py: 1.5,
          }}
        >
          {isRebuilding ? 'Rebuilding...' : 'Rebuild'}
        </Button>
      </Box>
    </Box>
  );
}

