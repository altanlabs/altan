import { LoadingButton } from '@mui/lab';
import { Stack, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import Iconify from '../../components/iconify/Iconify';
import useAgentAttributes from '../../sections/@dashboard/agents/useAgentAttributes';

function AgentNew({ altanerComponentId }) {
  const navigate = useNavigate();
  const { triggerSubmit, isSubmitting, AgentAttributes } = useAgentAttributes({
    mode: 'create',
    onClose: () => navigate(-1), // Go back on close
    altanerComponentId,
  });

  const handleMarketplaceClick = () => {
    navigate('/marketplace?mode=agent');
  };

  return (
    <Stack spacing={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Create New AI Agent</Typography>
        <Button
          startIcon={<Iconify icon="mdi:marketplace" />}
          variant="outlined"
          color="info"
          onClick={handleMarketplaceClick}
        >
          Explore Marketplace
        </Button>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create a new AI agent to automate tasks, answer questions, or assist with workflows.
        Customize your agent&apos;s behavior, knowledge, and capabilities to fit your needs.
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          triggerSubmit();
        }}
      >
        {AgentAttributes}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            variant="contained"
            color="primary"
          >
            Create Agent
          </LoadingButton>
        </Stack>
      </Box>
    </Stack>
  );
}

export default AgentNew;
