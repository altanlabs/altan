/**
 * Altan AI SDK
 * Account-centric SDK for integrating with the modular Altan backend
 * 
 * @version 2.0.0
 * @author Altan AI
 */

export interface AltanSDKConfig {
  accountId: string; // Primary entity - the tenant
  apiBaseUrl?: string;
  authBaseUrl?: string;
  roomBaseUrl?: string;
  enableStorage?: boolean;
  debug?: boolean;
  requestTimeout?: number;
}

export interface GuestData {
  id: string;
  external_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  account_id: string;
}

export interface CreateGuestRequest {
  external_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface RoomData {
  room_id: string;
  agent?: any;
  guest: GuestData;
  account_id: string;
  url?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface AltanEventMap {
  'guest:created': { guest: GuestData };
  'guest:updated': { guest: GuestData };
  'room:created': { room: RoomData };
  'room:joined': { roomId: string; guestId: string };
  'auth:success': { guest: GuestData; tokens: AuthTokens };
  'auth:refresh': { tokens: AuthTokens };
  'auth:error': { error: Error };
  'error': { error: Error };
}

export type AltanEventListener<T extends keyof AltanEventMap> = (
  event: AltanEventMap[T]
) => void;

export class AltanSDK {
  private config: Required<AltanSDKConfig>;
  private eventListeners: Map<keyof AltanEventMap, Set<Function>>;
  private storageKeys: {
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    GUEST_DATA: string;
  };

  constructor(config: AltanSDKConfig) {
    this.config = {
      apiBaseUrl: 'https://api.altan.ai/platform/guest',
      authBaseUrl: 'https://api.altan.ai/auth/login/guest',
      roomBaseUrl: 'https://altan.ai/r',
      enableStorage: true,
      debug: false,
      requestTimeout: 30000,
      ...config,
    };

    this.eventListeners = new Map();
    
    // Account-scoped storage keys
    this.storageKeys = {
      ACCESS_TOKEN: `altan_guest_access_${this.config.accountId}`,
      REFRESH_TOKEN: `altan_guest_refresh_${this.config.accountId}`,
      GUEST_DATA: `altan_guest_data_${this.config.accountId}`,
    };

    this.debug('Altan SDK initialized', { accountId: this.config.accountId });
  }

  /**
   * Event system
   */
  on<T extends keyof AltanEventMap>(
    event: T,
    listener: AltanEventListener<T>
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off<T extends keyof AltanEventMap>(
    event: T,
    listener: AltanEventListener<T>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit<T extends keyof AltanEventMap>(
    event: T,
    data: AltanEventMap[T]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.debug('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Guest Management
   */
  async createGuest(guestInfo: CreateGuestRequest = {}): Promise<GuestData> {
    try {
      this.debug('Creating guest', { accountId: this.config.accountId, guestInfo });
      
      const requestData = {
        account_id: this.config.accountId,
        external_id: guestInfo.external_id,
        first_name: guestInfo.first_name || 'Anonymous',
        last_name: guestInfo.last_name || 'Visitor',
        email: guestInfo.email,
        phone: guestInfo.phone,
      };

      const response = await this.fetchWithTimeout(`${this.config.apiBaseUrl}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const guest: GuestData = data.guest;

      // Store guest data
      if (this.config.enableStorage) {
        this.storeData(this.storageKeys.GUEST_DATA, guest);
      }

      this.emit('guest:created', { guest });
      this.debug('Guest created successfully', guest);
      
      return guest;
    } catch (error) {
      this.debug('Guest creation failed', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  async updateGuest(guestId: string, updates: Partial<CreateGuestRequest>): Promise<GuestData> {
    try {
      this.debug('Updating guest', { guestId, updates });

      const response = await this.fetchWithTimeout(`${this.config.apiBaseUrl}/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const guest: GuestData = data.guest;

      // Update stored guest data
      if (this.config.enableStorage) {
        this.storeData(this.storageKeys.GUEST_DATA, guest);
      }

      this.emit('guest:updated', { guest });
      this.debug('Guest updated successfully', guest);
      
      return guest;
    } catch (error) {
      this.debug('Guest update failed', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  async getGuestByExternalId(externalId: string): Promise<GuestData> {
    try {
      this.debug('Getting guest by external ID', { externalId });

      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/?external_id=${externalId}&account_id=${this.config.accountId}`
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.guest;
    } catch (error) {
      this.debug('Get guest by external ID failed', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Room Management
   */
  async createRoom(guestId: string, agentId: string): Promise<RoomData> {
    try {
      this.debug('Creating room', { guestId, agentId, accountId: this.config.accountId });

      const requestData = {
        account_id: this.config.accountId,
        guest_id: guestId,
        agent_id: agentId,
      };

      const response = await this.fetchWithTimeout(`${this.config.apiBaseUrl}/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const roomData: RoomData = {
        room_id: data.room_id,
        agent: data.agent,
        guest: data.guest,
        account_id: data.account_id,
        url: this.getRoomUrl(data.room_id),
      };

      this.emit('room:created', { room: roomData });
      this.debug('Room created successfully', roomData);
      
      return roomData;
    } catch (error) {
      this.debug('Room creation failed', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  async joinRoom(roomId: string, guestId: string): Promise<void> {
    try {
      this.debug('Joining room', { roomId, guestId, accountId: this.config.accountId });

      const requestData = {
        account_id: this.config.accountId,
        guest_id: guestId,
      };

      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/room/${roomId}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      this.emit('room:joined', { roomId, guestId });
      this.debug('Successfully joined room', { roomId, guestId });
    } catch (error) {
      this.debug('Join room failed', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  getRoomUrl(roomId: string): string {
    return `${this.config.roomBaseUrl}/${roomId}`;
  }

  /**
   * Authentication
   */
  async authenticateGuest(guestId: string): Promise<AuthTokens> {
    try {
      this.debug('Authenticating guest', { guestId, accountId: this.config.accountId });

      const url = `${this.config.authBaseUrl}?guest_id=${guestId}&account_id=${this.config.accountId}`;
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Extract tokens from response
      const tokenData = data.token || data;
      const tokens: AuthTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        ...(tokenData.expires_at && { expiresAt: new Date(tokenData.expires_at).getTime() }),
      };

      const guest: GuestData = data.guest;

      // Store tokens
      if (this.config.enableStorage) {
        this.storeTokens(tokens, guest);
      }

      this.emit('auth:success', { guest, tokens });
      this.debug('Guest authentication successful', { hasTokens: !!tokens.accessToken });
      
      return tokens;
    } catch (error) {
      this.debug('Guest authentication failed', error);
      this.emit('auth:error', { error: error as Error });
      throw error;
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    const storedRefreshToken = this.getStoredRefreshToken();
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      this.debug('Refreshing tokens');
      
      const response = await this.fetchWithTimeout('https://api.altan.ai/auth/token/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href,
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken,
          jid: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data.token || data;
      
      const newTokens: AuthTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || storedRefreshToken,
        ...(tokenData.expires_at && { expiresAt: new Date(tokenData.expires_at).getTime() }),
      };

      // Update stored tokens
      if (this.config.enableStorage) {
        localStorage.setItem(this.storageKeys.ACCESS_TOKEN, newTokens.accessToken);
        if (newTokens.refreshToken) {
          localStorage.setItem(this.storageKeys.REFRESH_TOKEN, newTokens.refreshToken);
        }
      }

      this.emit('auth:refresh', { tokens: newTokens });
      this.debug('Token refresh successful');
      
      return newTokens;
    } catch (error) {
      this.debug('Token refresh failed', error);
      this.clearAuth();
      this.emit('auth:error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Convenience Methods
   */
  async createSession(agentId: string, guestInfo: CreateGuestRequest = {}): Promise<{
    guest: GuestData;
    room: RoomData;
    tokens: AuthTokens;
  }> {
    try {
      this.debug('Creating complete session', { agentId, guestInfo });

      // 1. Create or get guest
      let guest: GuestData;
      if (guestInfo.external_id) {
        try {
          guest = await this.getGuestByExternalId(guestInfo.external_id);
          this.debug('Found existing guest', guest);
        } catch {
          guest = await this.createGuest(guestInfo);
          this.debug('Created new guest', guest);
        }
      } else {
        guest = await this.createGuest(guestInfo);
      }

      // 2. Create room
      const room = await this.createRoom(guest.id, agentId);

      // 3. Authenticate guest
      const tokens = await this.authenticateGuest(guest.id);

      this.debug('Session created successfully', {
        guestId: guest.id,
        roomId: room.room_id,
        hasTokens: !!tokens.accessToken,
      });

      return { guest, room, tokens };
    } catch (error) {
      this.debug('Session creation failed', error);
      throw error;
    }
  }

  /**
   * Storage Management
   */
  getStoredGuest(): GuestData | null {
    if (!this.config.enableStorage) return null;
    return this.getData(this.storageKeys.GUEST_DATA);
  }

  getStoredTokens(): { accessToken: string; refreshToken: string } | null {
    if (!this.config.enableStorage) return null;
    
    const accessToken = localStorage.getItem(this.storageKeys.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(this.storageKeys.REFRESH_TOKEN);
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (!this.config.enableStorage) return null;
    return localStorage.getItem(this.storageKeys.REFRESH_TOKEN);
  }

  clearAuth(): void {
    if (this.config.enableStorage) {
      Object.values(this.storageKeys).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
    this.debug('Authentication cleared');
  }

  /**
   * Utility Methods
   */
  private storeTokens(tokens: AuthTokens, guest: GuestData): void {
    try {
      if (tokens.accessToken) {
        localStorage.setItem(this.storageKeys.ACCESS_TOKEN, tokens.accessToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem(this.storageKeys.REFRESH_TOKEN, tokens.refreshToken);
      }
      localStorage.setItem(this.storageKeys.GUEST_DATA, JSON.stringify(guest));
      this.debug('Tokens stored successfully');
    } catch (error) {
      this.debug('Failed to store tokens:', error);
    }
  }

  private storeData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      this.debug('Failed to store data:', error);
    }
  }

  private getData<T = any>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      this.debug('Failed to get stored data:', error);
      return null;
    }
  }

  private debug(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Altan SDK]', ...args);
    }
  }

  private async fetchWithTimeout(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.requestTimeout}ms`);
      }
      throw error;
    }
  }
}

// Factory function
export function createAltanSDK(config: AltanSDKConfig): AltanSDK {
  return new AltanSDK(config);
} 