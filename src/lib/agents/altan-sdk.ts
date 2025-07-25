/**
 * Altan AI SDK
 * A TypeScript SDK for integrating Altan AI agents and chat rooms
 * 
 * @version 1.0.0
 * @author Altan AI
 */

export interface AltanConfig {
  agentId: string;
  apiBaseUrl?: string;
  authBaseUrl?: string;
  roomBaseUrl?: string;
  enableStorage?: boolean;
  debug?: boolean;
  requestTimeout?: number; // timeout in milliseconds, default 30000 (30s)
}

export interface GuestData {
  id: string;
  external_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  account_id: string;
}

export interface RoomData {
  room_id: string;
  guest: GuestData;
  url: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AltanEventMap {
  'room:created': { room: RoomData };
  'auth:success': { guest: GuestData; tokens: AuthTokens };
  'auth:refresh': { tokens: AuthTokens };
  'auth:error': { error: Error };
  'message:received': { message: ChatMessage };
  'connection:status': { connected: boolean };
  'error': { error: Error };
}

export type AltanEventListener<T extends keyof AltanEventMap> = (
  event: AltanEventMap[T]
) => void;

export class AltanSDK {
  private config: Required<AltanConfig>;
  private authState: {
    guest: GuestData | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
  };
  private eventListeners: Map<keyof AltanEventMap, Set<Function>>;
  private storageKeys: {
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    GUEST_DATA: string;
    ROOM_DATA: string;
  };

  constructor(config: AltanConfig) {
    this.config = {
      apiBaseUrl: 'https://api.altan.ai/platform/guest',
      authBaseUrl: 'https://api.altan.ai/auth/login/guest',
      roomBaseUrl: 'https://altan.ai/r',
      enableStorage: true,
      debug: false,
      requestTimeout: 30000,
      ...config,
    };

    this.authState = {
      guest: null,
      tokens: null,
      isAuthenticated: false,
    };

    this.eventListeners = new Map();
    
    this.storageKeys = {
      ACCESS_TOKEN: `altan_guest_access_${this.config.agentId}`,
      REFRESH_TOKEN: `altan_guest_refresh_${this.config.agentId}`,
      GUEST_DATA: `altan_guest_data_${this.config.agentId}`,
      ROOM_DATA: `altan_room_${this.config.agentId}`,
    };

    this.debug('Altan SDK initialized', this.config);
    this.loadStoredAuth();
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
   * Authentication methods
   */
  async createGuestSession(guestInfo?: Partial<GuestData>): Promise<RoomData> {
    try {
      const guestData = {
        external_id: guestInfo?.external_id || this.generateExternalId(),
        guest_id: guestInfo?.id || '',
        first_name: guestInfo?.first_name || 'Anonymous',
        last_name: guestInfo?.last_name || 'Visitor',
        email: guestInfo?.email || `visitor_${Date.now()}@anonymous.com`,
        phone: guestInfo?.phone || '',
      };

      const response = await this.fetchWithTimeout(
        `${this.config.apiBaseUrl}/room?agent_id=${this.config.agentId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guestData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const roomData: RoomData = await response.json();
      
      // Store room data if storage is enabled
      if (this.config.enableStorage) {
        this.storeData(this.storageKeys.ROOM_DATA, roomData);
        this.storeData(this.storageKeys.GUEST_DATA, roomData.guest);
      }

      this.emit('room:created', { room: roomData });
      return roomData;
    } catch (error) {
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  async authenticateGuest(guestId: string, accountId: string): Promise<AuthTokens> {
    try {
      const url = `${this.config.authBaseUrl}?guest_id=${guestId}&account_id=${accountId}`;
      
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
      
      const tokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
      };

      const guest: GuestData = data.guest;

      // Update auth state
      this.authState = {
        guest,
        tokens,
        isAuthenticated: true,
      };

      // Store tokens if storage is enabled
      if (this.config.enableStorage) {
        this.storeTokens(tokens, guest);
      }

      this.emit('auth:success', { guest, tokens });
      return tokens;
    } catch (error) {
      this.emit('auth:error', { error: error as Error });
      throw error;
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    if (!this.authState.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.fetchWithTimeout('https://api.altan.ai/auth/token/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href,
        },
        body: JSON.stringify({
          refresh_token: this.authState.tokens.refreshToken,
          jid: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || this.authState.tokens.refreshToken,
        expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
      };

      this.authState.tokens = newTokens;

      if (this.config.enableStorage && this.authState.guest) {
        this.storeTokens(newTokens, this.authState.guest);
      }

      this.emit('auth:refresh', { tokens: newTokens });
      return newTokens;
    } catch (error) {
      // Clear invalid tokens
      this.clearAuth();
      this.emit('auth:error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Room management
   */
  async createRoom(guestInfo?: Partial<GuestData>): Promise<{ room: RoomData; tokens: AuthTokens }> {
    const room = await this.createGuestSession(guestInfo);
    const tokens = await this.authenticateGuest(room.guest.id, room.guest.account_id);
    
    return { room, tokens };
  }

  getRoomUrl(roomId: string): string {
    return `${this.config.roomBaseUrl}/${roomId}`;
  }

  /**
   * State management
   */
  getAuthState() {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.tokens?.accessToken;
  }

  getStoredRoom(): RoomData | null {
    if (!this.config.enableStorage) return null;
    return this.getData(this.storageKeys.ROOM_DATA);
  }

  /**
   * Utility methods
   */
  clearAuth(): void {
    this.authState = {
      guest: null,
      tokens: null,
      isAuthenticated: false,
    };

    if (this.config.enableStorage) {
      this.clearStoredData();
    }
  }

  private generateExternalId(): string {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredAuth(): void {
    if (!this.config.enableStorage) return;

    try {
      const accessToken = localStorage.getItem(this.storageKeys.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(this.storageKeys.REFRESH_TOKEN);
      const guestData = this.getData(this.storageKeys.GUEST_DATA);

      if (accessToken && refreshToken && guestData) {
        this.authState = {
          guest: guestData,
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
        };
        this.debug('Loaded stored authentication');
      }
    } catch (error) {
      this.debug('Failed to load stored auth:', error);
    }
  }

  private storeTokens(tokens: AuthTokens, guest: GuestData): void {
    try {
      localStorage.setItem(this.storageKeys.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(this.storageKeys.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(this.storageKeys.GUEST_DATA, JSON.stringify(guest));
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

  private clearStoredData(): void {
    try {
      Object.values(this.storageKeys).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      this.debug('Failed to clear stored data:', error);
    }
  }

  private debug(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Altan SDK]', ...args);
    }
  }

  /**
   * Fetch with timeout support
   */
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

// Factory function for easier usage
export function createAltanSDK(config: AltanConfig): AltanSDK {
  return new AltanSDK(config);
} 