# Altan AI SDK

The official JavaScript/TypeScript SDK for integrating with Altan AI's conversational platform. Build powerful AI-driven chat experiences with minimal setup.

## Features

- 🚀 **Easy Integration** - Get started with just a few lines of code
- 🔐 **Guest Management** - Create and manage guest users seamlessly
- 💬 **Room Creation** - Dynamic chat room creation and management
- 🔑 **Authentication** - Secure token-based authentication with auto-refresh
- ⚛️ **React Support** - Pre-built React hooks and components
- 📱 **Widget Components** - Drop-in chat widgets for instant integration
- 🎯 **Event System** - Real-time event listeners for all SDK operations
- 💾 **Auto Storage** - Automatic local storage management for sessions
- 🎨 **Customizable** - Flexible configuration and styling options

## Installation

```bash
npm install @altanlabs/sdk
# or
yarn add @altanlabs/sdk
```

## Quick Start

### Basic Usage (Vanilla JavaScript)

```javascript
import { createAltanSDK } from '@altanlabs/sdk';

// Initialize the SDK
const sdk = createAltanSDK({
  accountId: 'your-account-id',
  debug: true // Optional: enable debug logging
});

// Create a guest and start a conversation
async function startChat() {
  try {
    // Create a guest user
    const guest = await sdk.createGuest({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    });

    // Create a room with an agent
    const room = await sdk.createRoom('agent-id', guest.id);
    
    // Authenticate the guest
    const tokens = await sdk.authenticateGuest(guest.id);
    
    // Get the room URL to redirect user
    const roomUrl = sdk.getRoomUrl(room.room_id, tokens.accessToken);
    console.log('Chat room ready:', roomUrl);
    
  } catch (error) {
    console.error('Failed to start chat:', error);
  }
}

startChat();
```

### React Integration

```jsx
import { AltanProvider, ChatWidget, useAltan } from '@altanlabs/sdk';

// App-level provider
function App() {
  return (
    <AltanProvider config={{ accountId: 'your-account-id' }}>
      <MyComponent />
    </AltanProvider>
  );
}

// Drop-in chat widget
function MyComponent() {
  return (
    <div>
      <h1>My Website</h1>
      <ChatWidget
        accountId="your-account-id"
        agentId="your-agent-id"
        guestInfo={{
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com'
        }}
        position="bottom-right"
        onRoomCreated={(room) => console.log('Room created:', room)}
      />
    </div>
  );
}

// Custom integration with hooks
function CustomChat() {
  const { createSession, guest, room } = useAltan({
    accountId: 'your-account-id'
  });

  const handleStartChat = async () => {
    try {
      const session = await createSession('agent-id', {
        first_name: 'Custom',
        last_name: 'User'
      });
      
      // Redirect to room or embed iframe
      window.open(session.roomUrl, '_blank');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <button onClick={handleStartChat}>
      Start AI Chat
    </button>
  );
}
```

## Configuration

### SDK Configuration Options

```typescript
interface AltanSDKConfig {
  accountId: string;           // Required: Your Altan account ID
  apiBaseUrl?: string;         // API endpoint (default: https://api.altan.ai/platform/guest)
  authBaseUrl?: string;        // Auth endpoint (default: https://api.altan.ai/auth/login/guest)
  roomBaseUrl?: string;        // Room URL base (default: https://altan.ai/r)
  enableStorage?: boolean;     // Enable local storage (default: true)
  debug?: boolean;             // Enable debug logging (default: false)
  requestTimeout?: number;     // Request timeout in ms (default: 30000)
}
```

## API Reference

### Core SDK Methods

#### Guest Management

```typescript
// Create a new guest
const guest = await sdk.createGuest({
  external_id?: string;     // Your internal user ID
  first_name?: string;      // Guest's first name
  last_name?: string;       // Guest's last name
  email?: string;           // Guest's email
  phone?: string;           // Guest's phone number
});

// Update guest information
const updatedGuest = await sdk.updateGuest(guestId, {
  first_name: 'Updated Name'
});

// Get guest by external ID
const guest = await sdk.getGuestByExternalId('your-user-id');
```

#### Room Management

```typescript
// Create a new room with an agent
const room = await sdk.createRoom('agent-id', 'guest-id');

// Join an existing room
await sdk.joinRoom('room-id', 'guest-id');

// Get room URL
const url = sdk.getRoomUrl('room-id', 'access-token');
```

#### Authentication

```typescript
// Authenticate a guest and get tokens
const tokens = await sdk.authenticateGuest('guest-id');

// Refresh expired tokens
const newTokens = await sdk.refreshTokens();

// Get stored tokens
const tokens = sdk.getStoredTokens();

// Check if user is authenticated
const isAuth = sdk.isAuthenticated();
```

#### Event System

```typescript
// Listen for events
sdk.on('guest:created', ({ guest }) => {
  console.log('Guest created:', guest);
});

sdk.on('room:created', ({ room }) => {
  console.log('Room created:', room);
});

sdk.on('auth:success', ({ guest, tokens }) => {
  console.log('Authentication successful');
});

sdk.on('error', ({ error }) => {
  console.error('SDK error:', error);
});

// Remove event listeners
sdk.off('guest:created', listener);
```

### React Hooks

#### useAltan - Main Hook

```typescript
const {
  sdk,                    // Core SDK instance
  guest,                  // Guest management methods
  auth,                   // Authentication methods
  room,                   // Room management methods
  createSession,          // Convenience method to create full session
  initializeExistingGuest,// Initialize with existing guest
  joinExistingRoom        // Join existing room
} = useAltan(config);
```

#### useAltanGuest - Guest Management

```typescript
const {
  currentGuest,           // Current guest data
  isLoading,              // Loading state
  error,                  // Error state
  createGuest,            // Create guest function
  updateGuest,            // Update guest function
  getGuestByExternalId    // Get guest by external ID
} = useAltanGuest(sdk);
```

#### useAltanAuth - Authentication

```typescript
const {
  tokens,                 // Current auth tokens
  isAuthenticated,        // Authentication status
  isLoading,              // Loading state
  error,                  // Error state
  authenticate,           // Authenticate function
  refreshTokens,          // Refresh tokens function
  logout                  // Logout function
} = useAltanAuth(sdk);
```

#### useAltanRoom - Room Management

```typescript
const {
  currentRoom,            // Current room data
  isLoading,              // Loading state
  error,                  // Error state
  createRoom,             // Create room function
  joinRoom                // Join room function
} = useAltanRoom(sdk);
```

### React Components

#### AltanProvider

```jsx
<AltanProvider config={{ accountId: 'your-account-id' }}>
  {/* Your app components */}
</AltanProvider>
```

#### ChatWidget

```jsx
<ChatWidget
  accountId="your-account-id"
  agentId="your-agent-id"
  config={{
    debug: true,
    enableStorage: true
  }}
  guestInfo={{
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com'
  }}
  position="bottom-right"        // Chat widget position
  buttonColor="#007bff"          // Custom button color
  buttonIcon={<CustomIcon />}    // Custom button icon
  customButton={CustomButton}    // Complete custom button component
  className="custom-widget"      // Custom CSS class
  style={{ zIndex: 1000 }}      // Custom styles
  onRoomCreated={(room) => {}}   // Room created callback
  onAuthSuccess={(guest, tokens) => {}} // Auth success callback
  onError={(error) => {}}        // Error callback
/>
```

#### Room Component

```jsx
<Room
  roomId="room-id"
  config={{ accountId: 'your-account-id' }}
  width="100%"
  height="600px"
  onLoad={() => console.log('Room loaded')}
  onError={(error) => console.error('Room error:', error)}
/>
```

## Advanced Usage

### Custom Event Handling

```javascript
// Set up comprehensive event handling
const sdk = createAltanSDK({ accountId: 'your-account-id' });

// Guest events
sdk.on('guest:created', ({ guest }) => {
  analytics.track('Guest Created', { guestId: guest.id });
});

sdk.on('guest:updated', ({ guest }) => {
  // Update local user profile
  updateUserProfile(guest);
});

// Room events
sdk.on('room:created', ({ room }) => {
  // Track room creation
  analytics.track('Chat Started', { roomId: room.room_id });
});

sdk.on('room:joined', ({ roomId, guestId }) => {
  console.log(`Guest ${guestId} joined room ${roomId}`);
});

// Auth events
sdk.on('auth:success', ({ guest, tokens }) => {
  // Store tokens in your auth system
  setAuthTokens(tokens);
});

sdk.on('auth:refresh', ({ tokens }) => {
  // Update stored tokens
  updateAuthTokens(tokens);
});

// Error handling
sdk.on('error', ({ error }) => {
  // Global error handling
  errorReporting.captureException(error);
});
```

### Session Management

```javascript
// Create a complete session (guest + room + auth)
async function createFullSession(agentId, userInfo) {
  const { createSession } = useAltan({ accountId: 'your-account-id' });
  
  try {
    const session = await createSession(agentId, {
      external_id: userInfo.id,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      email: userInfo.email
    });
    
    return {
      guest: session.guest,
      room: session.room,
      tokens: session.tokens,
      roomUrl: session.roomUrl
    };
  } catch (error) {
    console.error('Session creation failed:', error);
    throw error;
  }
}
```

### Integration with Existing Users

```javascript
// Initialize SDK with existing user
async function initializeWithExistingUser(externalUserId) {
  const { initializeExistingGuest } = useAltan({ 
    accountId: 'your-account-id' 
  });
  
  try {
    const { guest, tokens } = await initializeExistingGuest(externalUserId);
    console.log('Initialized for existing user:', guest);
    return { guest, tokens };
  } catch (error) {
    console.error('Failed to initialize existing user:', error);
    throw error;
  }
}

// Join existing room
async function joinExistingRoom(roomId, userInfo) {
  const { joinExistingRoom } = useAltan({ 
    accountId: 'your-account-id' 
  });
  
  try {
    const session = await joinExistingRoom(roomId, {
      external_id: userInfo.id,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName
    });
    
    return session;
  } catch (error) {
    console.error('Failed to join room:', error);
    throw error;
  }
}
```

## Error Handling

```javascript
import { AltanSDK } from '@altanlabs/sdk';

const sdk = new AltanSDK({ accountId: 'your-account-id' });

// Global error handler
sdk.on('error', ({ error }) => {
  switch (error.message) {
    case 'Network error':
      // Handle network issues
      showNetworkError();
      break;
    case 'Authentication failed':
      // Handle auth issues
      redirectToLogin();
      break;
    default:
      // Handle other errors
      showGenericError(error.message);
  }
});

// Method-specific error handling
try {
  const guest = await sdk.createGuest(guestInfo);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate guest
    const existingGuest = await sdk.getGuestByExternalId(guestInfo.external_id);
    return existingGuest;
  }
  throw error;
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { 
  AltanSDK, 
  AltanSDKConfig, 
  GuestData, 
  RoomData, 
  AuthTokens,
  CreateGuestRequest,
  AltanEventMap 
} from '@altanlabs/sdk';

// Fully typed SDK usage
const config: AltanSDKConfig = {
  accountId: 'your-account-id',
  debug: true
};

const sdk = new AltanSDK(config);

// Type-safe event handling
sdk.on('guest:created', (event: AltanEventMap['guest:created']) => {
  const guest: GuestData = event.guest;
  console.log('Guest created:', guest.id);
});
```

## Best Practices

### 1. Error Handling
Always implement proper error handling for SDK operations:

```javascript
try {
  const result = await sdk.createGuest(guestInfo);
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('Operation failed:', error);
}
```

### 2. Event Management
Clean up event listeners to prevent memory leaks:

```javascript
useEffect(() => {
  const handleGuestCreated = ({ guest }) => {
    console.log('Guest created:', guest);
  };
  
  sdk.on('guest:created', handleGuestCreated);
  
  return () => {
    sdk.off('guest:created', handleGuestCreated);
  };
}, [sdk]);
```

### 3. Token Management
Let the SDK handle token storage and refresh automatically:

```javascript
// The SDK automatically stores and refreshes tokens
const tokens = await sdk.authenticateGuest(guestId);

// Check authentication status
if (sdk.isAuthenticated()) {
  // Proceed with authenticated operations
}
```

### 4. Configuration
Use environment variables for configuration:

```javascript
const config = {
  accountId: process.env.REACT_APP_ALTAN_ACCOUNT_ID,
  debug: process.env.NODE_ENV === 'development'
};
```

## Troubleshooting

### Common Issues

**1. "Account ID not found"**
- Verify your account ID is correct
- Check that your account is active

**2. "Authentication failed"**
- Ensure the guest exists before authenticating
- Check network connectivity

**3. "Room creation failed"**
- Verify the agent ID exists
- Ensure the guest is properly created

**4. Widget not appearing**
- Check console for JavaScript errors
- Verify all required props are provided
- Ensure the account ID and agent ID are correct

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const sdk = createAltanSDK({
  accountId: 'your-account-id',
  debug: true  // Enable detailed logging
});
```

This SDK is proprietary software. See LICENSE file for details.

## Changelog

### v2.0.0
- Complete rewrite with TypeScript
- Added React hooks and components
- Improved error handling and event system
- Better token management
- Enhanced documentation

### v1.x.x
- Initial releases
- Basic SDK functionality 