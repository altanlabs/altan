# @altan/agents-sdk

🎙️ **The easiest way to add AI voice agents to your app**

Drop-in voice agents powered by ElevenLabs and OpenAI Realtime API. Works with public Altan agents - no API keys required.

## Features

- 🎙️ **Unified Interface** - One API for both ElevenLabs and OpenAI Realtime
- 🔄 **Auto-detection** - Automatically uses the right provider
- 🎨 **Beautiful UI Components** - Animated orb avatar and pre-built controls
- 🔧 **Client Tools** - Easy custom function integration
- 🌍 **No API Keys** - Works with public agent IDs
- ⚡ **ChatGPT Quality** - OpenAI WebRTC for ultra-smooth audio
- 🌐 **30+ Languages** - Full multilingual support

## Installation

```bash
npm install @altan/agents-sdk
# or
bun add @altan/agents-sdk
```

**Dependencies:**
- React 18+
- @elevenlabs/react
- three
- @react-three/fiber

All dependencies are automatically installed.

## Quick Start (3 lines of code!)

```jsx
import { VoiceAgentProvider, VoiceCallCard } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="your-public-agent-id">
      <VoiceCallCard />
    </VoiceAgentProvider>
  );
}
```

That's it! You now have a fully functional voice agent.

## Custom UI

```jsx
import { VoiceAgentProvider, useVoiceAgent, AgentOrb } from '@altan/agents-sdk';

function App() {
  return (
    <VoiceAgentProvider agentId="your-agent-id">
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
    <div>
      <h1>Talk to {agentName}</h1>
      <AgentOrb 
        size={200}
        agentState={isConnected ? 'speaking' : null}
      />
      <button onClick={isConnected ? stopConversation : startConversation}>
        {isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Start Call'}
      </button>
    </div>
  );
}
```

## Overrides (Customize Behavior)

Override agent settings at runtime:

```jsx
<VoiceAgentProvider 
  agentId="your-agent-id"
  overrides={{
    // Force a specific provider
    provider: 'openai', // or 'elevenlabs'
    
    // Override language (ElevenLabs)
    language: 'es', // Spanish
    
    // Override first message (ElevenLabs)
    firstMessage: '¡Hola! ¿Cómo puedo ayudarte?',
    
    // Override prompt (ElevenLabs)
    prompt: 'You are a helpful assistant...',
  }}
>
  <VoiceCallCard />
</VoiceAgentProvider>
```

**Common overrides:**
- `provider` - Force 'openai' or 'elevenlabs'
- `language` - Override language (ElevenLabs): 'en', 'es', 'fr', etc.
- `firstMessage` - Custom greeting (ElevenLabs)
- `prompt` - Override system prompt (ElevenLabs)

## Client Tools (Custom Functions)

Give your agent custom powers:

```jsx
<VoiceAgentProvider 
  agentId="your-agent-id"
  clientTools={{
    // Navigation
    redirect: async ({ path }) => {
      window.location.href = path;
      return { success: true };
    },
    
    // Open links
    openUrl: async ({ url }) => {
      window.open(url, '_blank');
      return { success: true };
    },
    
    // Form submission
    submitForm: async ({ email, message }) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ email, message }),
      });
      return await res.json();
    },
    
    // Any custom logic!
    checkout: async ({ items }) => {
      // Your e-commerce logic
      return { success: true, orderId: '123' };
    }
  }}
  onToolCall={(tool, args) => {
    console.log(`Agent called: ${tool}`, args);
  }}
>
  <YourApp />
</VoiceAgentProvider>
```

## API Reference

### `<VoiceAgentProvider>`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `agentId` | string | ✅ | Public agent ID from Altan |
| `overrides` | object | ❌ | Override agent settings (provider, language, etc.) |
| `clientTools` | object | ❌ | Client-side function implementations |
| `onConnect` | function | ❌ | Called when voice call connects |
| `onDisconnect` | function | ❌ | Called when voice call ends |
| `onError` | function | ❌ | Called on errors |
| `onToolCall` | function | ❌ | Called when agent executes a tool |

### `useVoiceAgent()`

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `agentId` | string | Agent ID |
| `agentName` | string | Agent name |
| `agentConfig` | object | Full agent configuration |
| `provider` | string | 'elevenlabs' or 'openai' |
| `isConnected` | boolean | Is voice call active |
| `isConnecting` | boolean | Is connecting |
| `isLoading` | boolean | Is loading agent config |
| `connectionStatus` | string | Current status |
| `error` | string\|null | Current error message |
| `startConversation()` | function | Start voice call |
| `stopConversation()` | function | End voice call |
| `client` | object | Raw client (advanced) |

### `<AgentOrb>`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | number | 180 | Orb size in pixels |
| `agentId` | string | 'default' | Agent ID for animation seed |
| `colors` | array | `['#00fbff', '#68dffd']` | Gradient colors |
| `agentState` | string | null | 'speaking', 'thinking', or null |
| `isStatic` | boolean | false | Disable animations |
| `onClick` | function | null | Click handler |

### `<VoiceCallButton>`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startLabel` | string | 'Start Call' | Button text when idle |
| `stopLabel` | string | 'End Call' | Button text when connected |
| `connectingLabel` | string | 'Connecting...' | Button text when connecting |
| `className` | string | '' | CSS class |
| `style` | object | {} | Inline styles |

### `<VoiceCallCard>`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | number | 200 | Orb size |
| `colors` | array | `['#00fbff', '#68dffd']` | Orb colors |
| `showAgentName` | boolean | true | Show agent name |
| `className` | string | '' | CSS class |
| `style` | object | {} | Inline styles |

## Examples

See [EXAMPLE.md](./EXAMPLE.md) for more examples.

## How It Works

1. **Auto-fetch** - SDK fetches public agent config from Altan API
2. **Auto-detect** - Detects ElevenLabs or OpenAI based on config
3. **Auto-connect** - Initializes the right client automatically
4. **Auto-tools** - Your client tools work with both providers

## Provider Comparison

| Feature | ElevenLabs | OpenAI Realtime |
|---------|-----------|-----------------|
| Audio Quality | Excellent | ChatGPT-level |
| Latency | Very Low | Ultra Low |
| Interruptions | Good | Perfect (WebRTC) |
| Languages | 31 | Auto-detect |
| Voice Options | 1000+ | 6 voices |
| Implementation | WebSocket | WebRTC |

**The SDK handles both seamlessly!**

## License

MIT

## Support

- 📖 Documentation: https://docs.altan.ai
- 💬 Discord: https://discord.gg/altan
- 🐛 Issues: https://github.com/altan-ai/agents-sdk/issues


