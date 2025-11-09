import { Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import Room from '../../components/room/Room';
import Login from '../../sections/auth/Login';
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

export default function AgentSharePage() {
  const { agentId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const [agent, setAgent] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract demo_website from query parameters
  const searchParams = new URLSearchParams(location.search);
  const demoWebsite = searchParams.get('demo_website');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://platform-api.altan.ai/agent/${agentId}/public`);
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

  // Fetch DM room for the agent
  useEffect(() => {
    const fetchDmRoom = async () => {
      if (!isAuthenticated || !agentId) {
        return;
      }

      try {
        const response = await optimai.get(`/agent/${agentId}/dm`);
        setRoomId(response.data.id);
      } catch {
        setError('Failed to load chat room');
      }
    };

    fetchDmRoom();
  }, [agentId, isAuthenticated]);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

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

  // Show loading while fetching room
  if (!roomId) {
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

  // If demo_website is present, render compact mode with iframe
  if (demoWebsite) {
    return (
      <Box
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Compact Room Section */}
        <Room
          roomId={roomId}
          members={agent.widget?.members || false}
          settings={agent.widget?.settings || false}
          tabs={agent.widget?.tabs || false}
          conversation_history={agent.widget?.conversation_history || true}
          show_close_button={true}
          show_fullscreen_button={agent.widget?.show_fullscreen_button || true}
          show_sidebar_button={agent.widget?.show_sidebar_button || false}
          title={agent.widget?.title || agent.name || 'Chat'}
          description={agent.widget?.description || ''}
          suggestions={agent.widget?.suggestions || []}
          voice_enabled={agent.widget?.voice_enabled || true}
        />

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
        height: '100dvh',
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
        <Room
          roomId={roomId}
          members={false}
          settings={false}
          title={agent.name || 'Chat'}
          description={agent.description || ''}
          voice_enabled={true}
        />
      </Box>
    </Box>
  );
}
