import { useTheme } from '@mui/material';
import { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { setDisplayModeForProject, selectDisplayMode } from '../../redux/slices/altaners';

const FloatingChatWidget = memo(() => {
  const { altanerId } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const displayMode = useSelector(selectDisplayMode);

  const handleClick = useCallback(() => {
    // Open the sidebar by switching to 'both' mode
    if (altanerId) {
      dispatch(setDisplayModeForProject({ altanerId, displayMode: 'both' }));
    }
  }, [dispatch, altanerId]);

  // Only show when in preview mode (sidebar is closed)
  if (displayMode !== 'preview') {
    return null;
  }

  // Theme-aware colors
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        cursor: 'pointer',
        minWidth: '200px',
        maxWidth: '300px',
        padding: '10px 16px',
        borderRadius: '24px',
        // Glassmorphic effect without displacement issues
        background: isDarkMode
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        isolation: 'isolate',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: 2,
        }}
      >
        {/* Placeholder text - theme-aware */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: '400',
            color: '#000',
            fontFamily: theme.typography.fontFamily,
            userSelect: 'none',
            flex: 1,
          }}
        >
          How can I help you?
        </span>

        {/* Up arrow icon - matching official widget */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#000',
            marginLeft: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
});

FloatingChatWidget.displayName = 'FloatingChatWidget';

export default FloatingChatWidget;
