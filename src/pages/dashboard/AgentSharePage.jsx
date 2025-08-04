import { Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import { Room } from '../../lib/agents/components';

// ----------------------------------------------------------------------

export default function AgentSharePage() {
  const { agentId } = useParams();
  const location = useLocation();
  const { user } = useAuthContext();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract demo_website from query parameters
  const searchParams = new URLSearchParams(location.search);
  const demoWebsite = searchParams.get('demo_website');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.altan.ai/platform/agent/${agentId}/public`);
        setAgent(response.data.agent);
        console.log('agent fetched', response.data.agent);

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

  // If demo_website is present, render compact mode with iframe
  if (demoWebsite) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Compact Room Section */}
        {agent?.account_id && (
          <Room
            mode="compact"
            accountId={agent.account_id}
            agentId={agentId}
            members={agent.widget?.members || false}
            settings={agent.widget?.settings || false}
            tabs={agent.widget?.tabs || false}
            conversation_history={agent.widget?.conversation_history || true}
            show_close_button={true}
            theme={agent.widget?.theme || 'dark'}
            title={agent.widget?.title || 'Chat'}
            description={agent.widget?.description || ''}
            suggestions={agent.widget?.suggestions || []}
            voice_enabled={agent.widget?.voice_enabled || true}
            primary_color={agent.widget?.primary_color || '#007bff'}
            background_color={agent.widget?.background_color || '#ffffff'}
            background_blur={agent.widget?.background_blur || true}
            position={agent.widget?.position || 'bottom-center'}
            widget_width={agent.widget?.width || 350}
            room_width={agent.widget?.room_width || 450}
            room_height={agent.widget?.room_height || 700}
            border_radius={agent.widget?.border_radius || 16}
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

        {/* Fullscreen Iframe Section */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <iframe
            src={demoWebsite}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              flex: 1,
              minHeight: 0,
            }}
            title="Demo Website"
            allow="fullscreen"
          />
        </Box>
      </Box>
    );
  }

  // Default rendering without demo_website
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
