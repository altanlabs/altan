/**
 * React Components for Altan AI SDK
 * Pre-built components for easy integration
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

import { AltanSDKConfig, GuestData, RoomData, AuthTokens, CreateGuestRequest } from './altan-sdk';
import { useAltan } from './react-hooks';

// Room configuration interface for personalizing room behavior
export interface RoomConfigProps {
  /** Show/hide tabs in room interface */
  tabs?: boolean;
  /** Show/hide conversation history */
  conversation_history?: boolean;
  /** Show/hide members panel */
  members?: boolean;
  /** Show/hide settings panel */
  settings?: boolean;
  /** Show/hide close button in tab bar */
  show_close_button?: boolean;
  /** Theme mode (light, dark, or system) */
  theme?: string;
  /** Custom room title */
  title?: string;
  /** Custom room description */
  description?: string;
  /** Predefined message suggestions */
  suggestions?: string[];
  /** Enable/disable voice functionality */
  voice_enabled?: boolean;
  /** Primary color for the widget (hex color) */
  primary_color?: string;
  /** Background color for the widget (hex color) */
  background_color?: string;
  /** Background blur effect for glassmorphism */
  background_blur?: boolean;
  /** Widget position: 'bottom-right', 'bottom-left', 'bottom-center' */
  position?: string;
  /** Widget width in pixels */
  width?: number;
  /** Room width in pixels when expanded */
  room_width?: number;
  /** Room height in pixels when expanded */
  room_height?: number;
  /** Border radius for rounded corners */
  border_radius?: number;
}

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

interface BaseRoomProps extends Omit<RoomConfigProps, 'width'> {
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
  /** Widget width in pixels for compact mode */
  widget_width?: number;
  /** Room width in pixels when expanded */
  room_width?: number;
  /** Room height in pixels when expanded */
  room_height?: number;
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
    // Mode-specific props
    mode,
    // Room configuration props
    tabs,
    conversation_history,
    members,
    settings,
    show_close_button,
    theme,
    title,
    description,
    suggestions,
    voice_enabled,
    // Styling props
    primary_color = '#007bff',
    background_color = '#ffffff',
    background_blur = true,
    position = 'bottom-center',
    widget_width = 350,
    room_width = 450,
    room_height = 700,
    border_radius = 16,
  } = props;

  // Extract mode-specific props safely
  const agentId = 'agentId' in props ? props.agentId : undefined;
  const roomId = 'roomId' in props ? props.roomId : undefined;
  const placeholder = 'placeholder' in props ? props.placeholder : undefined;
  const onConversationReady = 'onConversationReady' in props ? props.onConversationReady : undefined;
  const onRoomJoined = 'onRoomJoined' in props ? props.onRoomJoined : undefined;

  const [isInitialized, setIsInitialized] = useState(false);
  const [authData, setAuthData] = useState<{ guest: GuestData; tokens: AuthTokens } | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(mode !== 'compact');
  const [message, setMessage] = useState('');
  const [isPreloading, setIsPreloading] = useState(mode === 'compact');
  const [, forceUpdate] = useState({});
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initAttemptedRef = useRef(false);

  const fullConfig: AltanSDKConfig = {
    accountId,
    debug: false,
    ...config,
  };

  const { auth, createSession, joinExistingRoom } = useAltan(fullConfig);

  // Build query parameters from room configuration props
  const buildRoomConfigParams = (): string => {
    const params = new URLSearchParams();

    // Set defaults: tabs, members, and settings are false by default
    const defaultTabs = tabs !== undefined ? tabs : false;
    const defaultMembers = members !== undefined ? members : false;
    const defaultSettings = settings !== undefined ? settings : false;
    
    params.set('tabs', defaultTabs.toString());
    params.set('members', defaultMembers.toString());
    params.set('settings', defaultSettings.toString());
    
    if (conversation_history !== undefined)
      params.set('conversation_history', conversation_history.toString());
    
    // For compact mode, always show close button to enable widget closing
    const shouldShowCloseButton = mode === 'compact' ? true : show_close_button;
    if (shouldShowCloseButton !== undefined) params.set('show_close_button', shouldShowCloseButton.toString());
    
    if (theme !== undefined) params.set('theme', theme);
    if (title !== undefined) params.set('title', title);
    if (description !== undefined) params.set('description', description);
    if (suggestions !== undefined && suggestions.length > 0) {
      params.set('suggestions', encodeURIComponent(JSON.stringify(suggestions)));
    }
    if (voice_enabled !== undefined) params.set('voice_enabled', voice_enabled.toString());

    // Styling parameters
    if (primary_color !== undefined) params.set('primary_color', primary_color);
    if (background_color !== undefined) params.set('background_color', background_color);
    if (background_blur !== undefined) params.set('background_blur', background_blur.toString());
    if (position !== undefined) params.set('position', position);
    if (widget_width !== undefined) params.set('widget_width', widget_width.toString());
    if (room_width !== undefined) params.set('room_width', room_width.toString());
    if (room_height !== undefined) params.set('room_height', room_height.toString());
    if (border_radius !== undefined) params.set('border_radius', border_radius.toString());

    const paramString = params.toString();
    return paramString ? `&${paramString}` : '';
  };

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
      mode: mode,
      accountId: accountId,
      agentId:
        mode === 'agent' || (mode === 'compact' && agentId)
          ? agentId
          : undefined,
      roomId:
        mode === 'room' || (mode === 'compact' && roomId)
          ? roomId
          : undefined,
      guestInfo: guestInfo,
    });

    // For compact mode, show loading indicator while preloading
    if (mode === 'compact') {
      console.log(`🚀 [${context}] Starting background pre-loading for compact mode...`);
    }

    if (mode === 'agent' || (mode === 'compact' && agentId)) {
      // Agent mode: find/create DM with agent
      const currentAgentId = mode === 'agent' ? agentId : agentId;
      if (!currentAgentId) {
        console.error('❌ Agent ID is required for agent mode');
        setHasError(true);
        setIsInitialized(true);
        return;
      }
      const context = (window as any).AltanWidget ? 'WIDGET' : 'SDK';
      console.log(`🤖 [${context}] Creating agent session for:`, currentAgentId);

      createSession(currentAgentId, guestInfo)
        .then(({ room: createdRoom, tokens, guest }) => {
          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(createdRoom.url || null);
          setIsPreloading(false); // Pre-loading complete
          if (mode === 'agent') {
            onConversationReady?.(createdRoom);
          } else if (mode === 'compact') {
            onConversationReady?.(createdRoom);
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
    } else if (mode === 'room' || (mode === 'compact' && roomId)) {
      // Room mode: join existing room
      const currentRoomId = mode === 'room' ? roomId : roomId;
      if (!currentRoomId) {
        console.error('❌ Room ID is required for room mode');
        setHasError(true);
        setIsInitialized(true);
        return;
      }
      console.log('🏠 SDK: Joining existing room:', currentRoomId);

      joinExistingRoom(currentRoomId, guestInfo)
        .then(({ guest, tokens, roomUrl: url }) => {
          console.log('✅ SDK: Room joined successfully');
          console.log('🔐 SDK: Access token:', tokens.accessToken ? 'Present' : 'Missing');
          console.log('🏠 SDK: Room URL:', url);
          console.log('👤 SDK: Guest ID:', guest.id);

          setIsInitialized(true);
          setAuthData({ guest, tokens });
          setRoomUrl(url);
          setIsPreloading(false); // Pre-loading complete
          if (mode === 'room') {
            onRoomJoined?.(guest, tokens);
          } else if (mode === 'compact') {
            onRoomJoined?.(guest, tokens);
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

      // Handle token refresh requests (both message types for compatibility)
      if ((data?.type === 'token_refresh_request' || data?.type === 'refresh_token') && authData) {
        console.log(`🔄 [${context}] Iframe requesting token refresh...`);
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          // Use async IIFE to handle the refresh
          (async () => {
            try {
              // Actually refresh the token instead of sending the existing one
              const newTokens = await auth.refreshTokens();
              
              if (iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                  {
                    type: 'new_access_token',
                    token: newTokens.accessToken,
                    guest: authData.guest,
                    user: null,
                    success: true,
                  },
                  '*',
                );
              }

              console.log(`✅ [${context}] Fresh token sent after refresh`);
            } catch (error) {
              console.error(`❌ [${context}] Token refresh failed:`, error);
              
              // Send error response to iframe
              if (iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                  {
                    type: 'new_access_token',
                    token: null,
                    guest: authData.guest,
                    user: null,
                    success: false,
                    error: (error as Error).message || 'Token refresh failed',
                  },
                  '*',
                );
              }
            }
          })();
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

      // Handle widget close requests from TabBar
      if (data?.type === 'widget_close_request' && mode === 'compact') {
        console.log(`🔄 [${context}] Widget close requested from TabBar`);
        setIsOpen(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authData, mode]);

  // Handle window resize to update mobile detection
  useEffect(() => {
    const handleResize = () => {
      forceUpdate({});
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to detect mobile/small screens
  const isMobile = () => {
    return window.innerWidth <= 768 || window.innerHeight <= 600;
  };

  // Helper function to get position styles
  const getPositionStyles = () => {
    // On mobile, always use fullscreen positioning with dynamic viewport height
    if (isMobile()) {
      return {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        transform: 'none',
      };
    }

    const baseSpacing = 20;
    switch (position) {
      case 'bottom-right':
        return {
          bottom: `${baseSpacing}px`,
          right: `${baseSpacing}px`,
          left: 'auto',
          transform: 'none',
        };
      case 'bottom-left':
        return {
          bottom: `${baseSpacing}px`,
          left: `${baseSpacing}px`,
          right: 'auto',
          transform: 'none',
        };
      case 'bottom-center':
      default:
        return {
          bottom: `${baseSpacing}px`,
          left: '50%',
          right: 'auto',
          transform: 'translateX(-50%)',
        };
    }
  };

  // Helper function to get widget dimensions based on width
  const getWidgetDimensions = () => {
    // On mobile, use fullscreen dimensions with dynamic viewport height
    if (isMobile()) {
      return {
        textFieldWidth: 'calc(100vw - 40px)',
        textFieldMinWidth: '280px',
        roomWidth: '100vw',
        roomHeight: '100dvh', // Dynamic viewport height automatically handles browser UI
      };
    }

    const inputWidth = widget_width || 350;
    const maxInputWidth = Math.min(inputWidth, window.innerWidth - 40);

    const expandedWidth = room_width || 450;
    const maxRoomWidth = Math.min(expandedWidth, window.innerWidth - 40);

    const expandedHeight = room_height || 600;
    const maxRoomHeight = Math.min(expandedHeight, window.innerHeight - 100);

    return {
      textFieldWidth: `${maxInputWidth}px`,
      textFieldMinWidth: `${Math.min(maxInputWidth, 280)}px`,
      roomWidth: `${maxRoomWidth}px`,
      roomHeight: `${maxRoomHeight}px`,
    };
  };

  // Compact mode rendering
  if (mode === 'compact') {
    const positionStyles = getPositionStyles();
    const widgetDimensions = getWidgetDimensions();

    return (
      <>
        {/* Mobile backdrop when open */}
        {isMobile() && isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Text field overlay (always visible when closed) */}
        {!isOpen && (
          <div
            style={{
              position: 'fixed',
              ...(isMobile() ? {
                bottom: '20px',
                left: '50%',
                right: 'auto',
                top: 'auto',
                transform: 'translateX(-50%)',
                width: 'calc(100vw - 40px)',
                maxWidth: '350px',
              } : positionStyles),
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              background: background_blur
                ? `linear-gradient(135deg, rgba(${parseInt(background_color.slice(1, 3), 16)}, ${parseInt(background_color.slice(3, 5), 16)}, ${parseInt(background_color.slice(5, 7), 16)}, 0.75) 0%, rgba(${parseInt(background_color.slice(1, 3), 16)}, ${parseInt(background_color.slice(3, 5), 16)}, ${parseInt(background_color.slice(5, 7), 16)}, 0.85) 100%)`
                : background_color,
              backdropFilter: background_blur
                ? 'blur(20px) saturate(200%) brightness(1.05) contrast(1.1)'
                : 'none',
              WebkitBackdropFilter: background_blur
                ? 'blur(20px) saturate(200%) brightness(1.05) contrast(1.1)'
                : 'none',
              border: background_blur
                ? '1px solid rgba(255, 255, 255, 0.25)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: `${border_radius}px`,
              padding: '10px 16px',
              boxShadow: background_blur
                ? '0 8px 32px rgba(0, 0, 0, 0.12), ' +
                  '0 1px 3px rgba(0, 0, 0, 0.08), ' +
                  'inset 0 1px 0 rgba(255, 255, 255, 0.6), ' +
                  'inset 0 -1px 0 rgba(255, 255, 255, 0.2), ' +
                  '0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 4px 20px rgba(0, 0, 0, 0.15)',
              cursor: 'text',
              width: widgetDimensions.textFieldWidth,
              minWidth: widgetDimensions.textFieldMinWidth,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <input
              type="text"
              placeholder={placeholder || 'Type a message...'}
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'rgba(0, 0, 0, 0.85)',
                cursor: 'pointer',
                fontWeight: '400',
              }}
            />

            <div
              style={{
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Show subtle loading indicator while preloading */}
              {isPreloading && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: primary_color,
                    opacity: 0.7,
                    animation: 'altanPulse 1.5s ease-in-out infinite',
                  }}
                />
              )}

              {/* Elegant expand button */}
              <button
                onClick={() => setIsOpen(true)}
                title="Open chat"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: primary_color,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
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
            ...positionStyles,
            transform: isMobile() 
              ? `${isOpen ? 'scale(1)' : 'scale(0.95) translateY(100%)'}`
              : position === 'bottom-center'
                ? `translateX(-50%) ${isOpen ? 'scale(1)' : 'scale(0)'}`
                : `${isOpen ? 'scale(1)' : 'scale(0)'}`,
            width: widgetDimensions.roomWidth,
            height: widgetDimensions.roomHeight,
            borderRadius: isMobile() ? '0' : `${border_radius}px`,
            background: background_blur
              ? `linear-gradient(135deg, rgba(${parseInt(background_color.slice(1, 3), 16)}, ${parseInt(background_color.slice(3, 5), 16)}, ${parseInt(background_color.slice(5, 7), 16)}, 0.85) 0%, rgba(${parseInt(background_color.slice(1, 3), 16)}, ${parseInt(background_color.slice(3, 5), 16)}, ${parseInt(background_color.slice(5, 7), 16)}, 0.95) 100%)`
              : background_color,
            backdropFilter: background_blur
              ? 'blur(28px) saturate(200%) brightness(1.08) contrast(1.15)'
              : 'none',
            WebkitBackdropFilter: background_blur
              ? 'blur(28px) saturate(200%) brightness(1.08) contrast(1.15)'
              : 'none',
            border: 'none',
            transformOrigin: isMobile() 
              ? 'bottom center'
              : position === 'bottom-right'
                ? 'bottom right'
                : position === 'bottom-left'
                  ? 'bottom left'
                  : 'bottom center',
            opacity: isOpen ? 1 : 0,
            boxShadow: isOpen
              ? background_blur
                ? '0 25px 50px rgba(0, 0, 0, 0.18), ' +
                  '0 8px 16px rgba(0, 0, 0, 0.12), ' +
                  '0 2px 4px rgba(0, 0, 0, 0.1), ' +
                  'inset 0 1px 0 rgba(255, 255, 255, 0.7), ' +
                  'inset 0 -1px 0 rgba(255, 255, 255, 0.3), ' +
                  '0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 20px 40px rgba(0, 0, 0, 0.2)'
              : '0 10px 40px rgba(0, 0, 0, 0)',
            transition: isOpen
              ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease-out, box-shadow 0.25s ease-out'
              : 'transform 0.2s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.15s ease-in, box-shadow 0.2s ease-in',
            overflow: 'hidden',
            pointerEvents: isOpen ? 'auto' : 'none',
            zIndex: 1000,
          }}
        >
          {/* Close functionality now handled by native TabBar close button */}

          {/* Pre-loaded iframe (always loads in background) */}
          {isInitialized && roomUrl && authData ? (
            <iframe
              ref={iframeRef}
              src={(() => {
                const configParams = buildRoomConfigParams();
                // Security: No token in URL - authentication handled via secure postMessage
                return configParams ? `${roomUrl}?${configParams.substring(1)}` : roomUrl;
              })()}
              allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: isMobile() ? '0' : '12px',
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

                      // Inform iframe about mobile mode for internal UI adjustments
                      iframe.postMessage(
                        {
                          type: 'mobile_mode_status',
                          isMobile: isMobile(),
                          viewportHeight: window.innerHeight,
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
          src={(() => {
            const configParams = buildRoomConfigParams();
            // Security: No token in URL - authentication handled via secure postMessage
            return configParams ? `${roomUrl}?${configParams.substring(1)}` : roomUrl;
          })()}
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
                    console.log(
                      `🔐 [${context}] Token preview:`,
                      authData.tokens.accessToken?.substring(0, 20) + '...',
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
