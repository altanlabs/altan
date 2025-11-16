import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Agent from '../../components/agents/v2/Agent';

export default function AgentPage() {
  const history = useHistory();
  const { agentId } = useParams();

  const onGoBack = useCallback(() => history.push('/'), [history]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Agent
        agentId={agentId}
        onGoBack={onGoBack}
      />
    </Box>
  );
}
