import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useResponsive from '../../hooks/useResponsive';

import { editGate } from '../../redux/slices/gates';
import { dispatch } from '../../redux/store';
import { optimai } from '../../utils/axios';
import CustomDialog from '../dialogs/CustomDialog';
import Iconify from '../iconify';

export default function ShareAgentDialog({ open, onClose, agent }) {
  const [isLoading, setIsLoading] = useState(true);
  const [gate, setGate] = useState(null);
  const voiceAgentPage = `https://www.altan.ai/agents/${agent.id}/share`;
  const voiceAgentWidget = `<script src="https://www.altan.ai/altan-voice-widget.js" altan-agent-id="${agent.id}" async></script>`;
  const shareLink = `https://app.altan.ai/gate/${gate?.id}`;
  const snippetCode = `<script src="https://app.altan.ai/jssnippet/cbsnippet.js" async id="${gate?.id}"></script>`;
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');

  useEffect(() => {
    const fetchGate = async () => {
      try {
        setIsLoading(true);
        const { data } = await optimai.get(`/agent/${agent.id}/gate`);
        setGate(data.gate);
      } catch (error) {
        console.error('Error fetching gate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchGate();
    }
  }, [agent.id, open]);

  const handleToggleStatus = async () => {
    try {
      setIsLoading(true);
      const newStatus = gate.status === 'open' ? 'closed' : 'open';
      dispatch(
        editGate(
          {
            status: newStatus,
          },
          gate.id,
        ),
      );
      setGate(gate);
    } catch (error) {
      console.error('Error updating gate status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Link copied successfully!');
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
      className="max-w-4xl w-full mx-4 max-h-[90vh]"
      overflowHidden={false}
      showCloseButton={!isMobile}
    >

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: theme.palette.primary.main }}
            ></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Toggle */}
            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: theme.palette.background.default }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: theme.palette.text.primary }}
              >
                Agent is {gate?.status === 'opened' ? 'public' : 'private'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gate?.status === 'opened'}
                  onChange={handleToggleStatus}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: gate?.status === 'opened'
                      ? theme.palette.primary.main
                      : theme.palette.grey[200],
                    borderColor: theme.palette.divider,
                  }}
                ></div>
              </label>
            </div>

            {gate?.status === 'opened' && (
              <div className="space-y-6">
                {/* Voice Experience Card */}
                <div
                  className="rounded-lg p-5"
                  style={{
                    border: `1px solid ${theme.palette.primary.light}`,
                    background: theme.palette.mode === 'dark'
                      ? theme.palette.primary.dark + '22'
                      : theme.palette.primary.lighter,
                  }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: theme.palette.primary.main }}
                    ></div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: theme.palette.primary.dark }}
                    >
                      Voice Experience
                    </h2>
                    <span
                      className="px-2 py-1 text-xs rounded-full font-medium"
                      style={{
                        background: theme.palette.primary.lighter,
                        color: theme.palette.primary.main,
                      }}
                    >
                      VOICE
                    </span>
                  </div>
                  {/* Voice Agent Page Link */}
                  <div className="space-y-3 mb-4">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: theme.palette.primary.dark }}
                    >
                      Voice Agent Page
                    </h3>
                    <p className="text-xs" style={{ color: theme.palette.primary.main }}>
                      Direct link to voice conversation with your agent
                    </p>
                    <div
                      className="flex items-center space-x-2 p-3 rounded-lg"
                      style={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.primary.light}`,
                      }}
                    >
                      <input
                        type="text"
                        value={voiceAgentPage}
                        readOnly
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: theme.palette.text.primary }}
                      />
                      <button
                        onClick={() => handleCopyLink(voiceAgentPage)}
                        className="p-2 transition-colors"
                        style={{ color: theme.palette.primary.main }}
                        title="Copy link"
                      >
                        <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(voiceAgentPage, '_blank')}
                        className="p-2 transition-colors"
                        style={{ color: theme.palette.primary.main }}
                        title="Open in new tab"
                      >
                        <Iconify icon="mdi:open-in-new" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Voice Widget Embed */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: theme.palette.primary.dark }}
                    >
                      Voice Widget Embed
                    </h3>
                    <p className="text-xs" style={{ color: theme.palette.primary.main }}>
                      Add a floating voice chat widget to your website
                    </p>
                    <div className="relative">
                      <textarea
                        value={voiceAgentWidget}
                        readOnly
                        rows={2}
                        className="w-full p-3 text-sm font-mono rounded-lg resize-none outline-none"
                        style={{
                          background: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.primary.light}`,
                          color: theme.palette.text.primary,
                        }}
                      />
                      <button
                        onClick={() => handleCopyLink(voiceAgentWidget)}
                        className="absolute top-2 right-2 p-2 rounded border transition-colors"
                        style={{
                          color: theme.palette.primary.main,
                          background: theme.palette.primary.lighter,
                          borderColor: theme.palette.primary.light,
                        }}
                        title="Copy code"
                      >
                        <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Text Experience Card */}
                <div
                  className="rounded-lg p-5"
                  style={{
                    border: `1px solid ${theme.palette.success.light}`,
                    background: theme.palette.mode === 'dark'
                      ? theme.palette.success.dark + '22'
                      : theme.palette.success.lighter,
                  }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: theme.palette.success.main }}
                    ></div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: theme.palette.success.dark }}
                    >
                      Text Experience
                    </h2>
                    <span
                      className="px-2 py-1 text-xs rounded-full font-medium"
                      style={{
                        background: theme.palette.success.lighter,
                        color: theme.palette.success.main,
                      }}
                    >
                      TEXT
                    </span>
                  </div>
                  {/* Text Agent Page Link */}
                  <div className="space-y-3 mb-4">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: theme.palette.success.dark }}
                    >
                      Text Agent Page
                    </h3>
                    <p className="text-xs" style={{ color: theme.palette.success.main }}>
                      Direct link to text conversation with your agent
                    </p>
                    <div
                      className="flex items-center space-x-2 p-3 rounded-lg"
                      style={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.success.light}`,
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
                        className="p-2 transition-colors"
                        style={{ color: theme.palette.success.main }}
                        title="Copy link"
                      >
                        <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(shareLink, '_blank')}
                        className="p-2 transition-colors"
                        style={{ color: theme.palette.success.main }}
                        title="Open in new tab"
                      >
                        <Iconify icon="mdi:open-in-new" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Text Widget Embed */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: theme.palette.success.dark }}
                    >
                      Text Widget Embed
                    </h3>
                    <p className="text-xs" style={{ color: theme.palette.success.main }}>
                      Add a text-based chatbot widget to your website
                    </p>
                    <div className="relative">
                      <textarea
                        value={snippetCode}
                        readOnly
                        rows={2}
                        className="w-full p-3 text-sm font-mono rounded-lg resize-none outline-none"
                        style={{
                          background: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.success.light}`,
                          color: theme.palette.text.primary,
                        }}
                      />
                      <button
                        onClick={() => handleCopyLink(snippetCode)}
                        className="absolute top-2 right-2 p-2 rounded border transition-colors"
                        style={{
                          color: theme.palette.success.main,
                          background: theme.palette.success.lighter,
                          borderColor: theme.palette.success.light,
                        }}
                        title="Copy code"
                      >
                        <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomDialog>
  );
}
