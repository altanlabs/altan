# Domain Ports

This directory contains **domain port interfaces** for the application's hexagonal architecture.

## What are Ports?

Ports are **interfaces** that define domain operations without specifying implementation details. They represent what the application needs to do, not how it does it.

## Purpose

Ports provide several benefits:

1. **Decoupling** - Components depend on interfaces, not implementations
2. **Testability** - Easy to mock domain operations
3. **Clarity** - Operations are named by business intent, not HTTP verbs
4. **Flexibility** - Implementations can be swapped without changing components

## Available Ports

### RoomPort
Room and chat operations:
- `fetchRoom(roomId)` - Get room details
- `sendMessage(threadId, messageData)` - Send a message
- `createThread(roomId, threadData)` - Create new thread
- `fetchMessages(threadId, options)` - Get thread messages
- And more...

### AgentPort
AI agent operations:
- `stopAgentResponse(responseId)` - Stop agent response
- `retryResponse(retryData)` - Retry failed response
- `listVoices(options)` - Get available voices

### PlatformPort
Core platform operations:
- `fetchAgent(agentId)` - Get agent details
- `createAgent(accountId, agentData)` - Create new agent
- `updateAccount(accountId, updates)` - Update account
- `fetchWorkspace(workspaceId)` - Get workspace details
- And more...

### IntegrationPort
Integration and connection operations:
- `fetchConnections(options)` - List connections
- `createConnection(connectionData)` - Create OAuth connection
- `fetchAuthorizationRequests(options)` - Get auth requests
- `fetchWebhooks(options)` - List webhooks

### DatabasePort
Database and table operations:
- `fetchTables(cloudId)` - List tables
- `createRecord(tableId, recordData)` - Create record
- `executeQuery(cloudId, query)` - Run SQL query
- And more...

### CloudPort
Cloud infrastructure operations:
- `fetchMetrics(cloudId)` - Get instance metrics
- `startInstance(cloudId)` - Start cloud instance
- `listBuckets(cloudId)` - List storage buckets
- `fetchLogs(cloudId, options)` - Get logs

### PodsPort
Interface and deployment operations:
- `fetchInterface(interfaceId)` - Get interface details
- `commitChanges(interfaceId, commitData)` - Commit code changes
- `deploy(interfaceId)` - Deploy interface
- `addDomain(interfaceId, domainData)` - Add custom domain

### ShopPort
Payment and subscription operations:
- `fetchSubscription(accountId)` - Get current subscription
- `createPaymentIntent(paymentData)` - Initialize payment
- `fetchPlans()` - List available plans

## Usage Example

```javascript
import { getRoomPort } from '../di';

// In a component or Redux thunk
const sendChatMessage = async (threadId, content) => {
  const roomPort = getRoomPort();
  
  // Use domain operation, not HTTP details
  const message = await roomPort.sendMessage(threadId, {
    text: content,
    attachments: []
  });
  
  return message;
};
```

## Creating New Ports

If you need to add a new service:

1. **Create port interface** - `src/ports/NewServicePort.js`

```javascript
export class NewServicePort {
  async doSomething(param) {
    throw new Error('doSomething() must be implemented');
  }
}
```

2. **Create HTTP adapter** - `src/adapters/http/NewServiceHttpAdapter.js`

```javascript
import { NewServicePort } from '../../ports/NewServicePort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

export class NewServiceHttpAdapter extends NewServicePort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'new_service',
    });
  }

  async doSomething(param) {
    return this.adapter.post('/endpoint', { param });
  }
}
```

3. **Register in DI container** - `src/di/registerAdapters.js`

```javascript
import { NewServiceHttpAdapter } from '../adapters/http/NewServiceHttpAdapter';

// In registerAdapters function:
container.register('newServicePort', () => {
  const cfg = config.newService;
  return new NewServiceHttpAdapter(cfg);
});
```

4. **Add configuration** - `src/config/adapter-config.js`

```javascript
export const DEFAULT_ADAPTER_CONFIG = {
  // ... existing configs
  newService: {
    baseURL: 'https://new-api.altan.ai',
    version: 'v1',
    type: 'http'
  }
};
```

5. **Export getter** - `src/di/index.js`

```javascript
export const getNewServicePort = () => container.get('newServicePort');
```

## Port Design Guidelines

### DO ✅

- Use domain-specific method names (`sendMessage` not `postMessage`)
- Group related operations logically
- Document parameters and return types
- Keep methods focused and single-purpose
- Return domain objects, not HTTP responses

### DON'T ❌

- Expose HTTP details (status codes, headers)
- Include implementation logic in ports
- Create generic CRUD methods (be specific)
- Return axios responses directly
- Mix concerns (keep ports focused)

## Examples

### Good Port Design

```javascript
export class OrderPort {
  // Clear domain operation
  async placeOrder(orderData) {
    throw new Error('placeOrder() must be implemented');
  }
  
  // Specific, not generic
  async cancelOrder(orderId, reason) {
    throw new Error('cancelOrder() must be implemented');
  }
}
```

### Poor Port Design

```javascript
export class OrderPort {
  // Too generic, exposes HTTP
  async post(path, data) {
    throw new Error('post() must be implemented');
  }
  
  // Returns HTTP response
  async getOrder(orderId) {
    return { status: 200, data: {...} }; // ❌ Don't do this
  }
}
```

## Testing with Ports

Ports make testing easy:

```javascript
// Create a mock port for testing
class MockRoomPort extends RoomPort {
  async sendMessage(threadId, messageData) {
    return { id: 'mock-message-id', text: messageData.text };
  }
}

// Use in tests
const mockPort = new MockRoomPort();
const result = await sendChatMessage(mockPort, 'thread-1', 'Hello');
```

## See Also

- [API Configuration Guide](../docs/API_CONFIGURATION.md) - Environment configuration
- [Adapter Development](../src/adapters/README.md) - Creating adapters
- [DI Container](../src/di/README.md) - Dependency injection

