import { Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import { Room } from '../../lib/agents/components';

// ----------------------------------------------------------------------

export default function AgentSharePage() {
  const { agentId } = useParams();
  const { user } = useAuthContext();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.altan.ai/platform/agent/${agentId}/public`);
        setAgent(response.data.agent);
        setError(null);
      } catch {
        setError('Failed to load agent information');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !agent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert severity="error">{error || 'Agent not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          '& > *': {
            height: '100%',
            minHeight: '100%',
          },
        }}
      >
        {agent?.account_id && (
          <Room
            mode="agent"
            accountId={agent.account_id}
            agentId={agentId}
            members={false}
            settings={false}
            guestInfo={{
              first_name: user?.first_name || 'Guest',
              last_name: user?.last_name || null,
              email: user?.email || null,
              external_id: user?.id || null,
            }}
            style={{
              height: '100%',
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
