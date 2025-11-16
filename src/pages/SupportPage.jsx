import React, { useEffect, useState } from 'react';

import { useAuthContext } from '../auth/useAuthContext.ts';
import RoomContainer from '../components/new-room/RoomContainer.tsx';
import { CompactLayout } from '../layouts/dashboard';
import Login from '../sections/auth/Login';
import { optimai } from '../utils/axios';
// ----------------------------------------------------------------------

export default function SupportPage() {
  const supportAgentId = '9752fe41-c447-4731-a0de-5c318823679e';
  const { isAuthenticated } = useAuthContext();
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch DM room for support agent
  useEffect(() => {
    const fetchDmRoom = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await optimai.get(`/agent/${supportAgentId}/dm`);
        setRoomId(response.data.id);
      } catch {
        // Handle error silently or show user-friendly message
      } finally {
        setLoading(false);
      }
    };

    fetchDmRoom();
  }, [isAuthenticated]);

  // Show login if user is not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show loading while fetching room
  if (loading || !roomId) {
    return (
      <CompactLayout noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </CompactLayout>
    );
  }

  // Render the support DM room
  return (
    <CompactLayout noPadding>
      <RoomContainer
        roomId={roomId}
        title="Support Chat"
        description="How can we help you today?"
        suggestions={[
          'How do I get started?',
          'I need help with my account',
          'Technical support',
          'Billing questions',
        ]}
        voice_enabled={true}
      />
    </CompactLayout>
  );
}
