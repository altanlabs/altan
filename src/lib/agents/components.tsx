/**
 * React Components for Altan AI SDK
 * Pre-built components for easy integration
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

import { AltanConfig, GuestData, RoomData, AuthTokens } from './altan-sdk';
import { useAltan } from './react-hooks';

// Context for sharing SDK instance across components
interface AltanContextValue {
  sdk: ReturnType<typeof useAltan>['sdk'];
  auth: ReturnType<typeof useAltan>['auth'];
  room: ReturnType<typeof useAltan>['room'];
  isConnected: boolean;
  initialize: (guestInfo?: Partial<GuestData>) => Promise<{ room: RoomData; tokens: AuthTokens }>;
}

const AltanContext = createContext<AltanContextValue | null>(null);

export function useAltanContext() {
  const context = useContext(AltanContext);
  if (!context) {
    throw new Error('useAltanContext must be used within AltanProvider');
  }
  return context;
}

// Provider component
interface AltanProviderProps {
  config: AltanConfig;
  children: React.ReactNode;
}

export function AltanProvider({ config, children }: AltanProviderProps) {
  const altanState = useAltan(config);

  return (
    <AltanContext.Provider value={altanState}>
      {children}
    </AltanContext.Provider>
  );
}

// Chat Widget Component
interface ChatWidgetProps {
  agentId: string;
  config?: Partial<AltanConfig>;
  guestInfo?: Partial<GuestData>;
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
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fullConfig: AltanConfig = {
    agentId,
    debug: false,
    ...config,
  };

  const { auth, room, initialize } = useAltan(fullConfig);

  const toggleChat = () => setIsOpen(!isOpen);

  // Auto-initialize on first open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initialize(guestInfo)
        .then(({ room: createdRoom, tokens }) => {
          setIsInitialized(true);
          onRoomCreated?.(createdRoom);
          onAuthSuccess?.(auth.guest!, tokens);
        })
        .catch((error) => {
          onError?.(error);
        });
    }
  }, [isOpen, isInitialized, initialize, guestInfo, onRoomCreated, onAuthSuccess, onError, auth.guest]);

  // Position styles
  const getPositionStyles = () => {
    const base = { position: 'fixed', zIndex: 1000 } as const;
    switch (position) {
      case 'bottom-left':
        return { ...base, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...base, bottom: '20px', right: '20px' };
      case 'top-left':
        return { ...base, top: '20px', left: '20px' };
      case 'top-right':
        return { ...base, top: '20px', right: '20px' };
      default:
        return { ...base, bottom: '20px', right: '20px' };
    }
  };

  // Button styles
  const buttonStyles: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: buttonColor,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    transition: 'all 0.3s ease',
  };

  // Chat window positioning
  const chatPosition = (() => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 999,
      width: '400px',
      height: '600px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      transform: isOpen ? 'scale(1)' : 'scale(0)',
      opacity: isOpen ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      pointerEvents: isOpen ? 'auto' : 'none',
      transformOrigin: 'bottom right',
    };

    const positionStyles = getPositionStyles();
    
    if (positionStyles.bottom) {
      return { ...baseStyle, bottom: `${parseInt(positionStyles.bottom) + 70}px`, right: positionStyles.right };
    } else if (positionStyles.top) {
      return { ...baseStyle, top: `${parseInt(positionStyles.top) + 70}px`, right: positionStyles.right };
    }
    
    return { ...baseStyle, bottom: '90px', right: '20px' };
  })();

  const chatWindowStyles: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #e1e5e9',
  };

  // Default button icon
  const defaultButtonIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  );

  return (
    <>
      {/* Chat Button */}
      {CustomButton ? (
        <div style={getPositionStyles()}>
          <CustomButton isOpen={isOpen} onClick={toggleChat} />
        </div>
      ) : (
        <button
          style={{ ...getPositionStyles(), ...buttonStyles }}
          onClick={toggleChat}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {buttonIcon || defaultButtonIcon}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ ...chatWindowStyles, ...chatPosition }}>
          {room.currentRoom ? (
            <iframe
              ref={iframeRef}
              src={room.getRoomUrl() || ''}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="clipboard-write; microphone; camera"
              style={{ borderRadius: '16px' }}
              title="Altan AI Chat"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
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
  agentId: string;
  config?: Partial<AltanConfig>;
  guestInfo?: Partial<GuestData>;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onRoomCreated?: (room: RoomData) => void;
  onAuthSuccess?: (guest: GuestData, tokens: AuthTokens) => void;
  onError?: (error: Error) => void;
}

export function Room({
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
}: RoomProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<{ guest: GuestData; tokens: AuthTokens } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fullConfig: AltanConfig = {
    agentId,
    debug: false,
    ...config,
  };

  const { auth, room, initialize } = useAltan(fullConfig);

  // Auto-initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize(guestInfo)
        .then(({ room: createdRoom, tokens }) => {
          setIsInitialized(true);
          setAuthData({ guest: auth.guest!, tokens });
          
          if (fullConfig.debug) {
            console.log('🎯 Initial tokens received:', {
              hasAccessToken: !!tokens.accessToken,
              hasRefreshToken: !!tokens.refreshToken,
              note: 'Will refresh reactively on 401 errors (no expiry time from backend)'
            });
          }
          
          onRoomCreated?.(createdRoom);
          onAuthSuccess?.(auth.guest!, tokens);
        })
        .catch((error) => {
          if (fullConfig.debug) {
            console.error('❌ Failed to initialize:', error);
          }
          onError?.(error);
        });
    }
  }, [isInitialized, initialize, guestInfo, onRoomCreated, onAuthSuccess, onError, auth.guest, fullConfig.debug]);

  // Debug: Listen to ALL messages
  useEffect(() => {
    if (!fullConfig.debug) return;

    const handleAllMessages = (event: MessageEvent) => {
      console.log('🌍 ALL MESSAGES:', {
        type: event.data?.type,
        origin: event.origin,
        source: event.source === window ? 'window' : event.source === iframeRef.current?.contentWindow ? 'our-iframe' : 'other',
        data: event.data
      });
    };

    console.log('🔧 Setting up global message listener for debugging');
    window.addEventListener('message', handleAllMessages);
    return () => {
      console.log('🧹 Removing global message listener');
      window.removeEventListener('message', handleAllMessages);
    };
  }, [fullConfig.debug]);

  // Handle authentication requests from iframe
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      // Handle ALL auth-related messages regardless of origin
      if (event.data?.type && (
        event.data.type === 'request_guest_auth' || 
        event.data.type === 'refresh_token' || 
        event.data.type === 'auth_401_error'
      )) {
        
        if (fullConfig.debug) {
          console.log('🎯 Handling auth message:', {
            type: event.data?.type,
            origin: event.origin,
            data: event.data
          });
        }

        const { data } = event;

        if (data.type === 'request_guest_auth') {
          if (fullConfig.debug) {
            console.log('📨 Received guest auth request from iframe');
          }

          if (authData) {
            // Send new format (for our SDK)
            const guestAuthResponse = {
              type: 'guest_auth_response',
              isAuthenticated: true,
              guest: authData.guest,
              accessToken: authData.tokens.accessToken,
            };

            // Also send in the format the interceptor expects
            const tokenResponse = {
              type: 'new_access_token',
              token: authData.tokens.accessToken,
              guest: authData.guest,
              user: null, // Explicitly null for guest mode
              success: true
            };

            if (fullConfig.debug) {
              console.log('📤 Sending initial guest auth response to iframe (both formats):', {
                guestAuth: guestAuthResponse,
                tokenRefresh: tokenResponse
              });
            }

            // Send to specific iframe if available, otherwise broadcast
            const target = iframeRef.current?.contentWindow || event.source;
            if (target) {
              (target as Window).postMessage(guestAuthResponse, '*');
              (target as Window).postMessage(tokenResponse, '*');
            }
          } else {
            // Send failure response
            const failureResponse = {
              type: 'guest_auth_response',
              isAuthenticated: false,
              error: 'Guest authentication not available',
            };
            
            const tokenFailureResponse = {
              type: 'new_access_token',
              token: null,
              guest: null,
              user: null,
              success: false,
              error: 'Guest authentication not available'
            };

            const target = iframeRef.current?.contentWindow || event.source;
            if (target) {
              (target as Window).postMessage(failureResponse, '*');
              (target as Window).postMessage(tokenFailureResponse, '*');
            }
          }
        } else if (data.type === 'auth_401_error' || data.type === 'refresh_token') {
          // Handle 401 errors from iframe by refreshing tokens
          if (fullConfig.debug) {
            console.log(`🚨 Received ${data.type} from iframe, refreshing tokens...`);
          }
          refreshTokens();
        }
      }
    };

    if (fullConfig.debug) {
      console.log('🔧 Setting up iframe message listener');
    }

    window.addEventListener('message', handleIframeMessage);
    return () => {
      if (fullConfig.debug) {
        console.log('🧹 Removing iframe message listener');
      }
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [authData, fullConfig.debug]);

  // Handle 401-based token refresh (reactive approach)
  useEffect(() => {
    if (!authData?.tokens) {
      if (fullConfig.debug) {
        console.log('⚠️ No auth data available for token refresh');
      }
      return;
    }

    if (fullConfig.debug) {
      console.log('🔧 Set up reactive token refresh (will refresh on 401 errors)');
    }
  }, [authData?.tokens, fullConfig.debug]);

  const refreshTokens = async () => {
    if (!authData) {
      if (fullConfig.debug) {
        console.error('❌ Cannot refresh tokens: no auth data available');
      }
      return;
    }

    try {
      if (fullConfig.debug) {
        console.log('🔄 Starting token refresh process...');
        console.log('Current auth state:', {
          hasRefreshToken: !!authData.tokens.refreshToken,
          hasAccessToken: !!authData.tokens.accessToken,
          tokenExpiresAt: authData.tokens.expiresAt
        });
      }

      await auth.refreshTokens();
      
      // Get the updated tokens from auth state
      if (auth.tokens) {
        const updatedAuthData = {
          guest: authData.guest,
          tokens: auth.tokens,
        };

        setAuthData(updatedAuthData);

        // Send updated tokens to iframe (support both message formats)
        if (iframeRef.current?.contentWindow) {
          // Send new format (for our SDK)
          const guestAuthResponse = {
            type: 'guest_auth_response',
            isAuthenticated: true,
            guest: updatedAuthData.guest,
            accessToken: auth.tokens.accessToken,
          };

          // Send legacy format (for existing widget compatibility) - matching expected format
          const tokenResponse = {
            type: 'new_access_token',
            token: auth.tokens.accessToken,
            guest: updatedAuthData.guest,
            user: null, // Explicitly null for guest mode
            success: true
          };

          if (fullConfig.debug) {
            console.log('📤 Sending refreshed auth tokens to iframe (both formats):', {
              guestAuth: guestAuthResponse,
              tokenRefresh: tokenResponse
            });
          }

          iframeRef.current.contentWindow.postMessage(guestAuthResponse, '*');
          iframeRef.current.contentWindow.postMessage(tokenResponse, '*');
        }

        if (fullConfig.debug) {
          console.log('✅ Token refresh completed successfully');
          console.log('New token details:', {
            hasNewAccessToken: !!auth.tokens.accessToken,
            hasNewRefreshToken: !!auth.tokens.refreshToken,
            newExpiresAt: auth.tokens.expiresAt
          });
        }
      } else {
        if (fullConfig.debug) {
          console.error('❌ Token refresh completed but no new tokens available');
        }
      }
    } catch (error) {
      if (fullConfig.debug) {
        console.error('❌ Token refresh failed with error:', error);
      }
      onError?.(error as Error);
    }
  };

  // Expose manual refresh function for debugging
  useEffect(() => {
    if (fullConfig.debug && authData) {
      (window as any).manualRefreshTokens = () => {
        console.log('🚀 Manual token refresh triggered');
        refreshTokens();
      };
      console.log('🔧 Debug mode: Run `manualRefreshTokens()` in console to test token refresh');
    }
    
    return () => {
      if (fullConfig.debug) {
        delete (window as any).manualRefreshTokens;
      }
    };
  }, [fullConfig.debug, authData]);

  // Update iframe URL when room is available and send activation message
  useEffect(() => {
    if (iframeRef.current && room.currentRoom) {
      iframeRef.current.src = room.getRoomUrl() || '';
      
      // Send activation message to iframe after it loads
      const handleIframeLoad = () => {
        if (iframeRef.current?.contentWindow) {
          if (fullConfig.debug) {
            console.log('🚀 Iframe loaded, sending initialization messages...');
          }

          // Send activation message
          iframeRef.current.contentWindow.postMessage({
            type: 'activate_interface_parenthood'
          }, '*');
          
          // Send guest mode initialization to prevent user profile fetching
          if (authData) {
            // Send multiple formats to ensure compatibility
            const messages = [
              {
                type: 'init_guest_mode',
                guest: authData.guest,
                accessToken: authData.tokens.accessToken,
              },
              {
                type: 'guest_auth_response',
                isAuthenticated: true,
                guest: authData.guest,
                accessToken: authData.tokens.accessToken,
              },
              {
                type: 'new_access_token',
                token: authData.tokens.accessToken,
                guest: authData.guest,
                user: null,
                success: true
              }
            ];

            messages.forEach((msg, idx) => {
              setTimeout(() => {
                iframeRef.current?.contentWindow?.postMessage(msg, '*');
                if (fullConfig.debug) {
                  console.log(`📤 Sent message ${idx + 1}/${messages.length}:`, msg);
                }
              }, idx * 100); // Stagger messages
            });
          }
          
          if (fullConfig.debug) {
            console.log('✅ All initialization messages sent to iframe');
          }
        }
      };

      iframeRef.current.addEventListener('load', handleIframeLoad);
      return () => iframeRef.current?.removeEventListener('load', handleIframeLoad);
    }
  }, [room.currentRoom, room, fullConfig.debug, authData]);

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: '8px',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {room.currentRoom ? (
        <iframe
          ref={iframeRef}
          src={room.getRoomUrl() || ''}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="clipboard-write; microphone; camera"
          title="Altan AI Chat"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#666',
            fontSize: '14px',
          }}
        >
          {room.isCreating ? 'Initializing chat...' : 'Loading...'}
        </div>
      )}
    </div>
  );
}

// Auth Status Component
interface AuthStatusProps {
  className?: string;
  style?: React.CSSProperties;
}

export function AuthStatus({ className, style }: AuthStatusProps) {
  const { auth } = useAltanContext();

  const statusStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: auth.isAuthenticated ? '#e8f5e8' : '#ffeaa7',
    color: auth.isAuthenticated ? '#2d7d2d' : '#d63031',
    ...style,
  };

  return (
    <div className={className} style={statusStyle}>
      {auth.isAuthenticated
        ? `Authenticated as ${auth.guest?.first_name} ${auth.guest?.last_name}`
        : 'Not authenticated'}
    </div>
  );
}

// Backward compatibility alias
export const InlineChat = Room;