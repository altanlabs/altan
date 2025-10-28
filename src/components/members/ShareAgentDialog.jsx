import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import useResponsive from '../../hooks/useResponsive';

import CustomDialog from '../dialogs/CustomDialog';
import Iconify from '../iconify';

export default function ShareAgentDialog({ open, onClose, agent }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');

  // Build the shareable link - the agent DM room chat interface
  const shareLink = `${window.location.origin}/agent/${agent.id}/share`;

  const handleCopyLink = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((error) => {
        console.error('Failed to copy link:', error);
      });
  };

  if (!open) return null;

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      alwaysFullWidth
      className="max-w-2xl w-full mx-4"
      overflowHidden={false}
      showCloseButton={!isMobile}
    >
      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: theme.palette.text.primary }}
            >
              Share Agent
            </h2>
            <p className="text-sm" style={{ color: theme.palette.text.secondary }}>
              Share your agent with others using this link. Anyone with this link can chat with your agent.
            </p>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <h3
              className="text-sm font-medium"
              style={{ color: theme.palette.text.primary }}
            >
              Agent Link
            </h3>
            <div
              className="flex items-center space-x-2 p-3 rounded-lg"
              style={{
                background: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: theme.palette.text.primary }}
              />
              <button
                onClick={() => handleCopyLink(shareLink)}
                className="p-2 transition-colors hover:bg-gray-100 rounded"
                style={{ color: theme.palette.text.secondary }}
                title="Copy link"
              >
                <Iconify icon="mdi:content-copy" className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(shareLink, '_blank')}
                className="p-2 transition-colors hover:bg-gray-100 rounded"
                style={{ color: theme.palette.text.secondary }}
                title="Open in new tab"
              >
                <Iconify icon="mdi:open-in-new" className="w-4 h-4" />
              </button>
            </div>
            {copySuccess && (
              <p className="text-xs text-green-600">Link copied to clipboard!</p>
            )}
          </div>
        </div>
      </div>
    </CustomDialog>
  );
}
