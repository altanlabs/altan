# Altan AI SDK

For React/Next.js applications, install the npm package:

```bash
npm install @altanlabs/sdk
```

## Usage

### Agent Mode (1-on-1 Chat)

Chat with an AI agent. Automatically finds existing conversation or creates new one.

```jsx
import { Room } from '@altanlabs/sdk';

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
import { Room } from '@altanlabs/sdk';

<Room
  mode="room"
  accountId="your-account-id"
  roomId="room-456"
  guestInfo={{ first_name: "John", external_id: "user-123" }}
/>
```

### Compact Mode (Floating Widget)

Shows a floating text field that expands to full chat on click.

```jsx
import { Room } from '@altanlabs/sdk';

<Room
  mode="compact"
  accountId="your-account-id"
  agentId="agent-123"  // OR roomId="room-456"
  placeholder="Ask me anything..."
  guestInfo={{ first_name: "John", external_id: "user-123" }}
/>
```

## 🎨 Room Personalization

Customize the room interface and behavior with configuration props:

```jsx
import { Room } from '@altanlabs/sdk';

<Room
  mode="agent"
  accountId="your-account-id"
  agentId="agent-123"
  // Room personalization options
  tabs={false}                    // Hide/show tabs
  members={false}                 // Hide/show members panel
  conversation_history={true}     // Show conversation history
  settings={true}                 // Show settings panel
  theme="dark"                    // Theme: 'light', 'dark', or 'system'
  title="Custom Support Chat"     // Custom room title
  description="Get help here"     // Custom room description
  voice_enabled={true}            // Enable voice chat
  suggestions={[                  // Predefined message suggestions
    "How can I help you?",
    "Tell me about your services",
    "I need technical support"
  ]}
/>
```

### Room Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tabs` | boolean | `true` | Show/hide tab navigation |
| `conversation_history` | boolean | `true` | Show/hide conversation history |
| `members` | boolean | `true` | Show/hide members panel |
| `settings` | boolean | `true` | Show/hide settings panel |
| `theme` | string | `undefined` | Theme mode: 'light', 'dark', or 'system' |
| `title` | string | `undefined` | Custom room title |
| `description` | string | `undefined` | Custom room description |
| `voice_enabled` | boolean | `true` | Enable/disable voice functionality |
| `suggestions` | string[] | `[]` | Predefined message suggestions |

### Widget Styling Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `primary_color` | string | `#007bff` | Primary color (hex) for buttons and accents |
| `background_color` | string | `#ffffff` | Background color (hex) for the widget |
| `background_blur` | boolean | `true` | Enable glassmorphism background blur effect |
| `position` | string | `bottom-center` | Position: 'bottom-right', 'bottom-left', 'bottom-center' |
| `widget_width` | number | `350` | Widget width in pixels |
| `room_width` | number | `450` | Room width in pixels when expanded |
| `room_height` | number | `600` | Room height in pixels when expanded |
| `border_radius` | number | `16` | Border radius in pixels for rounded corners |

### TypeScript Support

Import the configuration interface for full TypeScript support:

```typescript
import { Room, RoomConfigProps } from '@altanlabs/sdk';

const roomConfig: RoomConfigProps = {
  tabs: false,
  theme: 'dark',
  voice_enabled: true,
  suggestions: ['Hello', 'How can I help?']
};

<Room
  mode="agent"
  accountId="your-account-id"
  agentId="agent-123"
  {...roomConfig}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `"agent"` \| `"room"` \| `"compact"` | ✅ | Chat mode type |
| `accountId` | string | ✅ | Your Altan account ID |
| `agentId` | string | ✅* | Agent ID (required for agent/compact mode) |
| `roomId` | string | ✅* | Room ID (required for room mode, optional for compact) |
| `placeholder` | string | ❌ | Text field placeholder (compact mode only) |
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
import { Room } from '@altanlabs/sdk';

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
        // Room personalization
        theme="light"
        title="Customer Support"
        description="We're here to help!"
        voice_enabled={true}
        suggestions={[
          "I need help with my order",
          "Technical support",
          "Billing question"
        ]}
        // Widget styling
        primary_color="#6366f1"
        background_color="#ffffff"
        background_blur={true}
        position="bottom-right"
        widget_width={400}
        room_width={550}
        room_height={700}
        border_radius={20}
        onConversationReady={(room) => console.log('Chat ready!')}
        onAuthSuccess={(guest) => console.log('User authenticated:', guest.id)}
      />
    </div>
  );
}
```