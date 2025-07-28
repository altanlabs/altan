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

export function AltanProvider({ config, children }: AltanProviderProps): React.JSX.Element {
  const altanState = useAltan(config);

  return <AltanContext.Provider value={altanState}>{children}</AltanContext.Provider>;
}

interface BaseRoomProps {
  /** Your Altan account ID */
  accountId: string;
  /** SDK configuration (optional - defaults work for most cases) */
  config?: Partial<AltanSDKConfig>;
  /** Guest information (name, email, external_id for returning users) */
  guestInfo?: CreateGuestRequest;
  /** Component width (default: 100%) */
  width?: number | string;
  /** Component height (default: 100%) */
  height?: number | string;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Called when guest is authenticated successfully */
  onAuthSuccess?: (guest: GuestData, tokens: AuthTokens) => void;
  /** Called on any error */
  onError?: (error: Error) => void;
}

interface AgentModeProps extends BaseRoomProps {
  /** Agent mode: finds existing DM with agent or creates new one */
  mode: 'agent';
  /** ID of the agent to chat with */
  agentId: string;
  /** Called when conversation is ready (DM found/created) */
  onConversationReady?: (room: RoomData) => void;
}

interface RoomModeProps extends BaseRoomProps {
  /** Room mode: joins an existing room by ID */
  mode: 'room';
  /** ID of the room to join */
  roomId: string;
  /** Called when successfully joined the room */
  onRoomJoined?: (guest: GuestData, tokens: AuthTokens) => void;
}

interface CompactModeProps extends BaseRoomProps {
  /** Compact mode: floating text field with instant room opening */
  mode: 'compact';
  agentId?: string;
  roomId?: string;
  placeholder?: string;
  onConversationReady?: (room: RoomData) => void;
  onRoomJoined?: (guest: GuestData, tokens: AuthTokens) => void;
}

type RoomProps = AgentModeProps | RoomModeProps | CompactModeProps;

export function Room(props: RoomProps): React.JSX.Element {
  const {
    accountId,
    config = {},
    guestInfo,
    width = '100%',
    height = '100%',
    className,
    style,
    onAuthSuccess,
    onError,
  } = props;

  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<{ guest: GuestData; tokens: AuthTokens } | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(props.mode !== 'compact');
  const [message, setMessage] = useState('');
  const [isPreloading, setIsPreloading] = useState(props.mode === 'compact');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initAttemptedRef = useRef(false);

  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: false,
    ...config,
  };

  const { auth, createSession, joinExistingRoom } = useAltan(fullConfig);

  // Background pre-loading: ALWAYS start immediately (even in compact mode)
  useEffect(() => {
    // CRITICAL: Prevent infinite loops with multiple safeguards
    if (isInitialized || hasError || initAttemptedRef.current) {
      return;
    }

    initAttemptedRef.current = true;

    // Detect if this is running in widget or SDK context
    const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';
    console.log(`🏗️ [${context}] Room component initializing...`);
    console.log(`🏗️ [${context}] Props:`, {
      mode: props.mode,
      accountId: props.accountId,
      agentId: props.mode === 'agent' || (props.mode === 'compact' && props.agentId) ? props.agentId : undefined,
      roomId: props.mode === 'room' || (props.mode === 'compact' && props.roomId) ? props.roomId : undefined,
      guestInfo: props.guestInfo
    });

    // For compact mode, show loading indicator while preloading
    if (props.mode === 'compact') {
      console.log(`🚀 [${context}] Starting background pre-loading for compact mode...`);
    }

    if (props.mode === 'agent' || (props.mode === 'compact' && props.agentId)) {
      // Agent mode: find/create DM with agent
      const agentId = props.mode === 'agent' ? props.agentId : props.agentId!;
      const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';
      console.log(`🤖 [${context}] Creating agent session for:`, agentId);
      
      createSession(agentId, guestInfo)
        .then(({ room: createdRoom, tokens, guest }) => {
          console.log(`✅ [${context}] Agent session created successfully`);
          console.log(`🔐 [${context}] Access token:`, tokens.accessToken ? 'Present' : 'Missing');
          console.log(`🏠 [${context}] Room URL:`, createdRoom.url);
          console.log(`👤 [${context}] Guest ID:`, guest.id);
          
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(createdRoom.url || null);
          setIsPreloading(false); // Pre-loading complete
          if (props.mode === 'agent') {
            props.onConversationReady?.(createdRoom);
          } else if (props.mode === 'compact') {
            props.onConversationReady?.(createdRoom);
          }
          onAuthSuccess?.(guest, tokens);
          console.log('✅ Background pre-loading complete!');
        })
        .catch((error: Error) => {
          console.error('❌ Agent session failed:', error);
          console.error('❌ SDK: Full error details:', error.message, error.stack);
          setHasError(true);
          setIsInitialized(true); // Prevent re-runs
          setIsPreloading(false);
          onError?.(error);
        });
    } else if (props.mode === 'room' || (props.mode === 'compact' && props.roomId)) {
      // Room mode: join existing room
      const roomId = props.mode === 'room' ? props.roomId : props.roomId!;
      console.log('🏠 SDK: Joining existing room:', roomId);
      
      joinExistingRoom(roomId, guestInfo)
        .then(({ guest, tokens, roomUrl: url }) => {
          console.log('✅ SDK: Room joined successfully');
          console.log('🔐 SDK: Access token:', tokens.accessToken ? 'Present' : 'Missing');
          console.log('🏠 SDK: Room URL:', url);
          console.log('👤 SDK: Guest ID:', guest.id);
          
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(url);
          setIsPreloading(false); // Pre-loading complete
          if (props.mode === 'room') {
            props.onRoomJoined?.(guest, tokens);
          } else if (props.mode === 'compact') {
            props.onRoomJoined?.(guest, tokens);
          }
          onAuthSuccess?.(guest, tokens);
          console.log('✅ Background pre-loading complete!');
        })
        .catch((error: Error) => {
          console.error('❌ Room join failed:', error);
          console.error('❌ SDK: Full error details:', error.message, error.stack);
          setHasError(true);
          setIsInitialized(true); // Prevent re-runs
          setIsPreloading(false);
          onError?.(error);
        });
    } else {
      console.error('❌ Unknown mode or missing required props:', (props as any).mode);
      setHasError(true);
      setIsInitialized(true); // Prevent re-runs
      setIsPreloading(false);
      onError?.(new Error(`Unknown mode or missing required props: ${(props as any).mode}`));
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle authentication iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const { data } = event;
      const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';

      // Handle guest auth requests
      if (data?.type === 'request_guest_auth' && authData) {
        console.log(`🔄 [${context}] Iframe requesting guest authentication...`);
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'guest_auth_response',
              isAuthenticated: true,
              guest: authData.guest,
              accessToken: authData.tokens.accessToken,
            },
            '*',
          );

          iframe.contentWindow.postMessage(
            {
              type: 'new_access_token',
              token: authData.tokens.accessToken,
              guest: authData.guest,
              user: null,
              success: true,
            },
            '*',
          );
          
          console.log(`✅ [${context}] Responded to auth request`);
        }
      }

      // Handle token refresh requests
      if (data?.type === 'token_refresh_request' && authData) {
        console.log(`🔄 [${context}] Iframe requesting token refresh...`);
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'new_access_token',
              token: authData.tokens.accessToken,
              guest: authData.guest,
              user: null,
              success: true,
            },
            '*',
          );
          
          console.log(`✅ [${context}] Token refresh sent`);
        }
      }

      // Handle WebSocket connection status
      if (data?.type === 'websocket_status') {
        console.log(`🌐 [${context}] WebSocket status:`, data.status, data.error || '');
      }

      // Handle authentication errors
      if (data?.type === 'auth_error') {
        console.error(`❌ [${context}] Authentication error from iframe:`, data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authData]);

  // Compact mode rendering
  if (props.mode === 'compact') {
    return (
      <>
        {/* Text field overlay (always visible when closed) */}
        {!isOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '24px',
              padding: '12px 20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'text',
              minWidth: '320px',
              maxWidth: 'calc(100vw - 40px)',
              transition: 'all 0.2s ease',
            }}
          >
                         <input
               type="text"
               placeholder={props.placeholder || 'Type a message...'}
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onClick={() => setIsOpen(true)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   setIsOpen(true);
                 }
               }}
               style={{
                 border: 'none',
                 outline: 'none',
                 background: 'transparent',
                 flex: 1,
                 fontSize: '14px',
                 fontFamily: 'system-ui, -apple-system, sans-serif',
                 color: '#333',
                 cursor: 'pointer',
               }}
             />

            <div
              style={{
                marginLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Show subtle loading indicator while preloading */}
              {isPreloading && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    opacity: 0.6,
                    animation: 'altanPulse 1.5s ease-in-out infinite',
                  }}
                />
              )}

              {/* Simple expand button */}
              <button
                onClick={() => setIsOpen(true)}
                title="Open chat"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
                  )}

        {/* Pre-loaded room container (always pre-loading, only visible when open) */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: `translateX(-50%) ${isOpen ? 'scale(1)' : 'scale(0)'}`,
            width: 'min(450px, calc(100vw - 40px))',
            height: 'min(600px, calc(100vh - 100px))',
            borderRadius: '12px',
            backgroundColor: 'white',
            transformOrigin: 'bottom center',
            opacity: isOpen ? 1 : 0,
            boxShadow: isOpen ? '0 10px 40px rgba(0, 0, 0, 0.2)' : '0 10px 40px rgba(0, 0, 0, 0)',
            transition: isOpen 
              ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out, box-shadow 0.3s ease-out'
              : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease-in, box-shadow 0.2s ease-in',
            overflow: 'hidden',
            pointerEvents: isOpen ? 'auto' : 'none',
            zIndex: 1000,
          }}
        >
           {/* Close button when expanded */}
           {isOpen && (
             <div
               style={{
                 position: 'absolute',
                 top: '12px',
                 right: '12px',
                 zIndex: 1002,
                 background: 'rgba(0, 0, 0, 0.1)',
                 borderRadius: '50%',
                 width: '28px',
                 height: '28px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 fontSize: '16px',
                 color: '#666',
               }}
               onClick={() => setIsOpen(false)}
             >
               ✕
             </div>
           )}

           {/* Pre-loaded iframe (always loads in background) */}
           {isInitialized && roomUrl && authData ? (
             <iframe
               ref={iframeRef}
               src={(() => {
                 const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';
                 const fullUrl = `${roomUrl}${roomUrl.includes('?') ? '&' : '?'}token=${authData.tokens.accessToken}`;
                 console.log(`🔗 [${context}] Iframe URL:`, fullUrl);
                 console.log(`🔗 [${context}] Token length:`, authData.tokens.accessToken?.length || 0);
                 return fullUrl;
               })()}
               allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
               style={{
                 width: '100%',
                 height: '100%',
                 border: 'none',
                 borderRadius: '12px',
               }}
               title="Altan Room"
               onLoad={() => {
                 if (authData && iframeRef.current?.contentWindow) {
                   setTimeout(() => {
                     const iframe = iframeRef.current?.contentWindow;
                     if (iframe) {
                       iframe.postMessage(
                         {
                           type: 'activate_interface_parenthood',
                         },
                         '*',
                       );

                       iframe.postMessage(
                         {
                           type: 'guest_auth_response',
                           isAuthenticated: true,
                           guest: authData.guest,
                           accessToken: authData.tokens.accessToken,
                         },
                         '*',
                       );

                       iframe.postMessage(
                         {
                           type: 'new_access_token',
                           token: authData.tokens.accessToken,
                           guest: authData.guest,
                           user: null,
                           success: true,
                         },
                         '*',
                       );
                     }
                   }, 500);
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
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   height: '100%',
                 }}
               >
                 <div
                   style={{
                     width: '32px',
                     height: '32px',
                     border: '3px solid #f0f0f0',
                     borderTop: '3px solid #007bff',
                     borderRadius: '50%',
                     animation: 'altanSpin 1s linear infinite',
                   }}
                 ></div>
               </div>
             </div>
           )}
                  </div>

         <style>{`
           @keyframes altanPulse {
             0%, 100% { opacity: 0.6; }
             50% { opacity: 1; }
           }
           @keyframes altanSpin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
         `}</style>
       </>
     );
   }

    return (
    <div
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {isInitialized && roomUrl && authData ? (
        <iframe
          ref={iframeRef}
          src={`${roomUrl}${roomUrl.includes('?') ? '&' : '?'}token=${authData.tokens.accessToken}`}
          allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Altan Room"
          onLoad={() => {
                            if (authData && iframeRef.current?.contentWindow) {
                  // Longer initial delay to allow iframe to fully load
                  setTimeout(() => {
                    const iframe = iframeRef.current?.contentWindow;
                    if (iframe) {
                      const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';
                      console.log(`🚀 [${context}] Iframe loaded, initializing communication...`);
                      
                      iframe.postMessage(
                        {
                          type: 'activate_interface_parenthood',
                        },
                        '*',
                      );

                      // Send authentication data with retry logic
                      const sendAuthData = () => {
                        console.log(`🔐 [${context}] Sending authentication data to iframe...`);
                        console.log(`🔐 [${context}] Guest ID:`, authData.guest.id);
                        console.log(`🔐 [${context}] Token preview:`, authData.tokens.accessToken?.substring(0, 20) + '...');
                        
                        iframe.postMessage(
                          {
                            type: 'guest_auth_response',
                            isAuthenticated: true,
                            guest: authData.guest,
                            accessToken: authData.tokens.accessToken,
                          },
                          '*',
                        );

                        iframe.postMessage(
                          {
                            type: 'new_access_token',
                            token: authData.tokens.accessToken,
                            guest: authData.guest,
                            user: null,
                            success: true,
                          },
                          '*',
                        );
                        
                        console.log(`✅ [${context}] Authentication data sent successfully`);
                      };

                      // Send immediately
                      sendAuthData();
                      
                      // Retry after 2 seconds in case the first attempt failed
                      setTimeout(sendAuthData, 2000);
                      
                      // Periodic token refresh every 30 seconds to prevent timeouts
                      const tokenRefreshInterval = setInterval(() => {
                        if (authData && iframeRef.current?.contentWindow) {
                          console.log(`🔄 [${context}] Periodic token refresh...`);
                          iframe.postMessage(
                            {
                              type: 'new_access_token',
                              token: authData.tokens.accessToken,
                              guest: authData.guest,
                              user: null,
                              success: true,
                            },
                            '*',
                          );
                        } else {
                          clearInterval(tokenRefreshInterval);
                        }
                      }, 30000);
                    }
                  }, 1000); // Increased from 500ms to 1000ms
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f0f0f0',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'altanSpin 1s linear infinite',
              }}
            ></div>
            <style>{`
              @keyframes altanSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
