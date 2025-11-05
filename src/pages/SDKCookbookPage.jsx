/**
 * SDK Cookbook Page
 * Interactive documentation and testing ground for @altan/agents-sdk
 */

import React, { useState, useEffect } from 'react';

import { AgentOrb } from '../../agents-sdk/src/components/AgentOrb';
import { Conversation } from '../../agents-sdk/src/components/Conversation';
import { ConversationWithMessages } from '../../agents-sdk/src/components/ConversationWithMessages';
import { ConversationBar } from '../../agents-sdk/src/components/ConversationBar';
import { VoiceCallButton } from '../../agents-sdk/src/components/VoiceCallButton';
import { VoiceCallCard } from '../../agents-sdk/src/components/VoiceCallCard';
import { useVoiceAgent } from '../../agents-sdk/src/hooks/useVoiceAgent';
import { VoiceAgentProvider } from '../../agents-sdk/src/providers/VoiceAgentProvider';

// Test agent ID (OpenAI Realtime enabled)
const AGENT_ID = 'b199b05b-f3e2-4cc9-91d4-95a9581379f1';

// Example implementations
const examples = [
  {
    id: 'basic-card',
    title: '1. Basic VoiceCallCard',
    description: 'Pre-built component with everything included',
    code: `import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="${AGENT_ID}">
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}`,
  },
  {
    id: 'custom-hook',
    title: '2. Custom UI with Hook',
    description: 'Build your own interface using the hook',
    code: `import { VoiceAgentProvider, useVoiceAgent, AgentOrb } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="${AGENT_ID}">
      <CustomInterface />
    </VoiceAgentProvider>
  );
}

function CustomInterface() {
  const { 
    agentName,
    isConnected, 
    isConnecting,
    startConversation, 
    stopConversation 
  } = useVoiceAgent();
  
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>{agentName}</h1>
      <AgentOrb 
        size={200}
        colors={['#00fbff', '#68dffd']}
        agentState={isConnected ? 'speaking' : null}
      />
      <button onClick={isConnected ? stopConversation : startConversation}>
        {isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Start Call'}
      </button>
    </div>
  );
}`,
  },
  {
    id: 'with-tools',
    title: '3. With Client Tools',
    description: 'Add custom functions your agent can call',
    code: `import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider 
      agentId="${AGENT_ID}"
      clientTools={{
        redirect: async ({ path }) => {
          console.log('Redirecting to:', path);
          window.location.href = path;
          return { success: true, path };
        },
        showAlert: async ({ message }) => {
          alert(message);
          return { success: true };
        }
      }}
      onToolCall={(tool, args) => {
        console.log(\`Tool executed: \${tool}\`, args);
      }}
    >
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}`,
  },
  {
    id: 'just-orb',
    title: '4. Just the Orb',
    description: 'Use only the animated orb component',
    code: `import { VoiceAgentProvider, AgentOrb, useVoiceAgent } from '@altan/agents-sdk';

function OrbOnly() {
  const { isConnected } = useVoiceAgent();
  
  return (
    <AgentOrb 
      size={300}
      colors={['#ff00ff', '#00ffff']}
      agentState={isConnected ? 'speaking' : null}
    />
  );
}

function App() {
  return (
    <VoiceAgentProvider agentId="${AGENT_ID}">
      <OrbOnly />
    </VoiceAgentProvider>
  );
}`,
  },
  {
    id: 'with-overrides',
    title: '5. With Overrides',
    description: 'Override provider, language, or other settings',
    code: `import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider 
      agentId="${AGENT_ID}"
      overrides={{
        // Force OpenAI provider (even if agent is ElevenLabs)
        provider: 'openai',
        
        // Override language to Spanish
        language: 'es',
        
        // Custom first message
        firstMessage: '¡Hola! ¿Cómo puedo ayudarte?',
      }}
    >
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}`,
  },
  {
    id: 'conversation-bar',
    title: '6. Conversation Bar',
    description: 'Compact bottom bar with audio controls and waveform',
    code: `import { VoiceAgentProvider, ConversationBar } from '@altan/agents-sdk';

function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '20px' }}>
      <VoiceAgentProvider agentId="${AGENT_ID}">
        <ConversationBar />
      </VoiceAgentProvider>
    </div>
  );
}`,
  },
  {
    id: 'conversation',
    title: '7. Full Conversation UI',
    description: 'Complete interface with transcript and text input',
    code: `import { VoiceAgentProvider, Conversation } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="${AGENT_ID}">
      <Conversation 
        showTranscript={true}
        maxHeight="600px"
      />
    </VoiceAgentProvider>
  );
}`,
  },
  {
    id: 'minimal',
    title: '8. Minimal Example',
    description: 'Absolute minimum code',
    code: `import { VoiceAgentProvider, VoiceCallButton } from '@altan/agents-sdk';

<VoiceAgentProvider agentId="${AGENT_ID}">
  <VoiceCallButton />
</VoiceAgentProvider>`,
  },
];

// Live example components
const BasicCardExample = () => <VoiceCallCard />;

const CustomHookExample = () => {
  const { agentName, isConnected, isConnecting, startConversation, stopConversation } =
    useVoiceAgent();

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>{agentName}</h2>
      <AgentOrb
        size={200}
        colors={['#00fbff', '#68dffd']}
        agentState={isConnected ? 'speaking' : null}
        isStatic={false}
      />
      <button
        onClick={isConnected ? stopConversation : startConversation}
        style={{
          marginTop: '24px',
          padding: '12px 32px',
          fontSize: '16px',
          borderRadius: '24px',
          border: 'none',
          backgroundColor: isConnected ? '#ef4444' : '#000',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Start Call'}
      </button>
    </div>
  );
};

const WithToolsExample = () => <VoiceCallCard />;

const JustOrbExample = () => {
  const { isConnected } = useVoiceAgent();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <AgentOrb
        size={300}
        colors={['#ff00ff', '#00ffff']}
        agentState={isConnected ? 'speaking' : null}
        isStatic={false}
      />
    </div>
  );
};

const WithOverridesExample = () => <VoiceCallCard />;

const ConversationBarExample = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <ConversationBar />
    </div>
  </div>
);

const ConversationExample = () => (
  <div style={{ width: '100%', maxWidth: '600px' }}>
    <ConversationWithMessages 
      agentId={AGENT_ID}
      maxHeight="500px"
    />
  </div>
);

const MinimalExample = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <VoiceCallButton />
  </div>
);

// Map example IDs to components
const exampleComponents = {
  'basic-card': BasicCardExample,
  'custom-hook': CustomHookExample,
  'with-tools': WithToolsExample,
  'just-orb': JustOrbExample,
  'with-overrides': WithOverridesExample,
  'conversation-bar': ConversationBarExample,
  'conversation': ConversationExample,
  'minimal': MinimalExample,
};

// Info Panel Component (reads actual provider)
const InfoPanel = () => {
  const { provider, isLoading } = useVoiceAgent();

  const getProviderDisplay = () => {
    if (isLoading) return 'Loading...';
    if (provider === 'openai') return 'OpenAI Realtime (WebRTC)';
    if (provider === 'elevenlabs') return 'ElevenLabs';
    return 'Unknown';
  };

  return (
    <div style={{ fontSize: '14px', color: '#6b7280' }}>
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ color: '#000' }}>Agent ID:</strong>{' '}
        <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
          {AGENT_ID}
        </code>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ color: '#000' }}>Provider:</strong> {getProviderDisplay()}
      </div>
      <div>
        <strong style={{ color: '#000' }}>Try this:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>Click &quot;Start Call&quot; to begin voice conversation</li>
          <li>Speak naturally - the agent will respond</li>
          <li>Try interrupting while it&apos;s speaking</li>
          <li>Click &quot;End Call&quot; when done</li>
        </ul>
      </div>
    </div>
  );
};

// Get client tools for examples that need them
const getClientTools = (exampleId) => {
  if (exampleId !== 'with-tools') return {};

  return {
    redirect: async ({ path }) => {
      console.log('🔗 Redirect tool called:', path);
      alert(`Agent wants to redirect to: ${path}\n\n(Would navigate in production)`);
      return { success: true, path };
    },
    showAlert: async ({ message }) => {
      console.log('🔔 Alert tool called:', message);
      alert(`Agent says: ${message}`);
      return { success: true };
    },
  };
};

// Get overrides for examples that need them
const getOverrides = (exampleId) => {
  if (exampleId !== 'with-overrides') return {};

  return {
    provider: 'openai', // Force OpenAI
    language: 'es', // Spanish
    firstMessage: '¡Hola! ¿Cómo puedo ayudarte?',
  };
};

export default function SDKCookbookPage() {
  // Get example from URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedExample, setSelectedExample] = useState(urlParams.get('example') || 'basic-card');

  // Update URL when example changes
  useEffect(() => {
    const newUrl = `${window.location.pathname}?example=${selectedExample}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedExample]);

  const currentExample = examples.find((ex) => ex.id === selectedExample);
  const CurrentComponent = exampleComponents[selectedExample];
  const clientTools = getClientTools(selectedExample);
  const overridesToApply = getOverrides(selectedExample);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Left Panel - Code */}
      <div
        style={{
          width: '50%',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>@altan/agents-sdk</h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280' }}>Interactive Cookbook & Testing</p>
        </div>

        {/* Example Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            overflowX: 'auto',
            backgroundColor: '#f9fafb',
          }}
        >
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setSelectedExample(example.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: selectedExample === example.id ? '#000' : '#fff',
                color: selectedExample === example.id ? '#fff' : '#000',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {example.title}
            </button>
          ))}
        </div>

        {/* Code Display */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
              {currentExample?.title}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {currentExample?.description}
            </p>
          </div>

          <pre
            style={{
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              padding: '20px',
              borderRadius: '12px',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'Monaco, Menlo, monospace',
            }}
          >
            {currentExample?.code}
          </pre>

          {/* Installation Instructions */}
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }}>
              Installation
            </h4>
            <pre
              style={{
                backgroundColor: '#f3f4f6',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'Monaco, Menlo, monospace',
              }}
            >
              npm install @altan/agents-sdk
            </pre>
          </div>

          {/* Key Features */}
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }}>
              Key Features
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563' }}>
              <li>Works with both ElevenLabs and OpenAI Realtime</li>
              <li>Auto-detects provider from agent config</li>
              <li>ChatGPT-quality audio with WebRTC</li>
              <li>Beautiful 3D animated orb included</li>
              <li>Client tools support</li>
              <li>No API keys required (uses public agents)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Demo */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Live Demo</h2>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Interact with the component on the right
          </p>
        </div>

        <VoiceAgentProvider
          agentId={AGENT_ID}
          clientTools={clientTools}
          overrides={overridesToApply}
          onConnect={() => console.log('✅ Connected!')}
          onDisconnect={() => console.log('🛑 Disconnected')}
          onError={(error) => console.error('❌ Error:', error)}
          onToolCall={(tool, args) => console.log('🔧 Tool called:', tool, args)}
          onMessage={(event) => console.log('📨 Event:', event.type)}
        >
          {/* Live Component */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            {CurrentComponent && <CurrentComponent />}
          </div>

          {/* Info Panel */}
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fff',
            }}
          >
            <InfoPanel />
          </div>
        </VoiceAgentProvider>
      </div>
    </div>
  );
}
