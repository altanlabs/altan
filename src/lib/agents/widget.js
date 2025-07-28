/**
 * Altan AI - Standalone Widget
 * One-line HTML integration for any website
 * 
 * Usage:
 * <script 
 *   src="https://cdn.altan.ai/sdk/widget.js"
 *   data-account-id="your-account-id"
 *   data-agent-id="your-agent-id"
 *   data-mode="compact"
 *   data-placeholder="Ask me anything..."
 * ></script>
 */

// Import React and our Room component
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Room } from './components.tsx';

// Global widget class
class AltanWidget {
  constructor() {
    this.initialized = false;
    this.config = null;
  }

  // Initialize from script tag data attributes
  initFromScript() {
    const script = document.currentScript || this.findAltanScript();
    if (!script) {
      console.error('Altan Widget: Could not find script tag');
      return;
    }

    const config = {
      accountId: script.getAttribute('data-account-id'),
      agentId: script.getAttribute('data-agent-id'),
      roomId: script.getAttribute('data-room-id'),
      mode: script.getAttribute('data-mode') || 'compact',
      placeholder: script.getAttribute('data-placeholder') || 'How can I help you?',
      apiBaseUrl: script.getAttribute('data-api-base-url') || 'https://api.altan.ai/platform/guest',
      authBaseUrl: script.getAttribute('data-auth-base-url') || 'https://api.altan.ai/auth/login/guest',
      roomBaseUrl: script.getAttribute('data-room-base-url') || 'https://altan.ai/r',
      guestName: script.getAttribute('data-guest-name') || 'Website Visitor',
      guestEmail: script.getAttribute('data-guest-email'),
      externalId: script.getAttribute('data-external-id') || this.generateExternalId(),
    };

    if (!config.accountId) {
      console.error('Altan Widget: data-account-id is required');
      return;
    }

    if (!config.agentId && !config.roomId) {
      console.error('Altan Widget: Either data-agent-id or data-room-id is required');
      return;
    }

    this.init(config);
  }

  // Manual initialization API
  init(config) {
    if (this.initialized) {
      console.warn('Altan Widget: Already initialized');
      return;
    }

    this.config = {
      mode: 'compact',
      placeholder: 'How can I help you?',
      apiBaseUrl: 'https://api.altan.ai/platform/guest',
      authBaseUrl: 'https://api.altan.ai/auth/login/guest',
      roomBaseUrl: 'https://altan.ai/r',
      guestName: 'Website Visitor',
      externalId: this.generateExternalId(),
      ...config
    };

    this.render();
    this.initialized = true;
  }

  // Render the Room component
  render() {
    console.log('🚀 Widget: Starting render process...');
    console.log('🔧 Widget: Config:', this.config);
    
    // Create container if it doesn't exist
    let container = document.getElementById('altan-widget-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'altan-widget-container';
      document.body.appendChild(container);
      console.log('📦 Widget: Container created');
    }

    // Prepare Room props
    const roomProps = {
      mode: this.config.mode,
      accountId: this.config.accountId,
      placeholder: this.config.placeholder,
      config: {
        apiBaseUrl: this.config.apiBaseUrl,
        authBaseUrl: this.config.authBaseUrl,
        roomBaseUrl: this.config.roomBaseUrl,
      },
      guestInfo: {
        first_name: this.config.guestName.split(' ')[0] || 'Website',
        last_name: this.config.guestName.split(' ').slice(1).join(' ') || 'Visitor',
        email: this.config.guestEmail,
        external_id: this.config.externalId,
      },
      onAuthSuccess: (guest, tokens) => {
        console.log('✅ Widget: Authentication successful', guest);
        console.log('🔐 Widget: Tokens received:', tokens ? 'Present' : 'Missing');
        this.fireEvent('auth-success', { guest, tokens });
      },
      onError: (error) => {
        console.error('❌ Widget: Error occurred', error);
        console.error('❌ Widget: Error details:', error.message, error.stack);
        this.fireEvent('error', { error: error.message });
      },
    };

    // Add mode-specific props
    if (this.config.agentId) {
      roomProps.agentId = this.config.agentId;
      roomProps.onConversationReady = (room) => {
        console.log('💬 Widget: Conversation ready', room);
        this.fireEvent('conversation-ready', { room });
      };
    } else if (this.config.roomId) {
      roomProps.roomId = this.config.roomId;
      roomProps.onRoomJoined = (guest, tokens) => {
        console.log('🏠 Widget: Room joined', guest);
        this.fireEvent('room-joined', { guest, tokens });
      };
    }

    console.log('🎯 Widget: Room props prepared:', roomProps);

    try {
      // Render React component
      const root = createRoot(container);
      root.render(React.createElement(Room, roomProps));
      console.log('✅ Widget: React component rendered successfully');
    } catch (error) {
      console.error('❌ Widget: Failed to render React component', error);
      this.fireEvent('error', { error: error.message });
    }
  }

  // Find the Altan script tag
  findAltanScript() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('altan') && script.getAttribute('data-account-id')) {
        return script;
      }
    }
    return null;
  }

  // Generate a unique external ID for anonymous users
  generateExternalId() {
    let externalId = localStorage.getItem('altan-external-id');
    if (!externalId) {
      externalId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('altan-external-id', externalId);
    }
    return externalId;
  }

  // Fire custom events for integration
  fireEvent(eventName, detail) {
    const event = new CustomEvent(`altan-${eventName}`, { detail });
    document.dispatchEvent(event);
  }

  // Destroy the widget
  destroy() {
    const container = document.getElementById('altan-widget-container');
    if (container) {
      container.remove();
    }
    this.initialized = false;
    this.config = null;
  }
}

// Create global instance
const altanWidgetInstance = new AltanWidget();

// Expose to global scope
if (typeof window !== 'undefined') {
  window.AltanWidget = altanWidgetInstance;
} else {
  console.error('❌ Altan Widget: window is not available');
}

// Auto-initialize when DOM is ready
function initializeWidget() {
  if (typeof window !== 'undefined' && window.AltanWidget && window.AltanWidget.initFromScript) {
    try {
      window.AltanWidget.initFromScript();
    } catch (error) {
      console.error('Altan Widget: Failed to initialize', error);
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM already loaded
    setTimeout(initializeWidget, 0);
  }
}

// Export for module systems
export default altanWidgetInstance; 