/**
 * Basic tests for port-based architecture
 * Verifies that ports can be instantiated and configured
 */

import { container, getRoomPort, reconfigureService, resetAllServices } from '../index';

describe('Port-based Architecture', () => {
  afterEach(() => {
    // Clean up after each test
    delete window.ALTAN_ADAPTER_CONFIG;
    resetAllServices();
  });

  describe('Container', () => {
    it('should provide room port', () => {
      const roomPort = getRoomPort();
      expect(roomPort).toBeDefined();
      expect(typeof roomPort.fetchRoom).toBe('function');
      expect(typeof roomPort.sendMessage).toBe('function');
    });

    it('should memoize port instances', () => {
      const roomPort1 = getRoomPort();
      const roomPort2 = getRoomPort();
      expect(roomPort1).toBe(roomPort2);
    });

    it('should reset service instances', () => {
      const roomPort1 = getRoomPort();
      container.reset('roomPort');
      const roomPort2 = getRoomPort();
      expect(roomPort1).not.toBe(roomPort2);
    });
  });

  describe('Configuration', () => {
    it('should use default production config', () => {
      const roomPort = getRoomPort();
      const axios = roomPort.getAxiosInstance();
      expect(axios.defaults.baseURL).toBe('https://room-api.altan.ai');
    });

    it('should support runtime configuration', () => {
      window.ALTAN_ADAPTER_CONFIG = {
        room: {
          baseURL: 'http://localhost:8001',
          version: 'v2',
          type: 'http'
        }
      };

      // Reset to pick up new config
      container.reset('roomPort');

      const roomPort = getRoomPort();
      const axios = roomPort.getAxiosInstance();
      expect(axios.defaults.baseURL).toBe('http://localhost:8001');
    });

    it('should support reconfigureService', () => {
      reconfigureService('room', {
        baseURL: 'http://test.local',
        version: 'v3'
      });

      const roomPort = getRoomPort();
      const axios = roomPort.getAxiosInstance();
      expect(axios.defaults.baseURL).toBe('http://test.local');
    });
  });

  describe('Adapter Methods', () => {
    it('should have all required RoomPort methods', () => {
      const roomPort = getRoomPort();
      
      // Check a few key methods exist
      expect(typeof roomPort.fetchRoom).toBe('function');
      expect(typeof roomPort.createRoom).toBe('function');
      expect(typeof roomPort.sendMessage).toBe('function');
      expect(typeof roomPort.fetchThread).toBe('function');
      expect(typeof roomPort.createThread).toBe('function');
      expect(typeof roomPort.deleteMessage).toBe('function');
    });

    it('should provide axios instance for advanced use', () => {
      const roomPort = getRoomPort();
      const axios = roomPort.getAxiosInstance();
      
      expect(axios).toBeDefined();
      expect(typeof axios.get).toBe('function');
      expect(typeof axios.post).toBe('function');
    });
  });

  describe('Path Building', () => {
    it('should build versioned paths correctly', () => {
      const roomPort = getRoomPort();
      const adapter = roomPort.adapter;
      
      // v2 version is configured by default
      const path = adapter.buildPath('/rooms/123');
      expect(path).toBe('/v2/rooms/123');
    });

    it('should build non-versioned paths correctly', () => {
      const roomPort = getRoomPort();
      const adapter = roomPort.adapter;
      
      const path = adapter.buildRawPath('/external/abc');
      expect(path).toBe('/external/abc');
    });

    it('should handle paths that already include version', () => {
      const roomPort = getRoomPort();
      const adapter = roomPort.adapter;
      
      const path = adapter.buildPath('/v2/rooms/123');
      expect(path).toBe('/v2/rooms/123'); // Should not double-add version
    });
  });
});

