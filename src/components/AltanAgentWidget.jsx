import { Room } from '@altanlabs/sdk';
import { useTheme } from '@mui/material/styles';
import { useMemo, useCallback, useEffect } from 'react';

import { useSettingsContext } from './settings';
import { useAuthContext } from '../auth/useAuthContext.ts';

const AltanAgentWidget = () => {
  const theme = useTheme();
  const { themeMode } = useSettingsContext();
  const { user, isAuthenticated } = useAuthContext();

  // Generate or retrieve persistent guest ID for unauthenticated users
  const getOrCreateGuestId = useCallback(() => {
    const storageKey = 'altan_guest_id';

    try {
      // Try to get existing guest ID from localStorage
      const existingGuestId = localStorage.getItem(storageKey);
      if (existingGuestId) {
        return existingGuestId;
      }

      // Generate new guest ID and store it
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, newGuestId);
      return newGuestId;
    } catch {
      // Fallback if localStorage is not available
      return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Clear guest ID when user logs in to ensure fresh start
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        localStorage.removeItem('altan_guest_id');
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [isAuthenticated, user]);

  // Map user data to guestInfo format expected by Altan SDK
  // For unauthenticated users, provide minimal guest info with persistent ID
  const guestInfo =
    isAuthenticated && user
      ? {
          external_id: user.id?.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        }
      : {
          first_name: 'Guest',
          last_name: 'User',
          // Use persistent guest ID for anonymous users
          external_id: getOrCreateGuestId(),
        };

  // Dynamic theme-aware styling with responsive design
  const widgetConfig = useMemo(() => {
    const isDark = themeMode === 'dark';

    return {
      // Use app's primary color (the blue from your theme)
      primary_color: theme.palette.primary.main, // This will be #1E52F1
      // Dynamic background with better contrast
      background_color: isDark
        ? theme.palette.background.paper // Dark theme paper color
        : theme.palette.background.paper, // Light theme paper color
      // Enhanced glassmorphic effect for elegant look
      background_blur: true,
      // Positioning
      position: 'bottom-right',
      // Responsive sizing based on device
      widget_width: 250,
      room_width: 500,
      room_height: 700,
      // Rounded corners matching app design (more modern look)
      border_radius: 24,
      // Theme mode - will adapt automatically
      theme: themeMode,
    };
  }, [theme, themeMode]);

  return (
    <Room
      mode="compact"
      accountId="9d8b4e5a-0db9-497a-90d0-660c0a893285"
      agentId="9752fe41-c447-4731-a0de-5c318823679e"
      placeholder="Ask me anything..."
      guestInfo={guestInfo}
      // Dynamic styling
      {...widgetConfig}
      // Room configuration
      tabs={false}
      conversation_history={true}
      members={false}
      settings={false}
      voice_enabled={true}
      // Widget control buttons
      show_fullscreen_button={true}
      show_sidebar_button={true}
      title="Altan Support"
      description="Get help with your questions"
      suggestions={[
        'Tell me about Altan features',
        'I need help with my project',
        'Help me get started',
      ]}
      // Event handlers
      onConversationReady={() => {
        // Widget is ready and conversation started
      }}
      onAuthSuccess={() => {
        // Guest authentication successful
      }}
    />
  );
};

export default AltanAgentWidget;
