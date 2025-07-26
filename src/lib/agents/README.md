# Altan AI SDK - Room Component

The official JavaScript/TypeScript SDK for integrating with Altan AI's conversational platform. This simplified version provides the Room component for embedding chat interfaces.

## Installation

```bash
npm install @altanlabs/sdk
# or
yarn add @altanlabs/sdk
```

## Room Component

The Room component provides a complete chat interface that can be embedded in your React application.

### Basic Usage

```jsx
import { Room } from '@altanlabs/sdk';

function App() {
  return (
    <div style={{ height: '600px' }}>
      <Room
        accountId="your-account-id"
        agentId="your-agent-id"
        guestInfo={{
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
        }}
        onRoomCreated={(room) => console.log('Room created:', room)}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `accountId` | string | ✅ | Your Altan account ID |
| `agentId` | string | ✅ | The agent ID to create a room with |
| `config` | object | ❌ | Additional SDK configuration |
| `guestInfo` | object | ❌ | Guest user information |
| `width` | string/number | ❌ | Component width (default: '100%') |
| `height` | string/number | ❌ | Component height (default: '100%') |
| `className` | string | ❌ | CSS class name |
| `style` | object | ❌ | Inline styles |
| `onRoomCreated` | function | ❌ | Callback when room is created |
| `onAuthSuccess` | function | ❌ | Callback when authentication succeeds |
| `onError` | function | ❌ | Callback for error handling |

### Guest Information

The `guestInfo` prop accepts the following optional fields:

```typescript
{
  external_id?: string;     // Your internal user ID
  first_name?: string;      // Guest's first name
  last_name?: string;       // Guest's last name
  email?: string;           // Guest's email
  phone?: string;           // Guest's phone number
}
```

### Configuration

The `config` prop allows you to customize SDK behavior:

```typescript
{
  debug?: boolean;           // Enable debug logging (default: false)
  apiBaseUrl?: string;       // Custom API endpoint
  authBaseUrl?: string;      // Custom auth endpoint
  roomBaseUrl?: string;      // Custom room URL base
  enableStorage?: boolean;   // Enable local storage (default: true)
  requestTimeout?: number;   // Request timeout in ms (default: 30000)
}
```

### Complete Example

```jsx
import React from 'react';
import { Room } from '@altanlabs/sdk';

function ChatPage() {
  const handleRoomCreated = (room) => {
    console.log('Chat room created:', room.room_id);
    // Track room creation in analytics
  };

  const handleAuthSuccess = (guest, tokens) => {
    console.log('User authenticated:', guest.id);
    // Store user session if needed
  };

  const handleError = (error) => {
    console.error('Chat error:', error);
    // Handle error (show notification, etc.)
  };

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <h1>Customer Support</h1>
      <div style={{ height: '600px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Room
          accountId="your-account-id"
          agentId="support-agent-id"
          config={{
            debug: process.env.NODE_ENV === 'development'
          }}
          guestInfo={{
            external_id: 'user-123',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          }}
          width="100%"
          height="100%"
          onRoomCreated={handleRoomCreated}
          onAuthSuccess={handleAuthSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}

export default ChatPage;
```

## Environment Variables

For security, store your account ID in environment variables:

```bash
# .env
REACT_APP_ALTAN_ACCOUNT_ID=your-account-id
REACT_APP_ALTAN_AGENT_ID=your-agent-id
```

Then use in your component:

```jsx
<Room
  accountId={process.env.REACT_APP_ALTAN_ACCOUNT_ID}
  agentId={process.env.REACT_APP_ALTAN_AGENT_ID}
  // ... other props
/>
```

## Troubleshooting

### Common Issues

**Room not loading**
- Verify your `accountId` and `agentId` are correct
- Check browser console for error messages
- Ensure you have a stable internet connection

**Authentication errors**
- Check that guest information is properly formatted
- Verify your account has proper permissions

### Debug Mode

Enable debug logging to see detailed information:

```jsx
<Room
  // ... other props
  config={{ debug: true }}
/>
```

This will log detailed information about:
- SDK initialization
- Room creation process
- Authentication flow
- Message passing between iframe and parent

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { Room, RoomProps, GuestData, RoomData } from '@altanlabs/sdk';

const MyRoom: React.FC = () => {
  const handleRoomCreated = (room: RoomData) => {
    console.log('Room created:', room.room_id);
  };

  return (
    <Room
      accountId="your-account-id"
      agentId="your-agent-id"
      onRoomCreated={handleRoomCreated}
    />
  );
};
```

## License

This SDK is proprietary software. See LICENSE file for details.

## Support

For support and questions, contact: support@altan.ai 