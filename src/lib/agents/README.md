# Altan AI SDK

Ultra-simple AI chat integration for any website.

## 🚀 One-Line Integration (No Coding Required!)

Perfect for **Wix, Shopify, WordPress, or any website**. Just add this single line:

```html
<script 
  src="https://cdn.altan.ai/sdk/altan-widget.js"
  data-account-id="your-account-id"
  data-agent-id="your-agent-id"
></script>
```

**That's it!** A beautiful floating chat appears at the bottom of your page with:
- ⚡ **Instant loading** - Pre-loads in background
- 📱 **Mobile responsive** - Adapts to all screen sizes  
- 🎨 **Smooth animations** - GPU-accelerated transforms
- 🔒 **Secure** - Generates unique visitor IDs

### Widget Configuration

```html
<script 
  src="https://cdn.altan.ai/sdk/altan-widget.js"
  data-account-id="your-account-id"
  data-agent-id="your-agent-id"
  data-placeholder="Ask me anything..."
  data-guest-name="Website Visitor"
  data-guest-email="user@example.com"
></script>
```

---

## 💻 React Integration

For React/Next.js applications, install the npm package:

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

### Compact Mode (Floating Widget)

Shows a floating text field that expands to full chat on click.

```jsx
import { Room } from '@altan/sdk';

<Room
  mode="compact"
  accountId="your-account-id"
  agentId="agent-123"  // OR roomId="room-456"
  placeholder="Ask me anything..."
  guestInfo={{ first_name: "John", external_id: "user-123" }}
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