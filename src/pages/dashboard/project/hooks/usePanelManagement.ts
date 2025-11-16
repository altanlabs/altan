/**
 * Hook for managing resizable panel state
 * Single Responsibility: Panel resize and collapse logic
 */

import { useEffect, useRef } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import type { PanelRefs, DisplayMode, Altaner } from '../types';

interface UsePanelManagementProps {
  displayMode: DisplayMode;
  shouldCollapsePreview: boolean;
  altaner: Altaner | null;
}

export function usePanelManagement({
  displayMode,
  shouldCollapsePreview,
  altaner,
}: UsePanelManagementProps): PanelRefs {
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);

  // Control chat panel based on display mode
  useEffect(() => {
    if (chatPanelRef.current) {
      if (displayMode === 'preview') {
        chatPanelRef.current.collapse();
      } else {
        chatPanelRef.current.expand();
      }
    }
  }, [displayMode]);

  // Ensure chat panel is visible when altaner loads
  useEffect(() => {
    if (altaner?.room_id && displayMode !== 'preview') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (chatPanelRef.current?.isCollapsed()) {
            chatPanelRef.current.expand();
          }
        });
      });
    }
  }, [altaner?.room_id, displayMode]);

  // Control preview panel collapse/expand
  useEffect(() => {
    if (previewPanelRef.current && chatPanelRef.current && displayMode !== 'preview') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (shouldCollapsePreview) {
            previewPanelRef.current?.collapse();
            chatPanelRef.current?.resize(100);
          } else {
            if (previewPanelRef.current?.isCollapsed()) {
              previewPanelRef.current.expand();
            }
            if (chatPanelRef.current) {
              chatPanelRef.current.resize(30);
            }
          }
        });
      });
    }
  }, [shouldCollapsePreview, displayMode]);

  return {
    chat: chatPanelRef,
    preview: previewPanelRef,
  };
}
