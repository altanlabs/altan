import { createAltanSDK, useAltan } from '@altan/sdk';

// ============================================================================
// Basic SDK Usage Examples
// ============================================================================

// 1. Initialize SDK (accountId is required)
const sdk = createAltanSDK({
  accountId: 'your-account-id', // Required: Your tenant/account ID
  debug: true, // Enable for development
});

// 2. Create Guest and Agent Chat (One-shot method)
async function createAgentChat() {
  try {
    const { guest, room, tokens } = await sdk.createSession('agent-id', {
      external_id: 'user-123', // Optional: for returning users
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });

    console.log('✅ Chat ready!');
    console.log('Room URL:', room.url);
    console.log('Guest:', guest);
    console.log('Authenticated:', !!tokens.accessToken);

    return { guest, room, tokens };
  } catch (error) {
    console.error('❌ Failed to create chat:', error);
    throw error;
  }
}

// 3. Modular Approach (Step-by-step)
async function createChatModular() {
  try {
    // Step 1: Create guest
    const guest = await sdk.createGuest({
      external_id: 'user-456',
      first_name: 'Jane',
      last_name: 'Smith',
    });

    // Step 2: Create room with agent
    const room = await sdk.createRoom(guest.id, 'agent-id');

    // Step 3: Authenticate guest
    const tokens = await sdk.authenticateGuest(guest.id);

    return { guest, room, tokens };
  } catch (error) {
    console.error('❌ Modular chat creation failed:', error);
    throw error;
  }
}

// 4. Returning User
async function handleReturningUser(externalId) {
  try {
    // Try to find existing guest
    const guest = await sdk.getGuestByExternalId(externalId);
    const room = await sdk.createRoom(guest.id, 'agent-id');
    const tokens = await sdk.authenticateGuest(guest.id);

    console.log('✅ Returning user authenticated');
    return { guest, room, tokens };
  } catch (error) {
    // Guest doesn't exist, create new one
    console.log('New user, creating guest...');
    return await createAgentChat();
  }
}

// 5. Join Existing Room (P2P Chat)
async function joinExistingRoom(roomId) {
  try {
    // Create guest
    const guest = await sdk.createGuest({
      external_id: 'user-789',
      first_name: 'Bob',
      last_name: 'Wilson',
    });

    // Join the room
    await sdk.joinRoom(roomId, guest.id);

    // Authenticate
    const tokens = await sdk.authenticateGuest(guest.id);

    const roomUrl = sdk.getRoomUrl(roomId);
    console.log('✅ Joined room:', roomUrl);

    return { guest, tokens, roomUrl };
  } catch (error) {
    console.error('❌ Failed to join room:', error);
    throw error;
  }
}

// 6. Check for Cached User
async function handleCachedUser() {
  const storedGuest = sdk.getStoredGuest();
  const storedTokens = sdk.getStoredTokens();

  if (storedGuest && storedTokens) {
    try {
      // Try to refresh tokens
      const freshTokens = await sdk.refreshTokens();
      console.log('✅ Using cached user with refreshed tokens');
      return { guest: storedGuest, tokens: freshTokens };
    } catch (error) {
      // Tokens expired, re-authenticate
      console.log('🔄 Tokens expired, re-authenticating...');
      const newTokens = await sdk.authenticateGuest(storedGuest.id);
      return { guest: storedGuest, tokens: newTokens };
    }
  } else {
    // First time user
    console.log('👋 First time user, creating new session...');
    return await createAgentChat();
  }
}

// ============================================================================
// React Hook Examples
// ============================================================================

// Basic React component
function ChatComponent() {
  const altan = useAltan({
    accountId: 'your-account-id',
    debug: true,
  });

  const handleStartChat = async () => {
    try {
      const { guest, room, tokens } = await altan.createSession('agent-id', {
        first_name: 'Anonymous',
        last_name: 'Visitor',
      });

      console.log('Chat started:', room.url);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStartChat}>Start Chat</button>
      {altan.guest.isLoading && <p>Creating guest...</p>}
      {altan.room.isCreating && <p>Creating room...</p>}
      {altan.auth.isLoading && <p>Authenticating...</p>}
    </div>
  );
}

// ============================================================================
// Error Handling Examples
// ============================================================================

async function withErrorHandling() {
  try {
    const result = await sdk.createSession('agent-id');
    return result;
  } catch (error) {
    if (error.message.includes('404')) {
      console.error('Agent or account not found');
    } else if (error.message.includes('401')) {
      console.error('Authentication failed');
    } else if (error.message.includes('400')) {
      console.error('Bad request - check your parameters');
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// Export Examples
// ============================================================================

export {
  createAgentChat,
  createChatModular,
  handleReturningUser,
  joinExistingRoom,
  handleCachedUser,
  withErrorHandling,
  ChatComponent,
}; 