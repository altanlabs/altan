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

type RoomProps = AgentModeProps | RoomModeProps;

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initAttemptedRef = useRef(false);

  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: false,
    ...config,
  };

  const { auth, createSession, joinExistingRoom } = useAltan(fullConfig);

  // Auto-initialize on mount with infinite loop protection
  useEffect(() => {
    // CRITICAL: Prevent infinite loops with multiple safeguards
    if (isInitialized || hasError || initAttemptedRef.current) {
      return;
    }

    initAttemptedRef.current = true;

    if (props.mode === 'agent') {
      // Agent mode: find/create DM with agent
      createSession(props.agentId, guestInfo)
        .then(({ room: createdRoom, tokens, guest }) => {
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(createdRoom.url || null);
          props.onConversationReady?.(createdRoom);
          onAuthSuccess?.(guest, tokens);
        })
        .catch((error: Error) => {
          console.error('❌ Agent session failed:', error);
          setHasError(true);
          setIsInitialized(true); // Prevent re-runs
          onError?.(error);
        });
    } else if (props.mode === 'room') {
      // Room mode: join existing room
      joinExistingRoom(props.roomId, guestInfo)
        .then(({ guest, tokens, roomUrl: url }) => {
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(url);
          props.onRoomJoined?.(guest, tokens);
          onAuthSuccess?.(guest, tokens);
        })
        .catch((error: Error) => {
          console.error('❌ Room join failed:', error);
          setHasError(true);
          setIsInitialized(true); // Prevent re-runs
          onError?.(error);
        });
    } else {
      console.error('❌ Unknown mode:', (props as any).mode);
      setHasError(true);
      setIsInitialized(true); // Prevent re-runs
      onError?.(new Error(`Unknown mode: ${(props as any).mode}`));
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle authentication iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const { data } = event;

      if (data?.type === 'request_guest_auth' && authData) {
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
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authData]);

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
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f0f0f0',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              animation: 'altanSpin 1s linear infinite'
            }}></div>
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
