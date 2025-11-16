import React from 'react';

import { useAuthContext } from '../auth/useAuthContext.ts';
import { CompactLayout } from '../layouts/dashboard';
import { Room } from '../lib/agents';

const ROOM_ID = '914c72e1-99c5-4e99-b77a-e61fb18953b4';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuthContext();

  return (
    <CompactLayout
      noPadding
      title="Community Chat"
    >
      <Room
        mode="room"
        accountId="9d8b4e5a-0db9-497a-90d0-660c0a893285"
        roomId={ROOM_ID}
        onError={(error) => {
          console.error('Chat error:', error);
        }}
      />
    </CompactLayout>
  );
}
