import React from 'react';

import { CompactLayout } from '../layouts/dashboard';
import { Room } from '../lib/agents/components';
import { selectUser } from '../redux/slices/general';
import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

export default function SupportPage() {
  const supportAgentId = '9752fe41-c447-4731-a0de-5c318823679e';
  const accountId = '9d8b4e5a-0db9-497a-90d0-660c0a893285';
  const user = useSelector(selectUser);

  return (
    <CompactLayout noPadding>
      <Room
        mode="agent"
        accountId={accountId}
        agentId={supportAgentId}
        guestInfo={{
          first_name: user?.first_name || user?.name || 'Guest',
          external_id: user?.id || `support-${Date.now()}`,
          email: user?.email || 'support@guest.com',
        }}
        // Styling configuration with glassmorphic design
        primary_color="#007bff"
        background_color="rgba(255,255,255,0.9)"
        background_blur={true}
        border_radius={16}
        voice_enabled={true}
        title="Support Agent"
        description="How can I help you today?"
        suggestions={[
          'How do I get started?',
          'I need help with my account',
          'Technical support',
          'Billing questions',
        ]}
        // Room configuration
        tabs={true}
        conversation_history={true}
        members={false}
        settings={true}
        width="100%"
        height="100%"
        onAuthSuccess={() => {
          // Support chat authenticated
        }}
        onError={() => {
          // Support chat error handled
        }}
        onConversationReady={() => {
          // Support conversation ready
        }}
      />
    </CompactLayout>
  );
}
