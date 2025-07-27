/* global console, fetch, window, document, navigator, localStorage */
/**
 * Altan AI Widget
 * Version: 2.2.0
 * Last Updated: 2025-01-26
 * Documentation: https://docs.altan.ai/widget
 * 
 * FEATURES:
 * - Account-scoped guest authentication (2.0.x)
 * - Real user integration via window.altanWidgetUserData (2.1.0)
 * - Updated backend API integration (2.2.0)
 * 
 * USAGE:
 * Set window.altanWidgetUserData before loading widget to use authenticated user data:
 * window.altanWidgetUserData = {
 *   external_id: "user123",
 *   first_name: "John",
 *   last_name: "Doe", 
 *   email: "john@example.com",
 *   avatar_url: "https://..."
 * };
 */
(async function() {
  'use strict';

  // Widget version for debugging and cache management
  const WIDGET_VERSION = '2.2.0';
  console.log(`🤖 Altan Widget v${WIDGET_VERSION} loaded`);

  // Widget configuration
  const WIDGET_CONFIG = {
    API_BASE_URL: 'https://api.altan.ai/platform/guest',
    AGENT_API_BASE_URL: 'https://api.altan.ai/platform/agent',
    AUTH_BASE_URL: 'https://api.altan.ai/auth/login/guest',
    ROOM_BASE_URL: 'https://altan.ai/r'
  };

  const scriptTag = document.currentScript;
  let brand_color = '#000';
  const agentId = scriptTag?.getAttribute('altan-agent-id') || scriptTag?.id;
  const CHAT_BUTTON_SIZE = 50;
  const CHAT_BUTTON_RADIUS = 30;
  let browserLanguage = "en";

  // Agent and Account data
  let agentData = null;
  let accountId = null;

  // Authentication state management
  const authState = {
    guest: null,
    accountId: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  };

  // Token storage keys - now account-scoped instead of agent-scoped
  const getTokenStorageKeys = (accountId) => ({
    ACCESS_TOKEN: `altan_guest_access_${accountId}`,
    REFRESH_TOKEN: `altan_guest_refresh_${accountId}`,
    GUEST_DATA: `altan_guest_data_${accountId}`,
  });

  // Room storage keys - still agent-scoped since we want separate rooms per agent
  const ROOM_STORAGE_KEYS = {
    ROOM_DATA: `altan_room_${agentId}`,
    SESSION_ID: `altan_session_${agentId}`
  };

  // Token management functions
  const storeTokens = (accessToken, refreshToken, guestData, accountId) => {
    try {
      const keys = getTokenStorageKeys(accountId);
      localStorage.setItem(keys.ACCESS_TOKEN, accessToken);
      localStorage.setItem(keys.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(keys.GUEST_DATA, JSON.stringify(guestData));
      console.log('✅ Tokens stored in localStorage for account:', accountId);
    } catch (error) {
      console.warn('⚠️ Failed to store tokens:', error);
    }
  };

  const getStoredTokens = (accountId) => {
    try {
      const keys = getTokenStorageKeys(accountId);
      const accessToken = localStorage.getItem(keys.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(keys.REFRESH_TOKEN);
      const guestData = localStorage.getItem(keys.GUEST_DATA);
      
      return {
        accessToken,
        refreshToken,
        guestData: guestData ? JSON.parse(guestData) : null
      };
    } catch (error) {
      console.warn('⚠️ Failed to retrieve stored tokens:', error);
      return { accessToken: null, refreshToken: null, guestData: null };
    }
  };

  const clearStoredTokens = (accountId) => {
    try {
      const keys = getTokenStorageKeys(accountId);
      localStorage.removeItem(keys.ACCESS_TOKEN);
      localStorage.removeItem(keys.REFRESH_TOKEN);
      localStorage.removeItem(keys.GUEST_DATA);
      console.log('🗑️ Tokens cleared from localStorage for account:', accountId);
    } catch (error) {
      console.warn('⚠️ Failed to clear tokens:', error);
    }
  };

  // Load stored tokens on widget initialization
  const loadStoredTokens = (accountId) => {
    const stored = getStoredTokens(accountId);
    if (stored.accessToken && stored.refreshToken && stored.guestData) {
      authState.accessToken = stored.accessToken;
      authState.refreshToken = stored.refreshToken;
      authState.guest = stored.guestData;
      authState.accountId = accountId;
      authState.isAuthenticated = true;
      console.log('✅ Loaded stored tokens and guest data for account:', accountId);
      return true;
    }
    return false;
  };

  // Get stored room data
  const getStoredRoomData = () => {
    try {
      const stored = localStorage.getItem(ROOM_STORAGE_KEYS.ROOM_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Error reading stored room data:', error);
      return null;
    }
  };

  // Store room data
  const storeRoomData = (roomData) => {
    try {
      localStorage.setItem(ROOM_STORAGE_KEYS.ROOM_DATA, JSON.stringify(roomData));
    } catch (error) {
      console.warn('Error storing room data:', error);
    }
  };



  // Clear stored data (for testing or reset)
  const clearStoredData = () => {
    try {
      localStorage.removeItem(ROOM_STORAGE_KEYS.ROOM_DATA);
      localStorage.removeItem(ROOM_STORAGE_KEYS.SESSION_ID);
      if (accountId) {
        clearStoredTokens(accountId);
      }
    } catch (error) {
      console.warn('Error clearing stored data:', error);
    }
  };

  const CHAT_CLOSE_ICON = () => `
  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="24" height="24">
    <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
  </svg>
  `;

  const CHAT_BUBBLE_PRO = (brand_color) => `
  <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="24" fill="${brand_color}"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M36 35.6967C36 35.8403 35.8548 35.9385 35.7221 35.8837C34.828 35.5145 31.9134 34.3491 28.9961 33.5988H15.8234C14.2638 33.5988 13 32.4254 13 30.9786V15.6195C13 14.1735 14.2638 13 15.8234 13H33.1749C34.7346 13 35.9992 14.1735 35.9992 15.6195L36 35.6967Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1336 21.2332C15.417 21.5924 15.0331 21.7849 15.0014 20.9346C14.9434 19.3815 16.7518 18.0688 19.0404 18.0026C21.3291 17.9364 23.2313 19.1418 23.2893 20.695C23.3234 21.6084 22.4804 21.3555 21.3147 21.0056C20.4984 20.7606 19.5238 20.4681 18.5812 20.4954C17.5455 20.5254 16.7259 20.9362 16.1336 21.2332Z" fill="${brand_color}"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M32.56 21.2904C33.2766 21.6497 33.6605 21.8421 33.6922 20.9919C33.7502 19.4388 31.9418 18.126 29.6532 18.0599C27.3646 17.9937 25.4623 19.1991 25.4043 20.7522C25.3702 21.6657 26.2132 21.4127 27.3789 21.0629C28.1953 20.8179 29.1698 20.5254 30.1124 20.5526C31.1481 20.5826 31.9677 20.9935 32.56 21.2904Z" fill="${brand_color}"/>
  </svg>`;

  function addAnimationStyle() {
    const oldStyle = document.getElementById("chatStyle");
    if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);

    const style = document.createElement("style");
    style.id = "chatStyle";
    style.textContent = `
    .chat-widget {
      transform-origin: bottom right;
    }

    .chat-show-animation {
      animation: chatShow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .chat-hide-animation {
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

    .chat-bubble {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .chat-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .chat-bubble.chat-open {
      background-color: #666 !important;
    }
    `;
    document.head.appendChild(style);
  }

  function updateChatButtonIcon(isOpen) {
    const chatButtonIcon = document.getElementById("chat-bubble-icon");
    if (chatButtonIcon) {
      if (isOpen) {
        chatButtonIcon.innerHTML = CHAT_CLOSE_ICON();
        chatButtonIcon.parentElement.classList.add('chat-open');
      } else {
        chatButtonIcon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
        chatButtonIcon.parentElement.classList.remove('chat-open');
      }
    }
  }

  function createChat() {
    const chat = document.createElement("div");
    chat.setAttribute("id", "chat-bubble-window");
    chat.className = "chat-widget";
    chat.style.position = "fixed";
    chat.style.flexDirection = "column";
    chat.style.justifyContent = "space-between";
    chat.style.bottom = `${CHAT_BUTTON_SIZE + 35}px`; // Position above the bubble
    chat.style.right = "25px";
    chat.style.width = window.innerWidth <= 500 ? "calc(100vw - 20px)" : "450px";
    chat.style.height = window.innerWidth <= 500 ? "calc(100vh - 120px)" : "700px";
    chat.style.maxHeight = "800px";
    chat.style.display = "none";
    chat.style.borderRadius = "16px";
    chat.style.zIndex = "999999998";
    chat.style.overflow = "hidden";
    chat.style.willChange = "opacity, transform";
    chat.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.2)";
    document.body.appendChild(chat);
    return chat;
  }

  function createChatButton() {
    const chatButton = document.createElement("div");
    chatButton.setAttribute("id", "chat-bubble-button");
    chatButton.className = "chat-bubble";
    chatButton.style.position = "fixed";
    chatButton.style.bottom = "25px";
    chatButton.style.right = "25px";
    chatButton.style.width = `${CHAT_BUTTON_SIZE}px`;
    chatButton.style.height = `${CHAT_BUTTON_SIZE}px`;
    chatButton.style.borderRadius = `${CHAT_BUTTON_RADIUS}px`;
    chatButton.style.backgroundColor = brand_color;
    chatButton.style.cursor = "pointer";
    chatButton.style.zIndex = "999999999"; // Always on top
    chatButton.style.border = "none";
    chatButton.style.outline = "none";
    
    return chatButton;
  }

  function createChatButtonIcon() {
    const chatButtonIcon = document.createElement("div");
    chatButtonIcon.setAttribute("id", "chat-bubble-icon");
    chatButtonIcon.style.display = "flex";
    chatButtonIcon.style.alignItems = "center";
    chatButtonIcon.style.justifyContent = "center";
    chatButtonIcon.style.width = "100%";
    chatButtonIcon.style.height = "100%";
    chatButtonIcon.style.transition = "all 0.3s ease";
    return chatButtonIcon;
  }

  // API Functions
  function generateExternalId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async function fetchAgentMetadata() {
    const url = `${WIDGET_CONFIG.AGENT_API_BASE_URL}/${agentId}/public`;
    
    console.log('🔍 Fetching agent metadata from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Agent metadata received:', data);
    
    agentData = data.agent;
    accountId = agentData.account_id;
    
    // Update brand color from agent metadata if available
    const ui = agentData.meta_data?.ui;
    if (ui?.brand_color) {
      brand_color = ui.brand_color;
      
      // Update button color immediately
      const button = document.getElementById("chat-bubble-button");
      if (button) {
        button.style.backgroundColor = brand_color;
      }
      
      // Update icon
      const icon = document.getElementById("chat-bubble-icon");
      if (icon) {
        icon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
      }
      
      console.log('🎨 Brand color set from agent metadata:', brand_color);
    }
    
    console.log('✅ Agent loaded:', {
      agentId: agentData.id,
      accountId: accountId,
      name: agentData.name,
      brandColor: brand_color
    });
    
    return data;
  }

  async function createGuest(guestInfo) {
    const url = `${WIDGET_CONFIG.API_BASE_URL}/`;
    
    const requestData = {
      account_id: accountId,
      external_id: guestInfo.external_id,
      first_name: guestInfo.first_name || 'Anonymous',
      last_name: guestInfo.last_name || 'Visitor',
      email: guestInfo.email,
      phone: guestInfo.phone,
    };

    console.log('👤 Creating guest with data:', requestData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('👤 Guest created:', data.guest);
    return data.guest;
  }

  async function createRoom(guestId, agentId) {
    const url = `${WIDGET_CONFIG.API_BASE_URL}/room`;
    
    const requestData = {
      account_id: accountId,
      guest_id: guestId,
      agent_id: agentId,
    };

    console.log('🏠 Creating room with data:', requestData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🏠 Room created:', data);
    
    // Format room data to match SDK structure
    const roomData = {
      room_id: data.room_id,
      agent: data.agent,
      guest: data.guest,
      account_id: data.account_id,
      url: `${WIDGET_CONFIG.ROOM_BASE_URL}/${data.room_id}`,
    };
    
    return roomData;
  }

  async function getGuestByExternalId(externalId) {
    const url = `${WIDGET_CONFIG.API_BASE_URL}/?external_id=${externalId}&account_id=${accountId}`;
    
    console.log('🔍 Looking for existing guest with external_id:', externalId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('🔍 Guest not found with external_id:', externalId);
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Found existing guest:', data.guest);
    return data.guest;
  }

  async function refreshGuestToken() {
    if (!authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 === REFRESHING GUEST TOKEN ===');
    console.log('🔄 Current accountId:', accountId);
    console.log('🔄 Auth state before refresh:', {
      hasRefreshToken: !!authState.refreshToken,
      hasAccessToken: !!authState.accessToken,
      accountId: authState.accountId,
      guestId: authState.guest?.id
    });
    
    const response = await fetch('https://api.altan.ai/auth/token/guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Referer': window.location.href
      },
      body: JSON.stringify({
        refresh_token: authState.refreshToken,
        jid: false
      })
    });
    
    console.log('🔄 Refresh response status:', response.status);
    
    if (!response.ok) {
      console.log('⚠️ Guest token refresh failed:', response.status);
      console.log('⚠️ Clearing invalid tokens for accountId:', accountId);
      // Clear invalid tokens
      clearStoredTokens(accountId);
      authState.accessToken = null;
      authState.refreshToken = null;
      authState.isAuthenticated = false;
      throw new Error(`Guest token refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔄 Guest token refresh response:', data);
    
    // Handle both direct and nested token formats
    const tokenData = data.token || data;
    const newAccessToken = tokenData.access_token || data.access_token;
    const newRefreshToken = tokenData.refresh_token || data.refresh_token;
    
    if (newAccessToken && accountId) {
      authState.accessToken = newAccessToken;
      
      // Update stored access token
      const keys = getTokenStorageKeys(accountId);
      localStorage.setItem(keys.ACCESS_TOKEN, newAccessToken);
      console.log('✅ Guest access token refreshed and stored for account:', accountId);
    }
    
    if (newRefreshToken && accountId) {
      authState.refreshToken = newRefreshToken;
      const keys = getTokenStorageKeys(accountId);
      localStorage.setItem(keys.REFRESH_TOKEN, newRefreshToken);
      console.log('✅ Guest refresh token updated and stored for account:', accountId);
    }
    
    console.log('🔄 Auth state after refresh:', {
      hasRefreshToken: !!authState.refreshToken,
      hasAccessToken: !!authState.accessToken,
      accountId: authState.accountId,
      isAuthenticated: authState.isAuthenticated
    });
    
    return data;
  }

  async function authenticateGuest(guestId, accountId) {
    const url = `${WIDGET_CONFIG.AUTH_BASE_URL}?guest_id=${guestId}&account_id=${accountId}`;
    
    console.log('🔐 Authenticating guest with API:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Referer': window.location.href
      },
      credentials: 'include' // Include cookies (for backward compatibility)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔐 Guest authentication response:', JSON.stringify(data, null, 2));
    
    // Extract tokens from backend response (handle both direct and nested formats)
    const tokenData = data.token || data;
    const accessToken = tokenData.access_token || data.access_token;
    const refreshToken = tokenData.refresh_token || data.refresh_token;
    const guestData = data.guest;
    
    if (!accessToken || !refreshToken || !guestData) {
      console.error('❌ Missing required data from backend:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasGuestData: !!guestData,
        rawResponse: data
      });
      throw new Error('Backend did not return required tokens or guest data');
    }
    
    // Update auth state
    authState.guest = guestData;
    authState.accountId = accountId;
    authState.accessToken = accessToken;
    authState.refreshToken = refreshToken;
    authState.isAuthenticated = true;
    
    // Store tokens for cross-domain persistence
    storeTokens(accessToken, refreshToken, guestData, accountId);
    
    console.log('✅ Guest authentication successful with tokens');
    console.log('🔐 Final authState:', {
      hasGuest: !!authState.guest,
      hasAccessToken: !!authState.accessToken,
      hasRefreshToken: !!authState.refreshToken,
      crossDomainReady: true
    });
    
    return data;
  }



  // Initialize Widget
  addAnimationStyle();
  const chatButton = createChatButton();
  const chatButtonIcon = createChatButtonIcon();
  chatButtonIcon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
  chatButton.appendChild(chatButtonIcon);

  // Initialize authentication state with stored tokens
  // This function will now be called with the accountId
  // The accountId will be determined by the agent metadata fetch
  // For now, we'll pass a placeholder or assume it will be set later
  // await initializeAuthState(accountId); // This line will be uncommented when accountId is available

  window.addEventListener('resize', addAnimationStyle);

  function onAnimationEnd() {
    const chat = document.getElementById("chat-bubble-window");
    chat.classList.remove("chat-show-animation");
    chat.classList.remove("chat-hide-animation");
    chat.removeEventListener("animationend", onAnimationEnd);

    if (chat.style.display === "none") {
      chat.style.display = "flex";
      chat.classList.add("chat-show-animation");
      updateChatButtonIcon(true);
    } else {
      chat.style.display = "none";
      updateChatButtonIcon(false);
    }
  }

  async function openChat() {
    try {
      console.log('🎯 === OPENING CHAT DEBUG ===');
      console.log('🎯 Current agentId:', agentId);
      console.log('🎯 Current accountId:', accountId);
      console.log('🎯 Current agentData:', agentData);
      console.log('🎯 Current authState:', {
        isAuthenticated: authState.isAuthenticated,
        hasGuest: !!authState.guest,
        hasAccessToken: !!authState.accessToken,
        hasRefreshToken: !!authState.refreshToken,
        accountId: authState.accountId
      });

      // First, fetch agent metadata to get account_id
      if (!agentData || !accountId) {
        console.log('🔍 Fetching agent metadata...');
        await fetchAgentMetadata();
        console.log('🔍 Agent metadata fetched - accountId:', accountId, 'agentId:', agentId);
      }

      // Check if we're switching to a different account - if so, clear auth state
      if (authState.accountId && authState.accountId !== accountId) {
        console.log('⚠️ ACCOUNT SWITCH DETECTED!');
        console.log('⚠️ Previous accountId:', authState.accountId);
        console.log('⚠️ New accountId:', accountId);
        console.log('⚠️ Clearing auth state for account switch...');
        
        // Clear auth state for account switch
        authState.guest = null;
        authState.accountId = null;
        authState.accessToken = null;
        authState.refreshToken = null;
        authState.isAuthenticated = false;
        
        // IMPORTANT: Also clear room data when switching accounts
        // This prevents using room data from a different account
        console.log('⚠️ Clearing room data due to account switch...');
        try {
          localStorage.removeItem(ROOM_STORAGE_KEYS.ROOM_DATA);
          localStorage.removeItem(ROOM_STORAGE_KEYS.SESSION_ID);
          console.log('⚠️ Room data cleared for account switch');
        } catch (error) {
          console.warn('⚠️ Failed to clear room data:', error);
        }
      }

      // Initialize authentication state with the account_id
      const hasStoredTokens = loadStoredTokens(accountId);
      if (hasStoredTokens) {
        console.log('🔄 Using stored guest tokens for account:', accountId);
        console.log('🔄 Loaded guest data:', authState.guest);
      } else {
        console.log('🔄 No stored tokens found for account:', accountId);
      }

      let roomData = getStoredRoomData();
      console.log('🏠 Stored room data for agent:', agentId, roomData);
      
      // Check if we need to create or reuse guest
      if (!authState.isAuthenticated || !authState.guest) {
        console.log('🆕 Creating new guest for account:', accountId);
        console.log('🆕 Auth state not ready - isAuthenticated:', authState.isAuthenticated, 'hasGuest:', !!authState.guest);
        
        // Check for user data passed from parent app
        const userData = window.altanWidgetUserData;
        
        // Step 1: Create or find guest
        let guest;
        const guestPayload = userData ? {
          external_id: userData.external_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone || '',
          avatar_url: userData.avatar_url
        } : {
          external_id: generateExternalId(),
          first_name: 'Anonymous',
          last_name: 'Visitor',
          email: `visitor_${Date.now()}@anonymous.com`,
          phone: ''
        };
        
        console.log('🔑 Guest payload:', userData ? 'Using authenticated user data' : 'Using anonymous visitor data', guestPayload);
        
        // Try to find existing guest by external_id if provided
        if (guestPayload.external_id && userData) {
          try {
            guest = await getGuestByExternalId(guestPayload.external_id);
          } catch (error) {
            console.log('🔍 Guest lookup failed, will create new:', error.message);
          }
        }
        
        // Create guest if not found
        if (!guest) {
          guest = await createGuest(guestPayload);
        }
        
        // Step 2: Create room
        roomData = await createRoom(guest.id, agentId);
        console.log('🏠 Created new room:', roomData);

        // Store the room data for future use
        storeRoomData(roomData);
        console.log('💾 Stored room data for agent:', agentId);
        
        // Step 3: Authenticate the guest
        console.log('🔐 Authenticating guest...', guest.id);
        await authenticateGuest(guest.id, accountId);
        console.log('✅ Guest authentication completed');
      } else {
        console.log('🔄 Have existing authenticated guest:', authState.guest.id);
        // We have a guest but may need a new room for this agent
        if (!roomData) {
          console.log('🏠 No room data found - creating new room for existing guest:', authState.guest.id);
          
          // Create room for existing guest
          roomData = await createRoom(authState.guest.id, agentId);
          console.log('🏠 Created room for existing guest:', roomData);

          storeRoomData(roomData);
          console.log('💾 Stored new room data for agent:', agentId);
        } else {
          console.log('🔄 Reusing existing room:', roomData.room_id, 'for agent:', agentId);
        }
      }

      // Update iframe with room data
      const iframeElement = document.getElementById("widget-agent-bubble-window");
      if (iframeElement) {
        const iframeUrl = `${WIDGET_CONFIG.ROOM_BASE_URL}/${roomData.room_id}`;
        console.log('🖼️ Setting iframe URL:', iframeUrl);
        console.log('🖼️ Room data being used:', {
          room_id: roomData.room_id,
          guest_id: roomData.guest?.id,
          agent_id: agentId,
          account_id: accountId
        });
        
        const previousUrl = iframeElement.src;
        if (previousUrl !== iframeUrl) {
          console.log('🖼️ URL changed from:', previousUrl, 'to:', iframeUrl);
        } else {
          console.log('🖼️ URL unchanged, reusing same room');
        }
        
        // Set a flag to track if we're changing the iframe URL
        const isUrlChange = previousUrl !== iframeUrl;
        if (isUrlChange) {
          console.log('🖼️ URL CHANGE DETECTED - iframe will reload with new auth context');
          console.log('🖼️ Previous URL:', previousUrl);
          console.log('🖼️ New URL:', iframeUrl);
          console.log('🖼️ Current auth tokens available:', {
            hasAccessToken: !!authState.accessToken,
            hasRefreshToken: !!authState.refreshToken,
            guestId: authState.guest?.id,
            accountId: authState.accountId
          });
        }
        
        iframeElement.src = iframeUrl;
        
        // Add error handling for iframe loading
        iframeElement.onload = () => {
          console.log('✅ Iframe loaded successfully:', iframeUrl);
          console.log('✅ Auth state when iframe loaded:', {
            isAuthenticated: authState.isAuthenticated,
            hasAccessToken: !!authState.accessToken,
            hasRefreshToken: !!authState.refreshToken,
            guestId: authState.guest?.id,
            accountId: authState.accountId
          });
        };
        
        iframeElement.onerror = (error) => {
          console.error('❌ Iframe failed to load:', error, iframeUrl);
        };
      } else {
        console.error('❌ Iframe element not found');
      }
      
      console.log('🎯 === CHAT OPENING COMPLETED ===');
    } catch (error) {
      console.error('❌ Error creating room or authenticating guest:', error);
      console.error('❌ Full error details:', {
        message: error.message,
        stack: error.stack,
        agentId: agentId,
        accountId: accountId,
        authState: authState
      });
      
      // If there's an error with stored data, clear it and try again
      if (error.message.includes('404') || error.message.includes('401')) {
        console.log('🗑️ Clearing stored data due to error and retrying...');
        clearStoredData();
        // Don't retry automatically to avoid infinite loops
      }
    }

    onAnimationEnd();
  }

  function closeChat() {
    const chat = document.getElementById("chat-bubble-window");
    chat.classList.add("chat-hide-animation");
    chat.addEventListener("animationend", onAnimationEnd);
  }

  chatButton.addEventListener("click", () => {
    const chat = document.getElementById("chat-bubble-window");
    if (chat.style.display === "none") {
      openChat();
    } else {
      closeChat();
    }
  });

  const chat = createChat();

  function handleChatWindowSizeChange() {
    const windowWidth = window.innerWidth;
    const chatDiv = document.getElementById("chat-bubble-window");
    if (!chatDiv) return;
    
    if (windowWidth <= 600) {
      chatDiv.style.width = "calc(100vw - 20px)";
      chatDiv.style.height = "calc(100vh - 120px)";
      chatDiv.style.bottom = `${CHAT_BUTTON_SIZE + 20}px`;
      chatDiv.style.right = "10px";
      chatDiv.style.left = "10px";
    } else {
      chatDiv.style.width = "450px";
      chatDiv.style.height = "700px";
      chatDiv.style.bottom = `${CHAT_BUTTON_SIZE + 35}px`;
      chatDiv.style.right = "25px";
      chatDiv.style.left = "auto";
    }
  }

  chat.innerHTML = `<iframe
    allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
    id="widget-agent-bubble-window"
    name="Altan-App"
    src=""
    width="100%"
    height="100%"
    frameborder="0"
    style="border-radius: 16px;"
  ></iframe>`;

  document.body.appendChild(chat);
  document.body.appendChild(chatButton);

  // Update chat size whenever the window size changes
  window.addEventListener("resize", handleChatWindowSizeChange);
  handleChatWindowSizeChange();

  // Helper functions for message handling
  const handleTokenRefreshRequest = async (event) => {
    console.log('🔄 === TOKEN REFRESH REQUEST ===');
    console.log('🔄 Requested by iframe from origin:', event.origin);
    console.log('🔄 Current auth state:', {
      isAuthenticated: authState.isAuthenticated,
      hasGuest: !!authState.guest,
      hasAccessToken: !!authState.accessToken,
      hasRefreshToken: !!authState.refreshToken,
      accountId: authState.accountId,
      guestId: authState.guest?.id
    });
    console.log('🔄 Current agentId:', agentId, 'accountId:', accountId);

    try {
      // Validate that we have valid auth for the current account
      const hasValidAuthForAccount = authState.accountId === accountId && 
                                   authState.isAuthenticated && 
                                   authState.accessToken;
      
      console.log('🔄 Valid auth for current account?', hasValidAuthForAccount);
      console.log('🔄 Auth accountId:', authState.accountId, 'Current accountId:', accountId);
      
      if (!hasValidAuthForAccount) {
        console.log('⚠️ No valid auth for current account - sending failure response');
        throw new Error(`No valid authentication for account ${accountId}`);
      }
      
      let accessToken = authState.accessToken;

      // Always try to refresh the token to ensure it's valid and not expired
      if (authState.refreshToken) {
        console.log('🔄 Attempting to refresh guest token...');
        
        try {
          const refreshResult = await refreshGuestToken();
          const tokenData = refreshResult.token || refreshResult;
          accessToken = tokenData.access_token || refreshResult.access_token || authState.accessToken;
          console.log('✅ Got new access token from refresh');
        } catch (refreshError) {
          console.warn('⚠️ Token refresh failed, using existing token:', refreshError);
          // Fall back to existing token if refresh fails
          accessToken = authState.accessToken;
        }
      } else {
        console.warn('⚠️ No refresh token available for refresh attempt');
      }

      // Send response to iframe
      const responseData = {
        type: 'new_access_token',
        token: accessToken,
        guest: authState.guest,
        success: !!accessToken
      };
      
      console.log('📤 Sending token refresh response:', {
        ...responseData,
        token: accessToken ? '[TOKEN_PRESENT]' : null
      });
      event.source.postMessage(responseData, event.origin);
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      const errorResponse = {
        type: 'new_access_token',
        token: null,
        guest: null,
        success: false,
        error: error.message
      };
      
      console.log('📤 Sending error response:', errorResponse);
      event.source.postMessage(errorResponse, event.origin);
    }
  };

  const handleGuestAuthRequest = async (event) => {
    console.log('🔐 === GUEST AUTH REQUEST ===');
    console.log('🔐 Request from origin:', event.origin);
    console.log('🔐 Current state:', {
      isAuthenticated: authState.isAuthenticated,
      hasGuest: !!authState.guest,
      hasAccessToken: !!authState.accessToken,
      hasRefreshToken: !!authState.refreshToken,
      accountId: authState.accountId,
      guestId: authState.guest?.id,
      agentId: agentId
    });
    
    // Check if we have valid auth for the current account
    const hasValidAuth = authState.isAuthenticated && 
                        authState.guest && 
                        authState.accessToken && 
                        authState.accountId === accountId;
    
    console.log('🔐 Has valid auth for current account?', hasValidAuth);
    
    if (hasValidAuth) {
      // Already authenticated for current account, send current auth data
      console.log('✅ Sending authenticated guest data to iframe');
      
      const responseData = {
        type: 'guest_auth_response',
        guest: authState.guest,
        accessToken: authState.accessToken,
        isAuthenticated: true
      };
      console.log('📤 Sending auth response to iframe:', {
        ...responseData,
        accessToken: responseData.accessToken ? '[TOKEN_PRESENT]' : null
      });
      event.source.postMessage(responseData, event.origin);
    } else {
      // Not authenticated or auth is for wrong account
      if (authState.accountId && authState.accountId !== accountId) {
        console.log('⚠️ Auth state is for different account!');
        console.log('⚠️ Auth accountId:', authState.accountId, 'Current accountId:', accountId);
      }
      
      console.log('❌ Sending unauthenticated response to iframe - iframe should trigger fresh auth flow');
      const unauthResponse = {
        type: 'guest_auth_response',
        guest: null,
        accessToken: null,
        isAuthenticated: false
      };
      console.log('📤 Sending unauth response:', unauthResponse);
      event.source.postMessage(unauthResponse, event.origin);
    }
  };

  const handleChatbotMetadata = (data) => {
    const ui = data.meta_data?.meta_data?.ui;
    const newBrandColor = ui?.brand_color || brand_color;
    
    if (newBrandColor !== brand_color) {
      brand_color = newBrandColor;
      
      // Update button color
      const button = document.getElementById("chat-bubble-button");
      if (button) {
        button.style.backgroundColor = brand_color;
      }
      
      // Update icon
      const icon = document.getElementById("chat-bubble-icon");
      if (icon) {
        icon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
      }
      
      console.log('🎨 Brand color updated to:', brand_color);
    }
  };

  // Event listeners and message handling
  const handleEvent = (event) => {
    // Debug: Log all incoming messages
    console.log('📥 === IFRAME MESSAGE ===');
    console.log('📥 Type:', event.data.type);
    console.log('📥 Origin:', event.origin);
    console.log('📥 Full data:', event.data);
    console.log('📥 Current widget state:', {
      agentId: agentId,
      accountId: accountId,
      authState: {
        isAuthenticated: authState.isAuthenticated,
        hasGuest: !!authState.guest,
        hasAccessToken: !!authState.accessToken,
        accountId: authState.accountId
      }
    });
    
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    browserLanguage = navigator.language || navigator.userLanguage;

    switch (event.data.type) {
      case 'close_bubble':
        console.log('🔒 Closing chat bubble');
        closeChat();
        break;

      case 'requestParentUrl':
        console.log('🌐 Parent URL requested');
        const parentResponse = {
          type: 'parentUrl',
          url: window.location.href,
          userAgent,
          width: screenWidth,
          height: screenHeight,
          language: browserLanguage
        };
        console.log('📤 Sending parent URL response:', parentResponse);
        event.source.postMessage(parentResponse, event.origin);
        break;

      case 'refresh_token':
        console.log('🔄 Token refresh request received');
        handleTokenRefreshRequest(event);
        break;

      case 'request_guest_auth':
        console.log('🔐 Guest auth request received');
        handleGuestAuthRequest(event);
        break;

      case 'COPY_TO_CLIPBOARD':
        console.log('📋 Clipboard copy request:', event.data.text);
        navigator.clipboard.writeText(event.data.text);
        break;

      case 'chatbotMetaData':
        console.log('🤖 Chatbot metadata received');
        handleChatbotMetadata(event.data);
        break;
        
      default:
        console.log('❓ Unknown message type received:', event.data.type);
        break;
    }
  };

  window.addEventListener('message', handleEvent);

  // Expose useful functions for debugging
  window.altanWidget = {
    clearStoredData: clearStoredData,
    getStoredRoomData: getStoredRoomData,
    getStoredTokens: (accountId) => getStoredTokens(accountId),
    agentData: () => agentData,
    accountId: () => accountId
  };

})(); 