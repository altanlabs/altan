# HTTP Adapters

This directory contains **HTTP adapter implementations** for domain ports.

## What are Adapters?

Adapters are **implementations** of port interfaces. They translate domain operations into specific technical implementations (HTTP calls, WebSocket connections, localStorage, etc.).

## Structure

```
adapters/
├── http/                    # HTTP/REST adapters
│   ├── BaseHttpAdapter.js   # Base class for all HTTP adapters
│   ├── RoomHttpAdapter.js   # Implements RoomPort via HTTP
│   ├── AgentHttpAdapter.js  # Implements AgentPort via HTTP
│   └── ...                  # Other HTTP adapters
└── README.md               # This file
```

## BaseHttpAdapter

All HTTP adapters extend `BaseHttpAdapter`, which provides:

- Axios instance creation and configuration
- Authentication interceptors
- Error tracking
- Version prefix handling
- Common HTTP methods (get, post, patch, delete)

### Key Methods

```javascript
// Versioned requests (adds version prefix)
adapter.get('/path')      // -> GET /v2/path
adapter.post('/path', data)

// Non-versioned requests (no version prefix)
adapter.getRaw('/path')   // -> GET /path
adapter.postRaw('/path', data)
```

## Creating an HTTP Adapter

### Step 1: Define Port Interface

First, create your port in `src/ports/`:

```javascript
// src/ports/OrderPort.js
export class OrderPort {
  async placeOrder(orderData) {
    throw new Error('placeOrder() must be implemented');
  }
  
  async fetchOrder(orderId) {
    throw new Error('fetchOrder() must be implemented');
  }
}
```

### Step 2: Implement HTTP Adapter

```javascript
// src/adapters/http/OrderHttpAdapter.js
import { OrderPort } from '../../ports/OrderPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

export class OrderHttpAdapter extends OrderPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'order_service',
    });
  }

  async placeOrder(orderData) {
    // POST /v1/orders
    return this.adapter.post('/orders', orderData);
  }

  async fetchOrder(orderId) {
    // GET /v1/orders/{orderId}
    return this.adapter.get(`/orders/${orderId}`);
  }

  // Expose axios instance for edge cases
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}
```

### Step 3: Register in DI Container

```javascript
// src/di/registerAdapters.js
import { OrderHttpAdapter } from '../adapters/http/OrderHttpAdapter';

// In registerAdapters function:
container.register('orderPort', () => {
  const cfg = config.order;
  return new OrderHttpAdapter(cfg);
});
```

### Step 4: Add Configuration

```javascript
// src/config/adapter-config.js
export const DEFAULT_ADAPTER_CONFIG = {
  // ... existing configs
  order: {
    baseURL: 'https://order-api.altan.ai',
    version: 'v1',
    type: 'http'
  }
};
```

## Version Handling

### Automatic Version Prefix

By default, BaseHttpAdapter adds the version prefix:

```javascript
// Configuration
config = { baseURL: 'https://api.altan.ai', version: 'v2' }

// Adapter call
adapter.get('/rooms/123')

// Actual HTTP call
GET https://api.altan.ai/v2/rooms/123
```

### Non-Versioned Endpoints

Some endpoints don't use version prefixes. Use `Raw` methods:

```javascript
// Adapter call
adapter.getRaw('/external/abc')

// Actual HTTP call
GET https://api.altan.ai/external/abc
```

### Mixed Versioning

If you have endpoints with different patterns:

```javascript
export class RoomHttpAdapter extends RoomPort {
  async fetchRoom(roomId) {
    // Versioned: /v2/rooms/{id}
    return this.adapter.get(`/rooms/${roomId}`);
  }

  async joinRoom(roomId) {
    // Non-versioned: /{roomId}/join
    return this.adapter.getRaw(`/${roomId}/join`);
  }
}
```

## Error Handling

Adapters should propagate errors to the caller:

```javascript
async placeOrder(orderData) {
  try {
    return await this.adapter.post('/orders', orderData);
  } catch (error) {
    // Let BaseHttpAdapter's interceptors handle it
    // or add custom error handling here
    throw error;
  }
}
```

## Authentication

Authentication is handled automatically by interceptors in BaseHttpAdapter:

- 401 responses trigger token refresh
- New token is applied to retry request
- Works with both user and guest authentication

You don't need to handle auth in your adapters.

## Request Configuration

For special requests (upload progress, abort signals, etc.):

```javascript
async uploadFile(data, onProgress) {
  return this.adapter.post('/upload', data, {
    onUploadProgress: (progressEvent) => {
      const percent = (progressEvent.loaded * 100) / progressEvent.total;
      onProgress(percent);
    }
  });
}
```

## Response Transformation

Adapters should return domain data, not HTTP responses:

```javascript
// ❌ Don't return axios response
async fetchRoom(roomId) {
  const response = await this.adapter.get(`/rooms/${roomId}`);
  return response; // Contains status, headers, etc.
}

// ✅ Return domain data
async fetchRoom(roomId) {
  // BaseHttpAdapter.get() already returns response.data
  return this.adapter.get(`/rooms/${roomId}`);
}

// ✅ Transform if needed
async createMedia(roomId, mediaData) {
  const data = await this.adapter.post(`/${roomId}/media`, mediaData);
  return data.media_url; // Return just what's needed
}
```

## Testing Adapters

```javascript
import { RoomHttpAdapter } from './RoomHttpAdapter';

describe('RoomHttpAdapter', () => {
  it('sends message correctly', async () => {
    const config = {
      baseURL: 'https://test-api.altan.ai',
      version: 'v2',
      type: 'http'
    };
    
    const adapter = new RoomHttpAdapter(config);
    
    // Mock the underlying axios if needed
    const axios = adapter.getAxiosInstance();
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: { id: 'msg-1', text: 'Hello' }
    });
    
    const result = await adapter.sendMessage('thread-1', {
      text: 'Hello'
    });
    
    expect(result.id).toBe('msg-1');
  });
});
```

## Common Patterns

### Pagination

```javascript
async fetchRecords(tableId, options = {}) {
  const { limit = 25, cursor } = options;
  let url = `/tables/${tableId}/records?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  return this.adapter.get(url);
}
```

### Query Parameters

```javascript
async searchUsers(query, filters = {}) {
  const params = new URLSearchParams();
  params.append('q', query);
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  
  return this.adapter.get(`/users?${params.toString()}`);
}
```

### Conditional Endpoints

```javascript
async fetchData(id, detailed = false) {
  const endpoint = detailed
    ? `/data/${id}/detailed`
    : `/data/${id}`;
  return this.adapter.get(endpoint);
}
```

## Non-HTTP Adapters

While all current adapters use HTTP, the pattern supports other implementations:

```javascript
// Future: WebSocket adapter
export class RoomWebSocketAdapter extends RoomPort {
  constructor(config) {
    super();
    this.ws = new WebSocket(config.baseURL);
  }

  async sendMessage(threadId, messageData) {
    return new Promise((resolve) => {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        threadId,
        data: messageData
      }));
      
      this.ws.once('message', (event) => {
        resolve(JSON.parse(event.data));
      });
    });
  }
}

// Future: Mock adapter for testing
export class RoomMockAdapter extends RoomPort {
  async sendMessage(threadId, messageData) {
    return {
      id: 'mock-message-' + Date.now(),
      text: messageData.text,
      thread_id: threadId
    };
  }
}
```

## See Also

- [Port Interfaces](../ports/README.md) - Understanding ports
- [API Configuration](../../docs/API_CONFIGURATION.md) - Configuring adapters
- [DI Container](../di/Container.js) - Dependency injection

