# Altan AI SDK

Ultra-simple React SDK for embedding AI chat. One component, two modes.

## Installation

```bash
npm install @altanlabs/sdk
```

## Usage

### Agent Mode (1-on-1 Chat)

Chat with an AI agent. Automatically finds existing conversation or creates new one.

```jsx
import { Room } from '@altan/sdk';

<Room
  mode="agent"
  accountId="your-account-id"
  agentId="agent-123"
  guestInfo={{ first_name: "John", external_id: "user-123" }}
/>
```

### Room Mode (Group Chat)

Join a specific room by ID. Perfect for community chat, support channels, etc.

```jsx
import { Room } from '@altan/sdk';

<Room
  mode="room"
  accountId="your-account-id"
  roomId="room-456"
  guestInfo={{ first_name: "John", external_id: "user-123" }}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `"agent"` \| `"room"` | ✅ | Chat with agent or join room |
| `accountId` | string | ✅ | Your Altan account ID |
| `agentId` | string | ✅* | Agent ID (required for agent mode) |
| `roomId` | string | ✅* | Room ID (required for room mode) |
| `guestInfo` | object | ❌ | User info (name, external_id, email) |

*Required based on mode

## Requirements

- **Agents must be public** for agent mode to work
- **Rooms must be public** for room mode to work  
- **Allowlist your domains** in Altan dashboard for better security

## Guest Info

```jsx
guestInfo={{
  external_id: 'user-123',    // Your user ID (enables conversation history)
  first_name: 'John',         // User's first name
  last_name: 'Doe',          // User's last name  
  email: 'john@example.com'   // User's email
}}
```

## Complete Example

```jsx
import React from 'react';
import { Room } from '@altan/sdk';

function App() {
  return (
    <div style={{ height: '600px' }}>
      <Room
        mode="agent"
        accountId="your-account-id"
        agentId="support-agent"
        guestInfo={{
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          external_id: 'user-456'
        }}
        onConversationReady={(room) => console.log('Chat ready!')}
        onAuthSuccess={(guest) => console.log('User authenticated:', guest.id)}
      />
    </div>
  );
}
```