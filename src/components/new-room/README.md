# NEW ROOM ARCHITECTURE

## Overview

Clean rewrite of room interface with two modes:
- **Ephemeral Mode** (ChatGPT-style): Single temporary thread, clean UX
- **Tabs Mode**: Multiple persistent threads with tab management

## Key Features

- ✅ TypeScript throughout
- ✅ shadcn/ui components ONLY (zero Material UI)
- ✅ Tailwind CSS for styling
- ✅ Radix UI primitives (via shadcn)
- ✅ Clean architecture with proper separation of concerns
- ✅ No prop drilling (uses Context)
- ✅ No ref-based state management
- ✅ Consolidated useEffects
- ✅ Error boundaries
- ✅ Loading states

## Directory Structure

```
src/components/new-room/
├── RoomContainer.tsx              # Main orchestrator
├── contexts/
│   └── RoomConfigContext.tsx      # Config provider (eliminates prop drilling)
├── modes/
│   ├── EphemeralRoom.tsx         # ChatGPT-style mode
│   └── TabbedRoom.tsx            # Tabs mode
├── input/
│   └── RoomPromptInput.tsx       # Unified input (~500 lines, replaces 1,132 lines)
├── thread/
│   ├── ThreadView.tsx            # Thread display
│   └── ThreadMessages.tsx        # Messages list
├── toolbar/
│   ├── RoomToolbar.tsx           # Clean toolbar
│   └── TabBar.tsx                # Tab management
├── hooks/
│   ├── useRoomInitialization.ts  # Room setup
│   ├── useEphemeralThread.ts     # Temporary thread management
│   ├── useThreadManagement.ts    # Thread CRUD
│   ├── useRoomWebSocket.ts       # WebSocket lifecycle
│   └── useRoomUrlState.ts        # URL parameter handling
├── types/
│   └── room.types.ts             # TypeScript interfaces
├── constants/
│   └── room.constants.ts         # Design tokens, magic numbers
└── components/                    # Reusable UI
    ├── EmptyState.tsx
    ├── LoadingState.tsx
    ├── ErrorState.tsx
    └── RoomErrorBoundary.tsx
```

## Usage

### Basic Usage

```tsx
import { RoomContainer } from '@/components/new-room';

// Ephemeral Mode (ChatGPT-style)
<RoomContainer
  roomId="abc123"
  mode="ephemeral"
  title="How can I help you today?"
  suggestions={["Create a todo app", "Explain React hooks"]}
/>

// Tabs Mode (toolbar with tabs ALWAYS shows)
<RoomContainer
  roomId="abc123"
  mode="tabs"
  showMembers
  showSettings
  showConversationHistory
/>
```

### Configuration Options

```typescript
interface RoomConfig {
  mode: 'ephemeral' | 'tabs';  // Mode determines UI: tabs = toolbar with tabs, ephemeral = no toolbar
  roomId: string;
  
  // UI customization (only used in tabs mode)
  showMembers?: boolean;
  showSettings?: boolean;
  showConversationHistory?: boolean;
  showCloseButton?: boolean;
  showFullscreenButton?: boolean;
  showSidebarButton?: boolean;
  
  // Behavior
  initialMessage?: string;
  title?: string;
  description?: string;
  suggestions?: string[];
  renderCredits?: boolean;
  renderFeedback?: boolean;
  showModeSelector?: boolean;
  
  // Callbacks
  onClose?: () => void;
  onFullscreen?: () => void;
  onSidebar?: () => void;
}
```

## Modes Explained

### Ephemeral Mode

Like ChatGPT:
- User enters → sees clean empty state
- Thread is NOT created in DB until first message
- Single conversation view
- No tabs, no sidebar
- Perfect for quick interactions

### Tabs Mode

Traditional multi-thread:
- Always land in main thread
- Can create new tabs/threads
- Tab management (switch, close)
- Persistent conversations
- Main thread cannot be closed

## Architecture Decisions

### Context over Prop Drilling

Old way (props through 5 levels):
```tsx
Room → DesktopRoom → Threads → ThreadsHistory → Thread (9+ props!)
```

New way (context):
```tsx
RoomConfigProvider wraps entire tree
useRoomConfig() anywhere in tree
```

### Custom Hooks for Business Logic

All complex logic extracted to hooks:
- `useRoomInitialization`: Room setup
- `useEphemeralThread`: Temp thread lifecycle
- `useThreadManagement`: Thread operations
- `useRoomWebSocket`: WebSocket management
- `useRoomUrlState`: URL parameter handling

### Proper State Management

- ❌ No refs for state (was 7 refs in old code)
- ✅ Redux for server state
- ✅ Component state for UI state
- ✅ Derived state from selectors

### Consolidated Effects

From 15+ scattered useEffects to 3-4 organized effects:
- One for room initialization
- One for WebSocket lifecycle
- One for URL processing
- Clean dependencies, proper cleanup

## Component Breakdown

### Before (Legacy)

- `FloatingTextArea.jsx`: 561 lines
- `AttachmentHandler.jsx`: 571 lines
- `DesktopRoom.jsx`: 367 lines
- `Thread.jsx`: 429 lines
- `ThreadMessages.jsx`: 506 lines
- **Total: 2,434 lines** with mixed concerns

### After (New)

- `RoomPromptInput.tsx`: ~500 lines (replaces 1,132)
- `EphemeralRoom.tsx`: ~35 lines
- `TabbedRoom.tsx`: ~45 lines
- `ThreadView.tsx`: ~70 lines
- `ThreadMessages.tsx`: ~100 lines
- `RoomToolbar.tsx`: ~70 lines
- `TabBar.tsx`: ~70 lines
- **Total: ~890 lines** clean, focused code

## Migration Guide

### Phase 1: Enable Feature Flag

```typescript
// src/config/features.ts
export const FEATURES = {
  USE_NEW_ROOM: true, // Enable new UI
  DEFAULT_ROOM_MODE: 'tabs',
};
```

### Phase 2: Update RoomPage

```tsx
// src/pages/RoomPage.jsx
import { FEATURES } from '../config/features';
import OldRoom from '../components/room/Room';
import { RoomContainer } from '../components/new-room';

export default function RoomPage() {
  const { roomId } = useParams();
  
  return FEATURES.USE_NEW_ROOM ? (
    <RoomContainer 
      roomId={roomId} 
      mode="tabs" // tabs = toolbar with tabs, ephemeral = no toolbar
      showMembers
      showSettings
      showConversationHistory
    />
  ) : (
    <OldRoom roomId={roomId} />
  );
}
```

### Phase 3: Test Both Modes

1. Test ephemeral mode
2. Test tabs mode
3. Monitor for issues
4. Gather feedback

### Phase 4: Delete Legacy Code

After new UI is stable:

```bash
rm -rf src/components/room/
rm src/components/FloatingTextArea.jsx
rm src/components/attachment/AttachmentHandler.jsx
```

## Performance

- Virtual scrolling for messages (Virtuoso)
- Memoized selectors
- Proper React.memo usage
- Code splitting ready
- Lazy loading support

## Error Handling

- Error boundaries catch component errors
- Graceful fallback UI
- Retry functionality
- Loading states throughout

## Styling

- 100% Tailwind CSS
- shadcn/ui components
- No Material UI
- Consistent design tokens
- Dark mode support

## Next Steps

1. ✅ Enable feature flag
2. ⏳ Test in development
3. ⏳ Gradual rollout to users
4. ⏳ Monitor metrics
5. ⏳ Remove legacy code

## Support

For questions or issues:
- Check this README
- Review component JSDoc comments
- Consult the plan: `.cursor/plans/room-re.plan.md`

