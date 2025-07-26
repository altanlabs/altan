/**
 * React Components for Altan AI SDK
 * Pre-built components for easy integration
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AltanSDKConfig, GuestData, RoomData, AuthTokens, CreateGuestRequest } from './altan-sdk';
import { useAltan } from './react-hooks';

// Context for sharing SDK instance across components
interface AltanContextValue {
  sdk: ReturnType<typeof useAltan>['sdk'];
  auth: ReturnType<typeof useAltan>['auth'];
  guest: ReturnType<typeof useAltan>['guest'];
  room: ReturnType<typeof useAltan>['room'];
  createSession: ReturnType<typeof useAltan>['createSession'];
  initializeExistingGuest: ReturnType<typeof useAltan>['initializeExistingGuest'];
  joinExistingRoom: ReturnType<typeof useAltan>['joinExistingRoom'];
}

const AltanContext = createContext<AltanContextValue | null>(null);

export function useAltanContext(): AltanContextValue {
  const context = useContext(AltanContext);
  if (!context) {
    throw new Error('useAltanContext must be used within AltanProvider');
  }
  return context;
}

// Provider component
interface AltanProviderProps {
  config: AltanSDKConfig;
  children: React.ReactNode;
}

export function AltanProvider({ config, children }: AltanProviderProps): JSX.Element {
  const altanState = useAltan(config);

  return (
    <AltanContext.Provider value={altanState}>
      {children}
    </AltanContext.Provider>
  );
}

// Chat Widget Component
interface ChatWidgetProps {
  accountId: string;
  agentId: string;
  config?: Partial<AltanSDKConfig>;
  guestInfo?: CreateGuestRequest;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  buttonColor?: string;
  buttonIcon?: React.ReactNode;
  customButton?: React.ComponentType<{ isOpen: boolean; onClick: () => void }>;
  className?: string;
  style?: React.CSSProperties;
  onRoomCreated?: (room: RoomData) => void;
  onAuthSuccess?: (guest: GuestData, tokens: AuthTokens) => void;
  onError?: (error: Error) => void;
}

export function ChatWidget({
  accountId,
  agentId,
  config = {},
  guestInfo,
  position = 'bottom-right',
  buttonColor = '#007bff',
  buttonIcon,
  customButton: CustomButton,
  className,
  style,
  onRoomCreated,
  onAuthSuccess,
  onError,
}: ChatWidgetProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: false,
    ...config,
  };

  const { auth, room, createSession } = useAltan(fullConfig);

  const toggleChat = (): void => setIsOpen(!isOpen);

  // Auto-initialize on first open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      createSession(agentId, guestInfo)
        .then(({ room: createdRoom, tokens, guest }) => {
          setIsInitialized(true);
          onRoomCreated?.(createdRoom);
          onAuthSuccess?.(guest, tokens);
        })
        .catch((error: Error) => {
          onError?.(error);
        });
    }
  }, [isOpen, isInitialized, createSession, agentId, guestInfo, onRoomCreated, onAuthSuccess, onError]);

  // Auto-refresh tokens on auth events
  useEffect(() => {
    if (auth.authenticatedGuest && room.currentRoom && iframeRef.current) {
      const iframe = iframeRef.current;
      const roomWindow = iframe.contentWindow;
      
      if (roomWindow && auth.tokens) {
        roomWindow.postMessage({
          type: 'auth_update',
          accessToken: auth.tokens.accessToken,
          guest: auth.authenticatedGuest,
        }, '*');
      }
    }
  }, [auth.authenticatedGuest, auth.tokens, room.currentRoom]);

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      default:
        return { ...baseStyles, bottom: '20px', right: '20px' };
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div style={{ ...getPositionStyles(), ...style }} className={className}>
        {CustomButton ? (
          <CustomButton isOpen={isOpen} onClick={toggleChat} />
        ) : (
          <button
            onClick={toggleChat}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: buttonColor,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            {buttonIcon || (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: position.includes('bottom') ? '90px' : undefined,
            top: position.includes('top') ? '90px' : undefined,
            right: position.includes('right') ? '20px' : undefined,
            left: position.includes('left') ? '20px' : undefined,
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 999,
            overflow: 'hidden',
          }}
        >
          {isInitialized && room.currentRoom ? (
            <iframe
              ref={iframeRef}
              src={room.currentRoom.url}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '12px',
              }}
              title="Altan Chat"
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                fontSize: '14px',
              }}
            >
              {room.isCreating ? 'Initializing chat...' : 'Loading...'}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Room Component (for embedding in existing layouts)
interface RoomProps {
  accountId: string;
  agentId: string;
  config?: Partial<AltanSDKConfig>;
  guestInfo?: CreateGuestRequest;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onRoomCreated?: (room: RoomData) => void;
  onAuthSuccess?: (guest: GuestData, tokens: AuthTokens) => void;
  onError?: (error: Error) => void;
}

export function Room({
  accountId,
  agentId,
  config = {},
  guestInfo,
  width = '100%',
  height = '100%',
  className,
  style,
  onRoomCreated,
  onAuthSuccess,
  onError,
}: RoomProps): JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<{ guest: GuestData; tokens: AuthTokens } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: false,
    ...config,
  };

  const { auth, room, createSession } = useAltan(fullConfig);

  // Auto-initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      if (fullConfig.debug) {
        console.log('🚀 === SDK INITIALIZATION STARTING ===');
        console.log('🚀 AccountId:', accountId);
        console.log('🚀 AgentId:', agentId);
        console.log('🚀 Config:', fullConfig);
        console.log('🚀 GuestInfo:', guestInfo);
      }
      
      createSession(agentId, guestInfo)
        .then(({ room: createdRoom, tokens, guest }) => {
          if (fullConfig.debug) {
            console.log('🎯 === SDK INITIALIZATION SUCCESS ===');
            console.log('🎯 Created room:', createdRoom);
            console.log('🎯 Auth guest:', guest);
            console.log('🎯 Tokens received:', {
              hasAccessToken: !!tokens.accessToken,
              hasRefreshToken: !!tokens.refreshToken,
              accessToken: tokens.accessToken ? 'Present' : 'Missing',
              refreshToken: tokens.refreshToken ? 'Present' : 'Missing',
              note: 'Will refresh reactively on 401 errors (no expiry time from backend)'
            });
          }
          
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          
          onRoomCreated?.(createdRoom);
          onAuthSuccess?.(guest, tokens);
        })
        .catch((error: Error) => {
          if (fullConfig.debug) {
            console.error('❌ === SDK INITIALIZATION FAILED ===');
            console.error('❌ Error details:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
          }
          onError?.(error);
        });
    }
  }, [isInitialized, createSession, agentId, guestInfo, onRoomCreated, onAuthSuccess, onError, accountId, fullConfig.debug]);

  // Debug: Listen to ALL messages
  useEffect(() => {
    if (!fullConfig.debug) return;

    const handleAllMessages = (event: MessageEvent): void => {
      console.log('🌍 ALL MESSAGES:', {
        type: event.data?.type,
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('message', handleAllMessages);
    return () => window.removeEventListener('message', handleAllMessages);
  }, [fullConfig.debug]);

  // Handle authentication iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const { data } = event;
      
      // Handle the actual message type that the iframe sends
      if (data?.type === 'request_guest_auth' && authData) {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          if (fullConfig.debug) {
            console.log('📡 Received guest auth request from iframe');
            console.log('📡 Sending auth data to iframe:', {
              type: 'guest_auth_response',
              accessToken: authData.tokens.accessToken ? 'Present' : 'Missing',
              refreshToken: authData.tokens.refreshToken ? 'Present' : 'Missing',
              guest: authData.guest,
            });
          }
          
          // Send the response in the format the iframe expects
          iframe.contentWindow.postMessage({
            type: 'guest_auth_response',
            isAuthenticated: true,
            guest: authData.guest,
            accessToken: authData.tokens.accessToken,
          }, '*');
          
          // Also send in the token refresh format
          iframe.contentWindow.postMessage({
            type: 'new_access_token',
            token: authData.tokens.accessToken,
            guest: authData.guest,
            user: null,
            success: true
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authData, fullConfig.debug]);

  return (
    <div 
      className={className} 
      style={{ 
        width, 
        height, 
        position: 'relative',
        overflow: 'hidden',
        ...style 
      }}
    >
      {isInitialized && room.currentRoom ? (
        <iframe
          ref={iframeRef}
          src={room.currentRoom.url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
                     title="Altan Room"
           onLoad={() => {
             if (fullConfig.debug) {
               console.log('🎬 Iframe loaded, room URL:', room.currentRoom?.url);
             }
             
             // Send auth data immediately when iframe loads
             if (authData && iframeRef.current?.contentWindow) {
               setTimeout(() => {
                 if (fullConfig.debug) {
                   console.log('📡 Sending initial auth data to newly loaded iframe');
                 }
                 
                 iframeRef.current?.contentWindow?.postMessage({
                   type: 'guest_auth_response',
                   isAuthenticated: true,
                   guest: authData.guest,
                   accessToken: authData.tokens.accessToken,
                 }, '*');
                 
                 iframeRef.current?.contentWindow?.postMessage({
                   type: 'new_access_token',
                   token: authData.tokens.accessToken,
                   guest: authData.guest,
                   user: null,
                   success: true
                 }, '*');
               }, 100); // Small delay to ensure iframe is ready
             }
           }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {room.isCreating ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>🔄</div>
              <div>Creating room...</div>
            </div>
          ) : auth.isLoading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>🔐</div>
              <div>Authenticating...</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>⏳</div>
              <div>Initializing...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline Chat Component (alias for Room for backward compatibility)
export const InlineChat = Room;

// Auth Status Component (for debugging)
interface AuthStatusProps {
  accountId: string;
  config?: Partial<AltanSDKConfig>;
  className?: string;
  style?: React.CSSProperties;
}

export function AuthStatus({ 
  accountId, 
  config = {}, 
  className, 
  style 
}: AuthStatusProps): JSX.Element {
  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: true,
    ...config,
  };

  const { auth, guest } = useAltan(fullConfig);

  return (
    <div className={className} style={style}>
      <h3>Auth Status</h3>
      <div>
        <strong>Account ID:</strong> {accountId}
      </div>
      <div>
        <strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}
      </div>
      <div>
        <strong>Current Guest:</strong> {guest.currentGuest ? guest.currentGuest.first_name + ' ' + guest.currentGuest.last_name : 'None'}
      </div>
      <div>
        <strong>Loading:</strong> {auth.isLoading ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Tokens:</strong> {auth.tokens ? '✅' : '❌'}
      </div>
      {auth.error && (
        <div>
          <strong>Error:</strong> {auth.error.message}
        </div>
      )}
    </div>
  );
}