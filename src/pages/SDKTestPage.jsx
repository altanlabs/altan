/**
 * SDK Test Page
 * Demonstrates @altan/agents-sdk usage
 */

import React from 'react';

import { VoiceAgentProvider } from '../../agents-sdk/src/providers/VoiceAgentProvider';
import { VoiceCallCard } from '../../agents-sdk/src/components/VoiceCallCard';
import { SimpleExample } from '../../agents-sdk/src/components/SimpleExample';

// Test with a public agent ID (replace with actual agent)
const TEST_AGENT_ID = 'f3a00594-aaf7-4cbd-a9a6-25c804895de9';

export default function SDKTestPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
          @altan/agents-sdk Demo
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Example 1: Pre-built Card */}
          <div>
            <h2 style={{ marginBottom: '20px' }}>Pre-built VoiceCallCard</h2>
            <VoiceAgentProvider 
              agentId={TEST_AGENT_ID}
              clientTools={{
                redirect: async ({ path }) => {
                  console.log('Redirecting to:', path);
                  return { success: true, path };
                },
              }}
              onConnect={() => console.log('Connected!')}
              onDisconnect={() => console.log('Disconnected!')}
              onToolCall={(tool, args) => console.log('Tool called:', tool, args)}
            >
              <VoiceCallCard 
                size={180}
                colors={['#00fbff', '#68dffd']}
                showAgentName={true}
              />
            </VoiceAgentProvider>
          </div>

          {/* Example 2: Custom UI */}
          <div>
            <h2 style={{ marginBottom: '20px' }}>Custom Implementation</h2>
            <VoiceAgentProvider agentId={TEST_AGENT_ID}>
              <SimpleExample />
            </VoiceAgentProvider>
          </div>
        </div>

        {/* Code Example */}
        <div style={{ marginTop: '60px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
          <h3>How simple is this?</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="${TEST_AGENT_ID}">
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}`}
          </pre>
          <p style={{ color: '#666', marginTop: '16px' }}>
            That's literally all the code needed for a fully functional voice agent!
          </p>
        </div>
      </div>
    </div>
  );
}
