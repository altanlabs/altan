/* global console, fetch, window, document, navigator, localStorage */
/**
 * Altan AI Enhanced Widget
 * Version: 3.0.0
 * Last Updated: 2025-01-23
 * Documentation: https://docs.altan.ai/widget
 */
(async function() {
  'use strict';

  const WIDGET_VERSION = '3.0.0';
  console.log(`🤖 Altan Enhanced Widget v${WIDGET_VERSION} loaded`);

  // Widget configuration
  const WIDGET_CONFIG = {
    API_BASE_URL: 'https://api.altan.ai/platform/guest',
    AUTH_BASE_URL: 'https://api.altan.ai/auth/login/guest',
    ROOM_BASE_URL: 'https://altan.ai/r',
    AGENT_API_URL: 'https://api.altan.ai/platform/agent'
  };

  const scriptTag = document.currentScript;
  const agentId = scriptTag?.getAttribute('altan-agent-id') || scriptTag?.id;
  
  // Default configuration with fallbacks
  let widgetConfig = {
    appearance: {
      size: 'medium',
      placement: 'bottom-right'
    },
    room_settings: {
      display_header: true,
      display_settings: true,
      display_threads: true,
      display_members: true,
      enable_voice: true
    },
    avatar: {
      background_color: '#000',
      avatar_url: null
    },
    remove_altan_branding: false,
    voice_first: false,
    security: {
      allowed_origins: null,
      enable_overrides: ["language", "first_message", "prompt", "voice"]
    },
    theme: {
      primary_color: '#000',
      secondary_color: '#666',
      text_color: '#fff',
      border_radius: 30,
      shadow_intensity: 'medium'
    },
    behavior: {
      auto_open: false,
      welcome_message: null,
      typing_indicator: true,
      sound_enabled: true
    }
  };

  let agentData = null;
  let isVoiceFirstMode = false;
  let currentMode = 'chat'; // 'chat' or 'voice'

  // Size configurations
  const WIDGET_SIZES = {
    small: { button: 40, radius: 20 },
    medium: { button: 50, radius: 25 },
    large: { button: 60, radius: 30 },
    xl: { button: 70, radius: 35 }
  };

  // Position configurations
  const WIDGET_POSITIONS = {
    'bottom-right': { bottom: '25px', right: '25px' },
    'bottom-left': { bottom: '25px', left: '25px' },
    'top-right': { top: '25px', right: '25px' },
    'top-left': { top: '25px', left: '25px' },
    'bottom-center': { bottom: '25px', left: '50%', transform: 'translateX(-50%)' },
    'top-center': { top: '25px', left: '50%', transform: 'translateX(-50%)' },
    'center-right': { right: '25px', top: '50%', transform: 'translateY(-50%)' },
    'center-left': { left: '25px', top: '50%', transform: 'translateY(-50%)' }
  };

  // Authentication state
  const authState = {
    guest: null,
    accountId: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  };

  // Load agent configuration
  async function loadAgentConfiguration() {
    try {
      const response = await fetch(`${WIDGET_CONFIG.AGENT_API_URL}/${agentId}/public`);
      if (!response.ok) {
        throw new Error(`Failed to load agent: ${response.status}`);
      }
      
      const data = await response.json();
      agentData = data.agent;
      
      // Merge with widget configuration from agent metadata
      const agentWidget = agentData.meta_data?.widget || {};
      
      widgetConfig = {
        ...widgetConfig,
        ...agentWidget,
        appearance: {
          ...widgetConfig.appearance,
          ...agentWidget.appearance
        },
        room_settings: {
          ...widgetConfig.room_settings,
          ...agentWidget.room_settings
        },
        avatar: {
          ...widgetConfig.avatar,
          ...agentWidget.avatar,
          avatar_url: agentData.avatar_url || agentWidget.avatar?.avatar_url
        },
        theme: {
          ...widgetConfig.theme,
          primary_color: agentData.brand_color || agentWidget.theme?.primary_color || widgetConfig.theme.primary_color
        }
      };

      // Check if voice-first mode is enabled
      isVoiceFirstMode = widgetConfig.voice_first && agentData.elevenlabs_id;
      
      console.log('🎨 Widget configuration loaded:', widgetConfig);
      console.log('🎙️ Voice-first mode:', isVoiceFirstMode);
      
    } catch (error) {
      console.warn('⚠️ Failed to load agent configuration:', error);
    }
  }

  // Enhanced widget creation with voice-first support
  function createEnhancedWidget() {
    const config = widgetConfig;
    const size = WIDGET_SIZES[config.appearance.size] || WIDGET_SIZES.medium;
    const position = WIDGET_POSITIONS[config.appearance.placement] || WIDGET_POSITIONS['bottom-right'];

    // Create main container
    const container = document.createElement('div');
    container.id = 'altan-enhanced-widget';
    container.className = 'altan-enhanced-widget-container';
    
    // Apply positioning
    Object.assign(container.style, {
      position: 'fixed',
      zIndex: '999999999',
      ...position
    });

    if (isVoiceFirstMode) {
      container.innerHTML = createVoiceFirstHTML(config, size);
    } else {
      container.innerHTML = createChatFirstHTML(config, size);
    }

    // Inject enhanced styles
    injectEnhancedStyles(config);
    
    // Setup event listeners
    setupEnhancedEventListeners(container);
    
    document.body.appendChild(container);
    
    // Auto-open if configured
    if (config.behavior?.auto_open) {
      setTimeout(() => openWidget(), 1000);
    }
    
    return container;
  }

  function createVoiceFirstHTML(config, size) {
    const hasAvatar = config.avatar.avatar_url;
    const buttonSize = size.button;
    
    return `
      <div class="altan-widget-selector" id="altan-widget-selector">
        <div class="altan-mode-toggle" id="altan-mode-toggle">
          <button class="altan-mode-btn ${currentMode === 'voice' ? 'active' : ''}" 
                  data-mode="voice" id="voice-mode-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            <span>Voice</span>
          </button>
          <button class="altan-mode-btn ${currentMode === 'chat' ? 'active' : ''}" 
                  data-mode="chat" id="chat-mode-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <span>Chat</span>
          </button>
        </div>
        
        <button class="altan-main-button" id="altan-main-button" 
                style="width: ${buttonSize}px; height: ${buttonSize}px; border-radius: ${size.radius}px;">
          <div class="altan-button-content">
            ${hasAvatar ? 
              `<img src="${config.avatar.avatar_url}" alt="Agent Avatar" class="altan-avatar">` :
              `<div class="altan-icon-container">
                ${getCurrentModeIcon()}
              </div>`
            }
          </div>
          <div class="altan-pulse-ring"></div>
        </button>
      </div>
      
      <div class="altan-chat-window" id="altan-chat-window" style="display: none;">
        <iframe
          allow="clipboard-write; microphone; camera"
          id="altan-iframe"
          name="Altan-App"
          src=""
          width="100%"
          height="100%"
          frameborder="0">
        </iframe>
      </div>
      
      ${!config.remove_altan_branding ? createBrandingHTML() : ''}
    `;
  }

  function createChatFirstHTML(config, size) {
    const hasAvatar = config.avatar.avatar_url;
    const buttonSize = size.button;
    
    return `
      <button class="altan-main-button" id="altan-main-button" 
              style="width: ${buttonSize}px; height: ${buttonSize}px; border-radius: ${size.radius}px;">
        <div class="altan-button-content">
          ${hasAvatar ? 
            `<img src="${config.avatar.avatar_url}" alt="Agent Avatar" class="altan-avatar">` :
            `<div class="altan-icon-container">
              ${getChatIcon()}
            </div>`
          }
        </div>
        <div class="altan-pulse-ring"></div>
      </button>
      
      <div class="altan-chat-window" id="altan-chat-window" style="display: none;">
        <iframe
          allow="clipboard-write; microphone; camera"
          id="altan-iframe"
          name="Altan-App"
          src=""
          width="100%"
          height="100%"
          frameborder="0">
        </iframe>
      </div>
      
      ${!config.remove_altan_branding ? createBrandingHTML() : ''}
    `;
  }

  function getCurrentModeIcon() {
    if (currentMode === 'voice') {
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>`;
    }
    return getChatIcon();
  }

  function getChatIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>`;
  }

  function createBrandingHTML() {
    return `
      <div class="altan-branding" id="altan-branding">
        <span>Powered by</span>
        <img src="https://altan.ai/logos/horizontalBlack.png" alt="Altan" class="altan-logo">
      </div>
    `;
  }

  function injectEnhancedStyles(config) {
    if (document.getElementById('altan-enhanced-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'altan-enhanced-styles';
    styles.textContent = `
      .altan-enhanced-widget-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        user-select: none;
      }

      .altan-widget-selector {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .altan-mode-toggle {
        display: flex;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .altan-mode-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: none;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        transition: all 0.2s ease;
      }

      .altan-mode-btn.active {
        background: ${config.theme.primary_color};
        color: white;
      }

      .altan-mode-btn:hover:not(.active) {
        background: rgba(0, 0, 0, 0.05);
      }

      .altan-main-button {
        position: relative;
        background: ${config.theme.primary_color};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }

      .altan-main-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .altan-main-button:active {
        transform: scale(0.98);
      }

      .altan-button-content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${config.theme.text_color};
      }

      .altan-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      .altan-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .altan-pulse-ring {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid ${config.theme.primary_color};
        border-radius: inherit;
        animation: pulse 2s infinite;
        opacity: 0;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.3;
        }
        100% {
          transform: scale(1.2);
          opacity: 0;
        }
      }

      .altan-chat-window {
        position: fixed;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        z-index: 999999998;
        transform-origin: bottom right;
      }

      .altan-chat-window.show {
        animation: chatShow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }

      .altan-chat-window.hide {
        animation: chatHide 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      @keyframes chatShow {
        0% {
          opacity: 0;
          transform: scale(0.7) translateY(20px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes chatHide {
        0% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        100% {
          opacity: 0;
          transform: scale(0.7) translateY(20px);
        }
      }

      .altan-branding {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: #999;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .altan-branding:hover {
        opacity: 0.7;
      }

      .altan-logo {
        height: 12px;
        width: auto;
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .altan-chat-window {
          width: calc(100vw - 20px) !important;
          height: calc(100vh - 120px) !important;
          bottom: 80px !important;
          right: 10px !important;
          left: 10px !important;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  function setupEnhancedEventListeners(container) {
    const mainButton = container.querySelector('#altan-main-button');
    const modeToggle = container.querySelector('#altan-mode-toggle');
    const chatWindow = container.querySelector('#altan-chat-window');
    const branding = container.querySelector('#altan-branding');

    // Main button click
    mainButton?.addEventListener('click', () => {
      if (chatWindow.style.display === 'none') {
        openWidget();
      } else {
        closeWidget();
      }
    });

    // Mode toggle buttons
    if (modeToggle) {
      modeToggle.addEventListener('click', (e) => {
        const modeBtn = e.target.closest('.altan-mode-btn');
        if (modeBtn) {
          const mode = modeBtn.getAttribute('data-mode');
          switchMode(mode);
        }
      });
    }

    // Branding click
    branding?.addEventListener('click', () => {
      window.open('https://altan.ai/', '_blank');
    });

    // Window resize handling
    window.addEventListener('resize', () => {
      updateChatWindowSize();
    });
  }

  function switchMode(mode) {
    currentMode = mode;
    
    // Update button states
    const modeButtons = document.querySelectorAll('.altan-mode-btn');
    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    // Update main button icon
    const iconContainer = document.querySelector('.altan-icon-container');
    if (iconContainer) {
      iconContainer.innerHTML = getCurrentModeIcon();
    }

    console.log(`🔄 Switched to ${mode} mode`);
  }

  function openWidget() {
    const chatWindow = document.querySelector('#altan-chat-window');
    const iframe = document.querySelector('#altan-iframe');
    
    updateChatWindowSize();
    chatWindow.style.display = 'block';
    chatWindow.classList.add('show');
    
    // Load appropriate content based on mode
    if (currentMode === 'voice' && agentData?.elevenlabs_id) {
      // For voice mode, we would integrate with the voice widget logic
      // For now, load the chat interface with voice capabilities enabled
      loadChatInterface(iframe, { enableVoice: true });
    } else {
      loadChatInterface(iframe, { enableVoice: false });
    }
  }

  function closeWidget() {
    const chatWindow = document.querySelector('#altan-chat-window');
    chatWindow.classList.remove('show');
    chatWindow.classList.add('hide');
    
    setTimeout(() => {
      chatWindow.style.display = 'none';
      chatWindow.classList.remove('hide');
    }, 200);
  }

  function updateChatWindowSize() {
    const chatWindow = document.querySelector('#altan-chat-window');
    if (!chatWindow) return;
    
    const windowWidth = window.innerWidth;
    const position = WIDGET_POSITIONS[widgetConfig.appearance.placement] || WIDGET_POSITIONS['bottom-right'];
    
    if (windowWidth <= 600) {
      Object.assign(chatWindow.style, {
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 120px)',
        bottom: '80px',
        right: '10px',
        left: '10px'
      });
    } else {
      Object.assign(chatWindow.style, {
        width: '500px',
        height: '800px',
        bottom: position.bottom ? `${parseInt(position.bottom) + 80}px` : 'auto',
        top: position.top ? `${parseInt(position.top) + 80}px` : 'auto',
        right: position.right || 'auto',
        left: position.left || 'auto'
      });
    }
  }

  async function loadChatInterface(iframe, options = {}) {
    try {
      // Implementation similar to existing openChat function
      // but with enhanced configuration options
      let roomData = getStoredRoomData();
      let guestData = getStoredGuestData();
      
      if (!roomData || !guestData) {
        roomData = await createGuestRoom({
          external_id: generateExternalId(),
          guest_id: '',
          first_name: 'Anonymous',
          last_name: 'Visitor',
          email: `visitor_${Date.now()}@anonymous.com`,
          phone: ''
        });
        
        storeRoomData(roomData);
        guestData = roomData.guest;
        storeGuestData(guestData);
      }

      if (!authState.isAuthenticated || !authState.accessToken) {
        await authenticateGuest(guestData.id, guestData.account_id);
      }

      // Build URL with configuration parameters
      let iframeUrl = `${WIDGET_CONFIG.ROOM_BASE_URL}/${roomData.room_id}`;
      const params = new URLSearchParams();
      
      // Add room settings as URL parameters
      if (!widgetConfig.room_settings.display_header) params.append('hide_header', 'true');
      if (!widgetConfig.room_settings.display_settings) params.append('hide_settings', 'true');
      if (!widgetConfig.room_settings.display_threads) params.append('hide_threads', 'true');
      if (!widgetConfig.room_settings.display_members) params.append('hide_members', 'true');
      if (!widgetConfig.room_settings.enable_voice || !options.enableVoice) params.append('disable_voice', 'true');
      
      if (params.toString()) {
        iframeUrl += `?${params.toString()}`;
      }

      iframe.src = iframeUrl;
      console.log('✅ Chat interface loaded:', iframeUrl);
      
    } catch (error) {
      console.error('❌ Failed to load chat interface:', error);
    }
  }

  // Utility functions (existing ones from original widget)
  function generateExternalId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async function createGuestRoom(guestData) {
    const url = `${WIDGET_CONFIG.API_BASE_URL}/room?agent_id=${agentId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  async function authenticateGuest(guestId, accountId) {
    const url = `${WIDGET_CONFIG.AUTH_BASE_URL}?guest_id=${guestId}&account_id=${accountId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    authState.guest = data.guest;
    authState.accountId = accountId;
    authState.accessToken = data.access_token;
    authState.refreshToken = data.refresh_token;
    authState.isAuthenticated = true;
    
    return data;
  }

  function getStoredRoomData() {
    try {
      const stored = localStorage.getItem(`altan_room_${agentId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function storeRoomData(roomData) {
    try {
      localStorage.setItem(`altan_room_${agentId}`, JSON.stringify(roomData));
    } catch (error) {
      console.warn('Failed to store room data:', error);
    }
  }

  function getStoredGuestData() {
    try {
      const stored = localStorage.getItem(`altan_guest_${agentId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function storeGuestData(guestData) {
    try {
      localStorage.setItem(`altan_guest_${agentId}`, JSON.stringify(guestData));
    } catch (error) {
      console.warn('Failed to store guest data:', error);
    }
  }

  // Initialize the enhanced widget
  async function init() {
    if (!agentId) {
      console.error('❌ Agent ID is required');
      return;
    }

    await loadAgentConfiguration();
    createEnhancedWidget();
    
    console.log('✅ Enhanced widget initialized');
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for debugging
  window.altanEnhancedWidget = {
    config: widgetConfig,
    agentData: agentData,
    switchMode: switchMode
  };

})(); 