/**
 * Example API Configuration
 * Copy this file to configure your development environment
 * 
 * Usage:
 * 1. Copy this code to your index.html <script> tag, or
 * 2. Import and execute at app initialization
 */

// ==================== Example 1: All Production (Default) ====================
// No configuration needed - just import and use ports

// ==================== Example 2: Local Room API Development ====================
/*
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'http://localhost:8001',
    version: 'v2',
    type: 'http'
  }
};
*/

// ==================== Example 3: Multiple Local Services ====================
/*
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'http://localhost:8001',
    version: 'v2'
  },
  agent: {
    baseURL: 'http://localhost:8002',
    version: 'api/v1'
  },
  platform: {
    baseURL: 'http://localhost:8000',
    version: ''
  }
};
*/

// ==================== Example 4: Staging Environment ====================
/*
import { switchToEnvironment } from './config/environments';
switchToEnvironment('staging');
*/

// ==================== Example 5: Dev Environment with Production Payments ====================
/*
import { buildConfigForEnvironment } from './config/environments';

window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment('development', {
  shop: {
    baseURL: 'https://pay.altan.ai', // Keep payments in production
  }
});
*/

// ==================== Example 6: Custom API Versions ====================
/*
window.ALTAN_ADAPTER_CONFIG = {
  room: {
    baseURL: 'https://room-api.altan.ai',
    version: 'v3'  // Testing new v3 API
  },
  database: {
    baseURL: 'https://database-api.altan.ai',
    version: 'v4'  // Use v4 instead of v3
  }
};
*/

// ==================== Example 7: Dynamic Runtime Switching ====================
/*
import { reconfigureService } from './di/index.ts';

// Add a debug menu to switch environments on the fly
window.debugSwitchToLocal = () => {
  reconfigureService('room', {
    baseURL: 'http://localhost:8001',
    version: 'v2'
  });
  console.log('✅ Room API switched to localhost:8001');
};

window.debugSwitchToProduction = () => {
  reconfigureService('room', {
    baseURL: 'https://room-api.altan.ai',
    version: 'v2'
  });
  console.log('✅ Room API switched to production');
};
*/

// ==================== Example 8: Branch-Based Configuration ====================
/*
// Configure based on git branch or environment variable
const branch = process.env.VITE_GIT_BRANCH || 'main';

if (branch === 'develop') {
  window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment('development');
} else if (branch === 'staging') {
  window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment('staging');
}
// main branch uses production (default)
*/

export default {};

