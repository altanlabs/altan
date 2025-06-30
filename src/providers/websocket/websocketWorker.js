let ws = null;
let isSecured = false;
let waitingToReconnect = false;
let reconnectTimer = null;
const reconnectDelay = 5000; // Example: 5s, can use exponential backoff if desired

// In-memory tracking for channels, queued subscriptions, etc.
let activeSubscriptions = [];
let subscriptionQueue = [];

/**
 * Helper to send data to the main thread
 */
function postToMainThread(message) {
  self.postMessage(message);
}

/**
 * Clean up and close the WebSocket
 */
function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
    isSecured = false;
    activeSubscriptions = [];
  }
}

function connectWebSocket({ token, accountId }) {
  if (!accountId) {
    postToMainThread({ type: 'ERROR', error: 'No accountId provided. Cannot create WebSocket.' });
    return;
  }

  // If an existing ws is open, close it
  closeWebSocket();

  const socketUrl = `wss://api.altan.ai/platform/ws/account/${accountId}/ws`;
  ws = new WebSocket(socketUrl);

  ws.onopen = () => {
    postToMainThread({ type: 'INFO', message: 'WebSocket connection established' });
    // Try authenticating
    if (token) {
      ws.send(JSON.stringify({ type: 'authenticate', token }));
    } else {
      postToMainThread({
        type: 'ERROR',
        error: 'No token. Cannot authenticate WebSocket.',
      });
      // Optionally close the ws if token is mandatory
    }
  };

  ws.onclose = () => {
    postToMainThread({ type: 'INFO', message: 'WebSocket connection closed' });
    closeWebSocket();

    if (!waitingToReconnect) {
      waitingToReconnect = true;
      reconnectTimer = setTimeout(() => {
        waitingToReconnect = false;
        postToMainThread({ type: 'RECONNECT' });
        // This signals to the main thread to try reconnect logic again.
      }, reconnectDelay);
    }
  };

  ws.onerror = (error) => {
    postToMainThread({ type: 'ERROR', error: `WebSocket error: ${error.message}` });
    ws.close();
  };

  ws.onmessage = async (event) => {
    if (!ws) return;

    // For demonstration, let's assume the server sends base64-encoded JSON
    const decoded = atob(await event.data.text());
    let data;
    try {
      data = JSON.parse(decoded);
    } catch {
      postToMainThread({ type: 'ERROR', error: 'Failed to parse incoming message' });
      return;
    }

    if (data.type === 'ack') {
      isSecured = true;
      postToMainThread({ type: 'INFO', message: 'WebSocket connection secured' });
      // Drain subscription queue
      subscriptionQueue.forEach(({ channel, subType, mode }) => {
        sendSubscription(subType, mode, [channel]);
      });
      activeSubscriptions = [...activeSubscriptions, ...subscriptionQueue.map((q) => q.channel)];
      subscriptionQueue = [];
    } else {
      // Forward the event to the main thread for Redux or other logic
      postToMainThread({ type: 'WS_EVENT', payload: data });
    }
  };
}

/**
 * Send a subscription or unsubscription message to WebSocket
 */
function sendSubscription(type, mode, channels) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !isSecured) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: 'subscription',
      subscription: {
        type,
        mode,
        elements: channels,
      },
    }),
  );
}

/**
 * Main worker message handler
 */
self.onmessage = (event) => {
  const { action, payload } = event.data || {};

  switch (action) {
    case 'INIT':
      // payload: { token, accountId }
      connectWebSocket(payload);
      break;

    case 'SUBSCRIBE':
      // payload: { channel, subType, callbackId, mode }
      // subType defaults to 'l' (live?), mode defaults to 's' (subscribe)
      if (!isSecured || !ws || ws.readyState !== WebSocket.OPEN) {
        // queue it
        subscriptionQueue.push({
          channel: payload.channel,
          subType: payload.subType || 'l',
          mode: payload.mode || 's',
        });
      } else {
        // subscribe immediately
        sendSubscription(payload.subType || 'l', payload.mode || 's', [payload.channel]);
        activeSubscriptions.push(payload.channel);
      }
      break;

    case 'UNSUBSCRIBE':
      // payload: { channel, subType, callbackId, mode }
      if (!isSecured || !ws || ws.readyState !== WebSocket.OPEN) {
        // If not open, either ignore or remove from queue
        subscriptionQueue = subscriptionQueue.filter((q) => q.channel !== payload.channel);
      } else {
        sendSubscription(payload.subType || 'l', payload.mode || 'u', [payload.channel]);
        activeSubscriptions = activeSubscriptions.filter((sub) => sub !== payload.channel);
      }
      break;

    case 'COMMAND':
      // payload: { command, data }
      if (ws && ws.readyState === WebSocket.OPEN && isSecured) {
        ws.send(
          JSON.stringify({
            type: 'command',
            command: payload.command,
            payload: payload.data,
          }),
        );
      }
      break;

    case 'DISCONNECT':
      closeWebSocket();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
        waitingToReconnect = false;
      }
      break;

    default:
      break;
  }
};
