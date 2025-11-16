# API Configuration Guide

This document explains how to configure API adapters for different environments and versions using the hexagonal architecture pattern.

## Overview

The application uses a **ports and adapters** (hexagonal architecture) pattern to decouple API calls from implementation details. This allows you to:

- Point different services to different environments (dev, staging, prod, local)
- Use different API versions per service
- Switch configurations at runtime without rebuilding
- Easily test with mock adapters

## Architecture

```
Components/Redux Slices
      ↓ (depends on)
  Domain Ports (interfaces)
      ↓ (implemented by)
   HTTP Adapters
      ↓ (uses)
   Axios Instances
```

## Quick Start

### Using Ports in Your Code

```javascript
// Import the port getter
import { getRoomPort } from '../di';

// Get the port instance
const roomPort = getRoomPort();

// Use domain methods (not raw HTTP)
const room = await roomPort.fetchRoom(roomId);
const message = await roomPort.sendMessage(threadId, messageData);
```

### Available Ports

- `getRoomPort()` - Room/chat operations
- `getAgentPort()` - AI agent operations
- `getPlatformPort()` - Platform operations (accounts, agents, templates)
- `getIntegrationPort()` - Integration/connection operations
- `getDatabasePort()` - Database/table operations
- `getCloudPort()` - Cloud infrastructure operations
- `getPodsPort()` - Interface/deployment operations
- `getShopPort()` - Payment/subscription operations

## Configuration

### Default Configuration

By default, all services point to production:

```javascript
// No configuration needed - uses production by default
const roomPort = getRoomPort();
await roomPort.fetchRoom(roomId);
```

### Runtime Configuration

#### Option 1: Global Window Configuration

Add this to your `index.html` or app initialization:

```javascript
// Configure specific services
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'http://localhost:8001',
    version: 'v2',
    type: 'http'
  },
  agent: {
    baseURL: 'https://ai-dev.altan.ai',
    version: 'api/v1',
    type: 'http'
  }
  // Other services will use production defaults
};
```

#### Option 2: Programmatic Configuration

```javascript
import { reconfigureService } from './di';

// Reconfigure a specific service at runtime
reconfigureService('room', {
  baseURL: 'http://localhost:8001',
  version: 'v2'
});

// The next call will use the new configuration
const roomPort = getRoomPort();
await roomPort.fetchRoom(roomId); // Calls http://localhost:8001/v2/rooms/{roomId}
```

#### Option 3: Environment Presets

```javascript
import { switchToEnvironment } from './config/environments';

// Switch ALL services to a specific environment
switchToEnvironment('local');      // Use localhost for everything
switchToEnvironment('development'); // Use dev environment
switchToEnvironment('staging');     // Use staging
switchToEnvironment('production');  // Use production (default)
```

## Common Scenarios

### Scenario 1: Local Development (Room API Only)

You're working on room features and have the room API running locally:

```javascript
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'http://localhost:8001',
    version: 'v2'
  }
};
```

### Scenario 2: Testing with Staging

Test with staging environment while keeping production for payments:

```javascript
import { buildConfigForEnvironment } from './config/environments';

window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment('staging', {
  shop: {
    baseURL: 'https://pay.altan.ai', // Keep shop in production
  }
});
```

### Scenario 3: Mixed Versions

Use different API versions for different services:

```javascript
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'https://room-api.altan.ai',
    version: 'v2'  // Use v2
  },
  database: {
    baseURL: 'https://database-api.altan.ai',
    version: 'v3'  // Still on v3
  }
};
```

### Scenario 4: All Local Development

Run all services locally:

```javascript
import { switchToEnvironment } from './config/environments';

switchToEnvironment('local');
```

Or configure manually:

```javascript
window.ALTAN_ADAPTER_CONFIG = {
  room: { baseURL: 'http://localhost:8001', version: 'v2' },
  agent: { baseURL: 'http://localhost:8002', version: 'api/v1' },
  platform: { baseURL: 'http://localhost:8000', version: '' },
  database: { baseURL: 'http://localhost:8004', version: 'v3' },
  // ... other services
};
```

## Advanced Usage

### Getting Current Configuration

```javascript
import { getServiceConfig } from './di';

const roomConfig = getServiceConfig('room');
console.log('Room API:', roomConfig.baseURL, roomConfig.version);
```

### Accessing Underlying Axios Instance

For advanced use cases or legacy code that needs direct axios access:

```javascript
const roomPort = getRoomPort();
const axiosInstance = roomPort.getAxiosInstance();

// Use axios directly (not recommended for new code)
await axiosInstance.get('/custom/endpoint');
```

### Resetting Services

Force re-instantiation of services (useful when configuration changes):

```javascript
import { resetAllServices } from './di';

// Reset all services
resetAllServices();

// Next getRoomPort() will create a new instance with current config
```

## Environment Variables

You can also use environment variables in your build process:

```javascript
// In your build configuration
const env = process.env.REACT_APP_ENV || 'production';
window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment(env);
```

## Migration Guide

### Old Pattern (Direct Axios)

```javascript
import { optimai_room } from '../../utils/axios';

const response = await optimai_room.post(`/v2/threads/${threadId}/messages`, {
  text: content,
  attachments
});
const message = response.data;
```

### New Pattern (Port-Based)

```javascript
import { getRoomPort } from '../../di';

const roomPort = getRoomPort();
const message = await roomPort.sendMessage(threadId, {
  text: content,
  attachments
});
```

### Benefits of New Pattern

1. **Clearer intent** - `sendMessage()` vs `post('/v2/threads/.../messages')`
2. **Type safety** - Ports define clear contracts
3. **Easy testing** - Mock at domain level, not HTTP level
4. **Flexible configuration** - Change URLs without touching code
5. **Version agnostic** - Version handling is centralized

## Troubleshooting

### Service Not Found Error

```
Error: Service 'roomPort' not registered in container
```

**Solution**: Ensure DI container is initialized. This happens automatically when importing from `src/di`.

### Authentication Issues

If you're getting 401 errors after configuration changes:

```javascript
import { resetAllServices } from './di';
resetAllServices(); // Force re-auth with new configuration
```

### Mixed API Versions

When using different API versions, ensure your adapter implementations support both:

```javascript
// Some endpoints might not have version prefix
// Use getRaw/postRaw for non-versioned endpoints in adapters
```

## Best Practices

1. **Use ports, not axios** - Import `getRoomPort()`, not `optimai_room`
2. **Configure early** - Set `window.ALTAN_ADAPTER_CONFIG` before app initialization
3. **Don't cache port instances** - Call `getRoomPort()` each time (it's memoized)
4. **Test with local first** - Start with local services, gradually switch to remote
5. **Document custom configs** - If you add special configurations, document them

## Support

For questions or issues with API configuration:
- Check port implementations in `src/adapters/http/`
- Review port interfaces in `src/ports/`
- See DI container setup in `src/di/`

