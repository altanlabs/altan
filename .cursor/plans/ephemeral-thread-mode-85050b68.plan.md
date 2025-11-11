<!-- 85050b68-6371-434e-9911-a968087437f1 f498ffa1-576b-45b7-8b89-a3261ecc047a -->
# Fix Ephemeral Mode Bugs

## Problems

1. **Creating multiple threads**: useEffect runs repeatedly, creating duplicate threads
2. **Messages not showing**: After promotion, `addMessage` doesn't add messageId to thread's `messages.allIds`

## Solution

### Quick Fix #1: Prevent Duplicate Thread Creation

**File**: `Room.jsx` line 116-121

**Problem**: useEffect has `temporaryThread` as dependency, but we clear it after promotion, so it creates another one!

**Fix**: Add a ref to track if we've already created one for this session

```javascript
const tempThreadCreatedRef = useRef(false);

useEffect(() => {
  if (ephemeral_mode && initialized && roomId && (user || guest) && 
      !temporaryThread && !tempThreadCreatedRef.current) {
    console.log('🔧 Creating temporary thread for ephemeral mode...');
    dispatch(createTemporaryThread({ roomId }));
    tempThreadCreatedRef.current = true;
  }
}, [ephemeral_mode, initialized, roomId, user, guest, temporaryThread]);

// Reset on unmount
useEffect(() => {
  return () => {
    tempThreadCreatedRef.current = false;
  };
}, []);
```

### Quick Fix #2: Make Messages Display After Promotion

**File**: `room.js` line 1001-1062 (addMessage reducer)

**Problem**: `addMessage` updates `state.messages.byId` but NOT `state.threads.byId[threadId].messages.allIds`

**Fix**: Add message to thread's message list

```javascript
addMessage: (state, action) => {
  const message = action.payload;
  // ... existing validation and update code ...
  
  // ADD THIS at the end:
  const thread = state.threads.byId[message.thread_id];
  if (thread && thread.messages) {
    if (!thread.messages.allIds.includes(message.id)) {
      thread.messages.allIds.push(message.id);
    }
  }
}
```

### Alternative: Reset Temp Thread After Promotion

Instead of using a ref, we could NOT clear `temporaryThread` after promotion, just mark it as `isTemporary: false`. This way useEffect won't recreate it.

**File**: `room.js` line 1265

```javascript
// Instead of: state.temporaryThread = null;
state.temporaryThread = {
  ...state.temporaryThread,
  isTemporary: false, // Mark as promoted, not temporary anymore
};
```

Then in `sendMessage`, check both conditions:

```javascript
if (temporaryThread && temporaryThread.id === threadId && temporaryThread.isTemporary) {
  // Only create if still temporary
}
```

## Recommendation

- Use **Fix #1** (ref approach) - simpler
- Use **Fix #2** (update addMessage) - essential for messages to show

### To-dos

- [x] Add temporary thread state and actions to Redux room slice
- [x] Modify sendMessage to create thread in DB before sending first message