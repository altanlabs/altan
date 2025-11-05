# @altan/agents-sdk - Usage Examples

## Basic Usage

```jsx
import { VoiceAgentProvider, useVoiceAgent, AgentOrb } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="your-public-agent-id">
      <VoiceInterface />
    </VoiceAgentProvider>
  );
}

function VoiceInterface() {
  const { 
    agentName,
    isConnected, 
    isConnecting,
    startConversation, 
    stopConversation,
    provider 
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
      <p>Provider: {provider}</p>
    </div>
  );
}
```

## With Client Tools

```jsx
<VoiceAgentProvider 
  agentId="your-agent-id"
  clientTools={{
    // Custom redirect tool
    redirect: async ({ path }) => {
      window.location.href = path;
      return { success: true, path };
    },
    
    // Open URL in new tab
    openUrl: async ({ url }) => {
      window.open(url, '_blank');
      return { success: true, url };
    },
    
    // Custom business logic
    submitForm: async ({ formData }) => {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      return await response.json();
    }
  }}
  onToolCall={(toolName, args, result) => {
    console.log(`Tool executed: ${toolName}`, { args, result });
  }}
>
  <YourApp />
</VoiceAgentProvider>
```

## Using Pre-built Components

```jsx
import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="your-agent-id">
      <VoiceCallCard 
        size={180}
        colors={['#00fbff', '#68dffd']}
        showAgentName={true}
      />
    </VoiceAgentProvider>
  );
}
```

## Monitoring Connection Events

```jsx
<VoiceAgentProvider 
  agentId="your-agent-id"
  onConnect={() => {
    console.log('Voice call started!');
    // Track analytics, update UI, etc.
  }}
  onDisconnect={() => {
    console.log('Voice call ended');
    // Cleanup, show feedback form, etc.
  }}
  onError={(error) => {
    console.error('Voice error:', error);
    // Show error to user
  }}
>
  <YourApp />
</VoiceAgentProvider>
```

## Advanced: Direct Client Access

```jsx
function AdvancedInterface() {
  const { client, provider } = useVoiceAgent();
  
  // Send custom events (OpenAI only)
  const sendCustomEvent = () => {
    if (provider === 'openai' && client) {
      client.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: 'Hello!' }]
        }
      });
    }
  };
  
  return <button onClick={sendCustomEvent}>Send Custom Event</button>;
}
```

## Overrides - Dynamic Configuration

Override agent settings at runtime:

```jsx
import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function SpanishAgent() {
  return (
    <VoiceAgentProvider 
      agentId="your-agent-id"
      overrides={{
        // Override language to Spanish
        language: 'es',
        
        // Custom first message
        firstMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
      }}
    >
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}
```

### Force Provider

```jsx
<VoiceAgentProvider 
  agentId="your-agent-id"
  overrides={{
    // Force OpenAI even if agent is configured for ElevenLabs
    provider: 'openai',
  }}
>
  <YourApp />
</VoiceAgentProvider>
```

### User-Selected Language

```jsx
function MultiLanguageAgent() {
  const [userLanguage, setUserLanguage] = useState('en');
  
  return (
    <div>
      <select onChange={(e) => setUserLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
      
      <VoiceAgentProvider 
        agentId="your-agent-id"
        overrides={{ language: userLanguage }}
      >
        <VoiceCallCard />
      </VoiceAgentProvider>
    </div>
  );
}
```

## Multi-language Support

The SDK automatically uses the language configured in the agent:
- For ElevenLabs: Uses `agent.voice.meta_data.language`
- For OpenAI: Configured in backend session

Both providers support 30+ languages!

You can override the language using the `overrides` prop (see above).

## Auto-Provider Detection

The SDK automatically detects which provider to use:
- If `agent.voice.provider === 'openai'` → Uses OpenAI Realtime (WebRTC)
- If `agent.voice.openai` is set → Uses OpenAI
- Otherwise → Uses ElevenLabs

**Same code works for both!** Just change the agent configuration.

