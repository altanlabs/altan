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
 *   data-tabs="true"
 *   data-theme="dark"
 *   data-voice-enabled="true"
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

  // Helper function to parse boolean data attributes
  parseBooleanAttribute(value) {
    if (value === null || value === undefined) return undefined;
    return value.toLowerCase() === 'true';
  }

  // Helper function to parse JSON data attributes
  parseJsonAttribute(value) {
    if (!value) return undefined;
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (e) {
      console.warn('Altan Widget: Failed to parse JSON attribute:', value);
      return undefined;
    }
  }

  // Helper function to parse string attributes that might be "null"
  parseStringAttribute(value) {
    if (value === null || value === undefined || value === 'null' || value === '') {
      return undefined;
    }
    return value;
  }

  // Initialize from script tag data attributes
  initFromScript() {
    const script = document.currentScript || this.findAltanScript();
    if (!script) {
      console.error('Altan Widget: Could not find script tag');
      return;
    }

    const config = {
      // Core configuration
      accountId: script.getAttribute('data-account-id'),
      agentId: script.getAttribute('data-agent-id'),
      roomId: script.getAttribute('data-room-id'),
      mode: script.getAttribute('data-mode') || 'compact',
      placeholder: script.getAttribute('data-placeholder') || 'How can I help you?',
      apiBaseUrl: script.getAttribute('data-api-base-url') || 'https://api.altan.ai/platform/guest',
      authBaseUrl:
        script.getAttribute('data-auth-base-url') || 'https://api.altan.ai/auth/login/guest',
      roomBaseUrl: script.getAttribute('data-room-base-url') || 'https://www.altan.ai/r',
      guestName: script.getAttribute('data-guest-name') || 'Website Visitor',
      guestEmail: script.getAttribute('data-guest-email'),
      externalId: script.getAttribute('data-external-id') || this.generateExternalId(),

      // Room configuration props
      tabs: this.parseBooleanAttribute(script.getAttribute('data-tabs')),
      conversation_history: this.parseBooleanAttribute(
        script.getAttribute('data-conversation-history'),
      ),
      members: this.parseBooleanAttribute(script.getAttribute('data-members')),
      settings: this.parseBooleanAttribute(script.getAttribute('data-settings')),
      show_fullscreen_button: this.parseBooleanAttribute(script.getAttribute('data-show-fullscreen-button')),
      show_sidebar_button: this.parseBooleanAttribute(script.getAttribute('data-show-sidebar-button')),
      theme: this.parseStringAttribute(script.getAttribute('data-theme')),
      title: this.parseStringAttribute(script.getAttribute('data-title')),
      description: this.parseStringAttribute(script.getAttribute('data-description')),
      suggestions: this.parseJsonAttribute(script.getAttribute('data-suggestions')),
      voice_enabled: this.parseBooleanAttribute(script.getAttribute('data-voice-enabled')),

      // Styling props
      primary_color: this.parseStringAttribute(script.getAttribute('data-primary-color')),
      background_color: this.parseStringAttribute(script.getAttribute('data-background-color')),
      background_blur: this.parseBooleanAttribute(script.getAttribute('data-background-blur')),
      position: this.parseStringAttribute(script.getAttribute('data-position')),
      widget_width: script.getAttribute('data-width')
        ? parseInt(script.getAttribute('data-width'))
        : undefined,
      room_width: script.getAttribute('data-room-width')
        ? parseInt(script.getAttribute('data-room-width'))
        : undefined,
      room_height: script.getAttribute('data-room-height')
        ? parseInt(script.getAttribute('data-room-height'))
        : undefined,
      border_radius: script.getAttribute('data-border-radius')
        ? parseInt(script.getAttribute('data-border-radius'))
        : undefined,
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
      roomBaseUrl: 'https://www.altan.ai/r',
      guestName: 'Website Visitor',
      externalId: this.generateExternalId(),
      // Room configuration defaults
      tabs: undefined,
      conversation_history: undefined,
      members: undefined,
      settings: undefined,
      theme: undefined,
      title: undefined,
      description: undefined,
      suggestions: undefined,
      voice_enabled: undefined,
      // Styling defaults
      primary_color: undefined,
      background_color: undefined,
      background_blur: undefined,
      position: undefined,
      widget_width: undefined,
      room_width: undefined,
      room_height: undefined,
      border_radius: undefined,
      ...config,
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
      // Room configuration props
      tabs: this.config.tabs,
      conversation_history: this.config.conversation_history,
      members: this.config.members,
      settings: this.config.settings,
      show_fullscreen_button: this.config.show_fullscreen_button,
      show_sidebar_button: this.config.show_sidebar_button,
      theme: this.config.theme,
      title: this.config.title,
      description: this.config.description,
      suggestions: this.config.suggestions,
      voice_enabled: this.config.voice_enabled,
      // Styling props
      primary_color: this.config.primary_color,
      background_color: this.config.background_color,
      background_blur: this.config.background_blur,
      position: this.config.position,
      widget_width: this.config.widget_width,
      room_width: this.config.room_width,
      room_height: this.config.room_height,
      border_radius: this.config.border_radius,
      // Event handlers
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
