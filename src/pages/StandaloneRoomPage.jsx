import { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';

import Room from '../components/room/Room.jsx';
import { useSettingsContext } from '../components/settings';
import { selectRoomAttribute } from '../redux/slices/room';
import { useSelector } from '../redux/store';

const selectRoomName = selectRoomAttribute('name');
const selectRoomDescription = selectRoomAttribute('description');

export default function StandaloneRoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const { themeMode: globalThemeMode, onChangeMode } = useSettingsContext();

  const roomName = useSelector(selectRoomName);
  const roomDescription = useSelector(selectRoomDescription);

  // Helper function to parse string parameters that might be "null"
  const parseStringParam = (value) => {
    if (value === null || value === 'null' || value === '') {
      return undefined;
    }
    return value;
  };

  // Parse query parameters for personalization settings
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      tabs: params.get('tabs') !== null ? params.get('tabs') === 'true' : undefined,
      conversation_history: params.get('conversation_history') !== null ? params.get('conversation_history') === 'true' : undefined,
      members: params.get('members') !== null ? params.get('members') === 'true' : undefined,
      settings: params.get('settings') !== null ? params.get('settings') === 'true' : undefined,
      theme: parseStringParam(params.get('theme')),
      title: parseStringParam(params.get('title')),
      description: parseStringParam(params.get('description')),
      suggestions: params.get('suggestions') ? JSON.parse(decodeURIComponent(params.get('suggestions'))) : undefined,
      voice_enabled: params.get('voice_enabled') !== null ? params.get('voice_enabled') === 'true' : undefined,
    };
  }, [location.search]);

  // Default configuration (can be overridden by query params)
  const defaultConfig = {
    tabs: true,
    conversation_history: true,
    members: true,
    settings: true,
    theme: null,
    title: null,
    description: null,
    suggestions: [],
    voice_enabled: true,
  };

  // Merge default config with query parameters (query params take precedence)
  const config = useMemo(() => {
    const merged = { ...defaultConfig };
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined) {
        merged[key] = queryParams[key];
      }
    });
    return merged;
  }, [queryParams]);

  // Track original theme and whether we've applied override
  const originalThemeRef = useRef(null);
  const hasAppliedThemeRef = useRef(false);

  // Handle theme override at page level - only once
  useEffect(() => {
    if (config.theme && !hasAppliedThemeRef.current) {
      // Store original theme mode only on first run
      originalThemeRef.current = globalThemeMode;
      hasAppliedThemeRef.current = true;

      // Apply room theme override only if different from current
      if (config.theme !== globalThemeMode) {
        onChangeMode(config.theme);
      }
    }

    // Cleanup function to restore original theme when component unmounts
    return () => {
      if (hasAppliedThemeRef.current && originalThemeRef.current && originalThemeRef.current !== globalThemeMode) {
        onChangeMode(originalThemeRef.current);
      }
    };
  }, [config.theme]); // Only depend on config.theme to avoid infinite loop

  return (
    <>
      <Helmet>
        <title>{roomName}</title>
        <meta
          name="description"
          content={roomDescription}
        />
      </Helmet>

      <Room
        key={roomId}
        roomId={roomId}
        {...config}
      />
    </>
  );
}
