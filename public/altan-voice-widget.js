/* global console, fetch, window, document, setTimeout, navigator */
(function() {
  'use strict';

  // Widget configuration
  const WIDGET_CONFIG = {
    API_BASE_URL: 'https://api.altan.ai/platform/agent',
    ELEVENLABS_CLIENT_URL: 'https://cdn.skypack.dev/@elevenlabs/client'
  };

  // Languages configuration
  const LANGUAGES = [
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'es', label: 'Español', icon: '🇪🇸' }, 
    { value: 'fr', label: 'Français', icon: '🇫🇷' },
    { value: 'de', label: 'Deutsch', icon: '🇩🇪' },
    { value: 'it', label: 'Italiano', icon: '🇮🇹' },
  ];

  class AltanVoiceWidget {
    constructor(options = {}) {
      this.agentId = options.agentId;
      this.position = options.position || 'bottom-right';
      this.language = options.language || 'en';
      this.onConnect = options.onConnect;
      this.onDisconnect = options.onDisconnect;
      this.onMessage = options.onMessage;
      this.onError = options.onError;
      
      this.agentData = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.conversation = null;
      this.Conversation = null;
      this.widgetElement = null;
      this.showLanguageMenu = false;

      this.init();
    }

    async init() {
      console.log('🤖 AltanVoiceWidget: Initializing with agent ID:', this.agentId);
      
      if (!this.agentId) {
        console.error('AltanVoiceWidget: agentId is required');
        return;
      }

      try {
        console.log('🤖 Loading agent data...');
        await this.loadAgent();
        console.log('🤖 Agent loaded:', this.agentData);
        
        console.log('🤖 Loading ElevenLabs client...');
        await this.loadElevenLabsClient();
        
        console.log('🤖 Creating widget...');
        this.createWidget();
        
        console.log('🤖 Widget initialized successfully!');
      } catch (error) {
        console.error('🤖 AltanVoiceWidget initialization failed:', error);
        this.onError?.(error);
      }
    }

    async loadAgent() {
      try {
        const apiUrl = `${WIDGET_CONFIG.API_BASE_URL}/${this.agentId}/public`;
        console.log('🤖 Fetching agent from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('🤖 API Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🤖 API Response data:', data);
        
        this.agentData = data.agent;
        
        // Update position from agent metadata if available
        if (this.agentData.meta_data?.widget?.position) {
          this.position = this.agentData.meta_data.widget.position;
          console.log('🤖 Updated position from agent metadata:', this.position);
        }
      } catch (error) {
        console.error('🤖 Failed to load agent:', error);
        throw error;
      }
    }

    async loadElevenLabsClient() {
      return new Promise((resolve, reject) => {
        // Try ES module approach
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { Conversation } from '${WIDGET_CONFIG.ELEVENLABS_CLIENT_URL}';
          window.ElevenLabsConversation = Conversation;
          window.dispatchEvent(new CustomEvent('elevenlabs-loaded'));
        `;

        const handleLoad = () => {
          console.log('🤖 ElevenLabs ES module loaded');
          this.Conversation = window.ElevenLabsConversation;
          if (this.Conversation) {
            resolve();
          } else {
            reject(new Error('ElevenLabs Conversation not available'));
          }
        };

        const handleError = () => {
          console.log('🤖 ES module approach failed, trying alternative...');
          this.loadElevenLabsClientFallback().then(resolve).catch(reject);
        };

        window.addEventListener('elevenlabs-loaded', handleLoad, { once: true });
        script.onerror = handleError;
        
        document.head.appendChild(script);

        // Timeout fallback
        setTimeout(() => {
          if (!this.Conversation) {
            handleError();
          }
        }, 3000);
      });
    }

    async loadElevenLabsClientFallback() {
      return new Promise((resolve, reject) => {
        // Fallback: try to load from unpkg
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/client@latest/dist/index.umd.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          console.log('🤖 ElevenLabs UMD loaded');
          setTimeout(() => {
            // Try different global access patterns
            this.Conversation = window.ElevenLabs?.Conversation || 
                               window.ElevenLabsClient?.Conversation ||
                               window.Conversation;
            
            if (this.Conversation) {
              console.log('🤖 ElevenLabs Conversation found');
              resolve();
            } else {
              console.error('🤖 ElevenLabs Conversation not found');
              reject(new Error('ElevenLabs Conversation not available'));
            }
          }, 500);
        };

        script.onerror = () => {
          console.error('🤖 Failed to load ElevenLabs client');
          reject(new Error('Failed to load ElevenLabs client'));
        };

        document.head.appendChild(script);
      });
    }

    createWidget() {
      if (!this.agentData.elevenlabs_id) {
        console.error('🤖 No ElevenLabs ID found for agent');
        this.onError?.(new Error('Agent voice not configured'));
        return;
      }

      // Create widget container
      this.widgetElement = document.createElement('div');
      this.widgetElement.id = 'altan-voice-widget';
      this.widgetElement.innerHTML = this.getWidgetHTML();
      
      // Apply positioning styles
      this.applyPositionStyles();
      
      // Add event listeners
      this.setupEventListeners();
      
      // Inject CSS styles
      this.injectStyles();
      
      document.body.appendChild(this.widgetElement);
      console.log('🤖 Widget created with agent ID:', this.agentData.elevenlabs_id);
    }

    getWidgetHTML() {
      const currentLang = LANGUAGES.find(lang => lang.value === this.language) || LANGUAGES[0];
      const buttonText = this.isConnecting ? 'CONNECTING...' : this.isConnected ? 'END CHAT' : 'VOICE CHAT';
      
      // Check if we should use avatar (only if explicitly enabled in metadata)
      const useAvatar = this.agentData.meta_data?.widget?.avatar === true;
      
      return `
        <div class="altan-widget-container">
          <button class="altan-widget-main" id="altan-widget-main">
            <span class="altan-widget-icon">
              ${useAvatar && this.agentData.avatar_url ? 
                `<img src="${this.agentData.avatar_url}" alt="Agent">` :
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>`
              }
            </span>
            <span class="altan-widget-text">${buttonText}</span>
            <span class="altan-widget-language" id="altan-widget-language">${currentLang.icon}</span>
          </button>
          
          <div class="altan-widget-language-menu" id="altan-widget-language-menu">
            ${LANGUAGES.map(lang => `
              <button class="altan-widget-language-option ${lang.value === this.language ? 'active' : ''}" 
                      data-lang="${lang.value}">
                ${lang.icon} ${lang.label}
              </button>
            `).join('')}
          </div>
          
          <div class="altan-widget-branding" id="altan-widget-branding">
            Powered by <img src="https://altan.ai/logos/horizontalBlack.png" alt="Altan" class="altan-widget-logo">
          </div>
        </div>
      `;
    }

    applyPositionStyles() {
      const positions = {
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' },
        'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
        'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' }
      };

      const positionStyle = positions[this.position] || positions['bottom-right'];
      
      Object.assign(this.widgetElement.style, {
        position: 'fixed',
        zIndex: '999999',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...positionStyle
      });
      
      console.log('🤖 Applied position:', this.position, positionStyle);
    }

    setupEventListeners() {
      const mainWidget = this.widgetElement.querySelector('#altan-widget-main');
      const languageFlag = this.widgetElement.querySelector('#altan-widget-language');

      // Main widget click to start/stop conversation
      mainWidget?.addEventListener('click', (e) => {
        if (!e.target.closest('#altan-widget-language')) {
          this.toggleVoiceConversation();
        }
      });

      // Language flag click
      languageFlag?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLanguageMenu();
      });

      // Language options
      this.widgetElement.querySelectorAll('.altan-widget-language-option').forEach(option => {
        option.addEventListener('click', (e) => {
          const lang = e.currentTarget.getAttribute('data-lang');
          this.changeLanguage(lang);
        });
      });

      // Close language menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.widgetElement.contains(e.target)) {
          this.hideLanguageMenu();
        }
      });

      // Branding click to open altan.ai
      const branding = this.widgetElement.querySelector('#altan-widget-branding');
      branding?.addEventListener('click', () => {
        window.open('https://altan.ai/', '_blank');
      });

      console.log('🤖 Event listeners set up');
    }

    toggleLanguageMenu() {
      const menu = this.widgetElement.querySelector('#altan-widget-language-menu');
      this.showLanguageMenu = !this.showLanguageMenu;
      
      if (this.showLanguageMenu) {
        menu.style.display = 'block';
        // Position menu above the widget
        menu.style.bottom = '60px';
        menu.style.right = '0';
      } else {
        menu.style.display = 'none';
      }
    }

    hideLanguageMenu() {
      const menu = this.widgetElement.querySelector('#altan-widget-language-menu');
      this.showLanguageMenu = false;
      menu.style.display = 'none';
    }

    async toggleVoiceConversation() {
      if (this.isConnected) {
        await this.stopConversation();
      } else {
        await this.startConversation();
      }
    }

    async startConversation() {
      if (!this.agentData.elevenlabs_id) {
        console.error('No ElevenLabs ID found for agent');
        this.onError?.(new Error('Agent voice not configured'));
        return;
      }

      if (!this.Conversation) {
        console.error('ElevenLabs Conversation not loaded');
        this.onError?.(new Error('Voice service not available'));
        return;
      }

      try {
        this.isConnecting = true;
        this.updateWidgetText();

        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize ElevenLabs conversation
        this.conversation = await this.Conversation.startSession({
          agentId: this.agentData.elevenlabs_id,
          overrides: {
            agent: {
              language: this.language
            }
          },
          onConnect: () => {
            console.log('🤖 Voice conversation connected');
            this.isConnected = true;
            this.isConnecting = false;
            this.updateWidgetText();
            this.onConnect?.();
          },
          onDisconnect: () => {
            console.log('🤖 Voice conversation disconnected');
            this.isConnected = false;
            this.isConnecting = false;
            this.updateWidgetText();
            this.onDisconnect?.();
          },
          onMessage: (message) => {
            console.log('🤖 Voice message:', message);
            this.onMessage?.(message);
          },
          onError: (error) => {
            console.error('🤖 Voice conversation error:', error);
            this.isConnected = false;
            this.isConnecting = false;
            this.updateWidgetText();
            this.onError?.(error);
          }
        });

      } catch (error) {
        console.error('🤖 Failed to start conversation:', error);
        this.isConnecting = false;
        this.updateWidgetText();
        this.onError?.(error);
      }
    }

    async stopConversation() {
      if (this.conversation) {
        try {
          await this.conversation.endSession();
        } catch (error) {
          console.error('Error stopping conversation:', error);
        }
        this.conversation = null;
      }
    }

    changeLanguage(langValue) {
      this.language = langValue;
      const selectedLang = LANGUAGES.find(lang => lang.value === langValue);
      
      // Update flag display
      const languageFlag = this.widgetElement.querySelector('#altan-widget-language');
      if (languageFlag && selectedLang) {
        languageFlag.textContent = selectedLang.icon;
      }

      // Update active state
      this.widgetElement.querySelectorAll('.altan-widget-language-option').forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-lang') === langValue);
      });

      this.hideLanguageMenu();

      // If conversation is active, restart with new language
      if (this.isConnected) {
        this.stopConversation().then(() => {
          setTimeout(() => this.startConversation(), 500);
        });
      }
    }

    updateWidgetText() {
      const textEl = this.widgetElement.querySelector('.altan-widget-text');
      const mainWidget = this.widgetElement.querySelector('#altan-widget-main');
      const buttonText = this.isConnecting ? 'CONNECTING...' : this.isConnected ? 'END CHAT' : 'VOICE CHAT';
      
      textEl.textContent = buttonText;
      mainWidget.classList.toggle('connecting', this.isConnecting);
      mainWidget.classList.toggle('connected', this.isConnected);
    }

    injectStyles() {
      if (document.getElementById('altan-widget-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'altan-widget-styles';
      styles.textContent = `
        .altan-widget-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
        }

        .altan-widget-main {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 8px 16px;
          height: auto;
          cursor: pointer;
          color: #111827;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .altan-widget-main:hover {
          background: rgba(249, 250, 251, 0.98);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .altan-widget-main:active {
          background: rgba(243, 244, 246, 0.98);
          transform: translateY(0);
        }

        .altan-widget-main.connecting {
          background: rgba(254, 240, 138, 0.95);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .altan-widget-main.connected {
          background: rgba(220, 252, 231, 0.95);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .altan-widget-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          color: #111827;
          flex-shrink: 0;
        }

        .altan-widget-icon img {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          object-fit: cover;
        }

        .altan-widget-text {
          color: #111827;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .altan-widget-language {
          font-size: 16px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 12px;
          transition: background-color 0.2s;
          user-select: none;
          background: rgba(0, 0, 0, 0.08);
          min-width: 24px;
          text-align: center;
        }

        .altan-widget-language:hover {
          background: rgba(0, 0, 0, 0.12);
        }

        .altan-widget-language-menu {
          display: none;
          position: absolute;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(229, 231, 235, 0.8);
          min-width: 150px;
          z-index: 1000;
          overflow: hidden;
        }

        .altan-widget-language-option {
          width: 100%;
          background: none;
          border: none;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #111827;
          transition: background-color 0.2s;
        }

        .altan-widget-language-option:hover {
          background: rgba(243, 244, 246, 0.8);
        }

        .altan-widget-language-option.active {
          background: rgba(229, 231, 235, 0.8);
          font-weight: 600;
        }

        .altan-widget-branding {
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
          margin-top: 6px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          cursor: pointer;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .altan-widget-branding:hover {
          color: #6b7280;
          opacity: 1;
        }

        .altan-widget-logo {
          height: 10px;
          width: auto;
          opacity: 0.6;
        }


      `;
      
      document.head.appendChild(styles);
    }

    // Public API methods
    destroy() {
      this.stopConversation();
      if (this.widgetElement) {
        this.widgetElement.remove();
      }
    }

    setLanguage(language) {
      this.changeLanguage(language);
    }

    setPosition(position) {
      this.position = position;
      if (this.widgetElement) {
        this.applyPositionStyles();
      }
    }
  }

  // Auto-initialize from script tag attributes
  function autoInitialize() {
    const script = document.currentScript || document.querySelector('script[altan-agent-id]');
    if (script) {
      const agentId = script.getAttribute('altan-agent-id') || script.getAttribute('data-altan-agent-id');
      const position = script.getAttribute('position') || script.getAttribute('data-position');
      const language = script.getAttribute('language') || script.getAttribute('data-language');

      if (agentId) {
        console.log('🤖 Auto-initializing AltanVoiceWidget with agent ID:', agentId);
        new AltanVoiceWidget({
          agentId,
          position,
          language
        });
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitialize);
  } else {
    autoInitialize();
  }

  // Export for manual usage
  window.AltanVoiceWidget = AltanVoiceWidget;

})(); 