import { useState, useEffect } from 'react';

import { editGate } from '../../redux/slices/gates';
import { dispatch } from '../../redux/store';
import { optimai } from '../../utils/axios';
import Iconify from '../iconify';

export default function ShareAgentDialog({ open, onClose, agent }) {
  const [isLoading, setIsLoading] = useState(true);
  const [gate, setGate] = useState(null);
  const voiceAgentPage = `https://www.altan.ai/agents/${agent.id}/share`;
  const voiceAgentWidget = `<script src="https://www.altan.ai/altan-voice-widget.js" altan-agent-id="${agent.id}" async></script>`;
  const shareLink = `https://app.altan.ai/gate/${gate?.id}`;
  const snippetCode = `<script src="https://app.altan.ai/jssnippet/cbsnippet.js" async id="${gate?.id}"></script>`;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Iconify icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {gate?.status === 'opened' && (
                <div className="space-y-6">
                  {/* Voice Experience Card */}
                  <div className="border border-purple-200 rounded-lg p-5 bg-purple-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-purple-900">Voice Experience</h2>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">VOICE</span>
                    </div>
                    {/* Voice Agent Page Link */}
                    <div className="space-y-3 mb-4">
                      <h3 className="text-sm font-medium text-purple-800">Voice Agent Page</h3>
                      <p className="text-xs text-purple-600">Direct link to voice conversation with your agent</p>
                      <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-purple-200">
                        <input
                          type="text"
                          value={voiceAgentPage}
                          readOnly
                          className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(voiceAgentPage)}
                          className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                          title="Copy link"
                        >
                          <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(voiceAgentPage, '_blank')}
                          className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                          title="Open in new tab"
                        >
                          <Iconify icon="mdi:open-in-new" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Voice Widget Embed */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-purple-800">Voice Widget Embed</h3>
                      <p className="text-xs text-purple-600">Add a floating voice chat widget to your website</p>
                      <div className="relative">
                        <textarea
                          value={voiceAgentWidget}
                          readOnly
                          rows={2}
                          className="w-full p-3 text-sm font-mono bg-white border border-purple-200 rounded-lg resize-none outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(voiceAgentWidget)}
                          className="absolute top-2 right-2 p-2 text-purple-600 hover:text-purple-800 transition-colors bg-purple-50 rounded border border-purple-200"
                          title="Copy code"
                        >
                          <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Text Experience Card */}
                  <div className="border border-green-200 rounded-lg p-5 bg-green-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-green-900">Text Experience</h2>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">TEXT</span>
                    </div>
                    {/* Text Agent Page Link */}
                    <div className="space-y-3 mb-4">
                      <h3 className="text-sm font-medium text-green-800">Text Agent Page</h3>
                      <p className="text-xs text-green-600">Direct link to text conversation with your agent</p>
                      <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-green-200">
                        <input
                          type="text"
                          value={shareLink}
                          readOnly
                          className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(shareLink)}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title="Copy link"
                        >
                          <Iconify icon="mdi:content-copy" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(shareLink, '_blank')}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title="Open in new tab"
                        >
                          <Iconify icon="mdi:open-in-new" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Text Widget Embed */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-green-800">Text Widget Embed</h3>
                      <p className="text-xs text-green-600">Add a text-based chatbot widget to your website</p>
                      <div className="relative">
                        <textarea
                          value={snippetCode}
                          readOnly
                          rows={2}
                          className="w-full p-3 text-sm font-mono bg-white border border-green-200 rounded-lg resize-none outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(snippetCode)}
                          className="absolute top-2 right-2 p-2 text-green-600 hover:text-green-800 transition-colors bg-green-50 rounded border border-green-200"
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
      </div>
    </div>
  );
}
