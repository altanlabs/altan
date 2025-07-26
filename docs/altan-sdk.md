# Altan SDK Documentation

## Overview

The Altan AI SDK provides a **modular, account-centric** approach to integrating chat functionality with your applications. The SDK is designed to work seamlessly with the Altan backend and supports multiple use cases including agent chat, peer-to-peer chat, and multi-room scenarios.

## Key Features

### ✅ Account-Centric Design
- Initialize SDK with your `accountId` (tenant ID)
- All operations are automatically scoped to your account
- Secure isolation between different accounts

### ✅ Modular Operations
- Separate methods for guest management, room creation, and authentication
- Compose operations as needed for your specific use case
- Clean separation of concerns

### ✅ Flexible Use Cases
- **Agent Chat**: Visitors chat with AI agents
- **Peer-to-Peer Chat**: Users chat with each other
- **Returning Users**: Automatic recognition of existing guests
- **Multi-Room**: Same guest can join multiple rooms

### ✅ Built-in Storage
- Automatic localStorage management
- Account-scoped token storage
- Persistent guest data across sessions

## Installation

```bash
npm install @altan/sdk
# or
yarn add @altan/sdk
```

## Quick Start

### 1. Initialize SDK

```typescript
import { createAltanSDK } from '@altan/sdk';

const sdk = createAltanSDK({
  accountId: 'your-account-id', // Required: Your tenant ID
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https://altan.ai/r',
  enableStorage: true,
  debug: true, // Enable for development
});
```

### 2. Create Guest and Agent Chat

```typescript
// One-shot convenience method
const { guest, room, tokens } = await sdk.createSession('agent-id', {
  external_id: 'user-123', // Optional: for returning users
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});

console.log('Room URL:', room.url);
console.log('Guest authenticated:', !!tokens.accessToken);
```

### 3. Modular Approach

```typescript
// Step-by-step for more control
const guest = await sdk.createGuest({
  external_id: 'user-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});

const room = await sdk.createRoom(guest.id, 'agent-id');
const tokens = await sdk.authenticateGuest(guest.id);
```

## Use Cases

### 1. New Visitor → Agent Chat

```typescript
const { guest, room, tokens } = await sdk.createSession('agent-id', {
  first_name: 'Anonymous',
  last_name: 'Visitor'
});

// Render room with authentication
renderRoom(room.url, tokens.accessToken);
```

### 2. Returning User → Agent Chat

```typescript
try {
  // Try to find existing guest
  const guest = await sdk.getGuestByExternalId('user-123');
  const room = await sdk.createRoom(guest.id, 'agent-id');
  const tokens = await sdk.authenticateGuest(guest.id);
  
  renderRoom(room.url, tokens.accessToken);
} catch {
  // Guest doesn't exist, create new one
  const { guest, room, tokens } = await sdk.createSession('agent-id', {
    external_id: 'user-123',
    first_name: 'John',
    last_name: 'Doe'
  });
  
  renderRoom(room.url, tokens.accessToken);
}
```

### 3. Guest → Join Existing Room (P2P Chat)

```typescript
const guest = await sdk.createGuest({
  external_id: 'user-456',
  first_name: 'Jane',
  last_name: 'Smith'
});

await sdk.joinRoom('existing-room-id', guest.id);
const tokens = await sdk.authenticateGuest(guest.id);

renderRoom(sdk.getRoomUrl('existing-room-id'), tokens.accessToken);
```

### 4. Cached User (Widget with localStorage)

```typescript
// Check for stored data
const storedGuest = sdk.getStoredGuest();
const storedTokens = sdk.getStoredTokens();

if (storedGuest && storedTokens) {
  // Try to refresh tokens
  try {
    const freshTokens = await sdk.refreshTokens();
    renderRoom(lastRoomUrl, freshTokens.accessToken);
  } catch {
    // Tokens expired, re-authenticate
    const newTokens = await sdk.authenticateGuest(storedGuest.id);
    renderRoom(lastRoomUrl, newTokens.accessToken);
  }
} else {
  // First time user
  await createNewSession();
}
```

## React Integration

### Basic Hook Usage

```typescript
import { useAltan } from '@altan/sdk';

function ChatComponent() {
  const altan = useAltan({
    accountId: 'your-account-id',
    debug: true
  });

  const handleStartChat = async () => {
    try {
      const { guest, room, tokens } = await altan.createSession('agent-id');
      console.log('Chat ready:', room.url);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStartChat}>
        Start Chat
      </button>
      
      {altan.guest.isLoading && <p>Creating guest...</p>}
      {altan.room.isCreating && <p>Creating room...</p>}
      {altan.auth.isLoading && <p>Authenticating...</p>}
    </div>
  );
}
```

### Modular Hooks

```typescript
import { useAltanSDK, useAltanGuest, useAltanAuth, useAltanRoom } from '@altan/sdk';

function ModularChatComponent() {
  const sdk = useAltanSDK({ accountId: 'your-account-id' });
  const guest = useAltanGuest(sdk);
  const auth = useAltanAuth(sdk);
  const room = useAltanRoom(sdk);

  const handleCreateGuest = async () => {
    const newGuest = await guest.createGuest({
      first_name: 'John',
      last_name: 'Doe'
    });
    console.log('Guest created:', newGuest);
  };

  return (
    <div>
      <button onClick={handleCreateGuest} disabled={guest.isLoading}>
        {guest.isLoading ? 'Creating...' : 'Create Guest'}
      </button>
      
      {guest.currentGuest && (
        <p>Current guest: {guest.currentGuest.first_name}</p>
      )}
      
      {auth.isAuthenticated && (
        <p>Authenticated with tokens</p>
      )}
    </div>
  );
}
```

### Event Listening

```typescript
import { useAltanEvent } from '@altan/sdk';

function EventListenerComponent({ sdk }) {
  useAltanEvent(sdk, 'guest:created', ({ guest }) => {
    console.log('Guest created:', guest);
  });

  useAltanEvent(sdk, 'room:created', ({ room }) => {
    console.log('Room created:', room);
  });

  useAltanEvent(sdk, 'auth:success', ({ guest, tokens }) => {
    console.log('Authentication successful:', guest);
  });

  return <div>Listening to SDK events...</div>;
}
```

## React Components

### Room Component

```typescript
import { Room } from '@altan/sdk';

function MyApp() {
  return (
    <Room
      accountId="your-account-id"
      agentId="agent-id"
      guestInfo={{
        external_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe'
      }}
      onRoomCreated={(room) => console.log('Room created:', room)}
      onAuthSuccess={(guest, tokens) => console.log('Auth success:', guest)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### Chat Widget

```typescript
import { ChatWidget } from '@altan/sdk';

function MyApp() {
  return (
    <ChatWidget
      accountId="your-account-id"
      agentId="agent-id"
      position="bottom-right"
      buttonColor="#007bff"
      guestInfo={{
        first_name: 'Visitor'
      }}
    />
  );
}
```

## API Reference

### Configuration

```typescript
interface AltanSDKConfig {
  accountId: string;           // Required: Your account/tenant ID
  apiBaseUrl?: string;         // Guest API endpoint
  authBaseUrl?: string;        // Authentication endpoint
  roomBaseUrl?: string;        // Room rendering endpoint
  enableStorage?: boolean;     // Enable localStorage (default: true)
  debug?: boolean;             // Enable debug logging (default: false)
  requestTimeout?: number;     // Request timeout in ms (default: 30000)
}
```

### SDK Methods

#### Guest Management
```typescript
// Create guest
createGuest(guestInfo: CreateGuestRequest): Promise<GuestData>

// Update guest
updateGuest(guestId: string, updates: Partial<CreateGuestRequest>): Promise<GuestData>

// Get guest by external ID
getGuestByExternalId(externalId: string): Promise<GuestData>
```

#### Room Management
```typescript
// Create room between guest and agent
createRoom(guestId: string, agentId: string): Promise<RoomData>

// Join existing room
joinRoom(roomId: string, guestId: string): Promise<void>

// Get room URL
getRoomUrl(roomId: string): string
```

#### Authentication
```typescript
// Authenticate guest
authenticateGuest(guestId: string): Promise<AuthTokens>

// Refresh tokens
refreshTokens(): Promise<AuthTokens>

// Clear authentication
clearAuth(): void
```

#### Storage
```typescript
// Get stored guest
getStoredGuest(): GuestData | null

// Get stored tokens
getStoredTokens(): { accessToken: string; refreshToken: string } | null
```

#### Convenience Methods
```typescript
// One-shot session creation
createSession(agentId: string, guestInfo?: CreateGuestRequest): Promise<{
  guest: GuestData;
  room: RoomData; 
  tokens: AuthTokens;
}>
```

### Data Types

```typescript
interface GuestData {
  id: string;
  external_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  account_id: string;
}

interface CreateGuestRequest {
  external_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface RoomData {
  room_id: string;
  agent?: any;
  guest: GuestData;
  account_id: string;
  url?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}
```

### Events

```typescript
sdk.on('guest:created', ({ guest }) => {});
sdk.on('guest:updated', ({ guest }) => {});
sdk.on('room:created', ({ room }) => {});
sdk.on('room:joined', ({ roomId, guestId }) => {});
sdk.on('auth:success', ({ guest, tokens }) => {});
sdk.on('auth:refresh', ({ tokens }) => {});
sdk.on('auth:error', ({ error }) => {});
sdk.on('error', ({ error }) => {});
```

## Best Practices

### 1. Always Provide Account ID

```typescript
// ✅ Required - SDK is account-centric
const sdk = createAltanSDK({
  accountId: 'your-account-id'
});

// ❌ This will cause an error
const sdk = createAltanSDK({
  // Missing accountId
});
```

### 2. Error Handling

```typescript
try {
  const { guest, room, tokens } = await sdk.createSession(agentId, guestInfo);
  // Success
} catch (error) {
  if (error.message.includes('404')) {
    // Agent or account not found
  } else if (error.message.includes('401')) {
    // Authentication failed
  } else {
    // Other error
  }
}
```

### 3. Storage Management

```typescript
// Always check for existing data
const existingGuest = sdk.getStoredGuest();
const existingTokens = sdk.getStoredTokens();

if (existingGuest && existingTokens) {
  // Use existing session
} else {
  // Create new session
}
```

### 4. Account Scoping

```typescript
// All operations are automatically scoped to your accountId
const sdk = createAltanSDK({ accountId: 'your-account-id' });

// All guests, rooms, and tokens are isolated to your account
// No risk of accessing other accounts' data
```

## Troubleshooting

### Common Issues

**1. "accountId is required"**
- Ensure you provide `accountId` when initializing the SDK
- The `accountId` is your tenant ID, not an agent ID

**2. "Guest not found in account"**
- Ensure the guest was created with the correct `accountId`
- Check that you're using the same `accountId` in SDK config

**3. "Agent not found or not public"** 
- Verify the agent exists and belongs to your account
- Ensure the agent's `is_public` flag is set to `true`

**4. "Authentication failed"**
- Check that the guest exists before authenticating
- Ensure your auth endpoints are configured correctly

**5. "Room creation failed"**
- Verify both guest and agent belong to the same account
- Check that the agent is public

### Debug Mode

```typescript
const sdk = createAltanSDK({
  accountId: 'your-account-id',
  debug: true, // Enables detailed logging
});
```

Debug mode will log:
- All API requests and responses
- Authentication flows
- Storage operations
- Event emissions

### Performance Tips

1. **Use storage**: Enable storage to avoid re-authenticating returning users
2. **Cache guests**: Store guest data locally for faster subsequent operations
3. **Batch operations**: Use `createSession()` for new users instead of separate calls
4. **Handle errors gracefully**: Implement proper error boundaries in React components

## Support

For issues or questions:
- GitHub Issues: [altan-ui/issues](https://github.com/altan/altan-ui/issues)
- Documentation: [docs.altan.ai](https://docs.altan.ai)
- Support: support@altan.ai 