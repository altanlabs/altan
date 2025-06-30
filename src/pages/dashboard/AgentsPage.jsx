import { memo, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomAvatar } from '../../components/custom-avatar';
import { CompactLayout } from '../../layouts/dashboard';
import { useSelector } from '../../redux/store';
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------
const getAgents = (state) => state.general.account?.agents;
const getAgentsInitialized = (state) => state.general.accountAssetsInitialized.agents;
const getAccount = (state) => state.general.account;

function AgentsPage() {
  const agents = useSelector(getAgents);
  const initialized = useSelector(getAgentsInitialized);
  const account = useSelector(getAccount);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [ideaMode, setIdeaMode] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [selectedIdeaAgentId, setSelectedIdeaAgentId] = useState(null);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Refs for click outside detection
  const textareaRef = useRef(null);
  const agentButtonRef = useRef(null);
  const agentMenuRef = useRef(null);

  // Sort agents by date_creation (newest first)
  const sortedAgents = useMemo(() => {
    if (!agents) return [];
    return [...agents].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
  }, [agents]);

  // Set default selected agent for idea mode (latest agent)
  useEffect(() => {
    if (sortedAgents.length > 0 && !selectedIdeaAgentId) {
      setSelectedIdeaAgentId(sortedAgents[0].id);
    }
  }, [sortedAgents, selectedIdeaAgentId]);

  // Close agent menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        agentMenuOpen &&
        agentButtonRef.current &&
        !agentButtonRef.current.contains(event.target) &&
        agentMenuRef.current &&
        !agentMenuRef.current.contains(event.target)
      ) {
        setAgentMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [agentMenuOpen]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [ideaText, adjustTextareaHeight]);

  const handleAgentSelect = async (agentId) => {
    setSelectedAgentId(agentId);
    setIdeaMode(false);
    setIdeaText('');
    setLoadingRoom(true);
    setRoomId(null);

    try {
      // Fetch the room ID for this agent
      const dmResponse = await optimai.get(
        `/agent/${agentId}/dm?account_id=${account.id}`,
      );
      setRoomId(dmResponse.data.id);
    } catch (error) {
      console.error('Failed to fetch room ID:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleEditAgent = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  const handleCreateAgent = () => {
    // You can implement your create agent logic here
    console.log('Create new agent');
  };

  const handleIdeaSubmit = async () => {
    if (!ideaText.trim() || !selectedIdeaAgentId) return;

    setLoadingRoom(true);
    setRoomId(null);

    try {
      // Fetch the room ID for the selected agent
      const dmResponse = await optimai.get(
        `/agent/${selectedIdeaAgentId}/dm?account_id=${account.id}`,
      );
      const fetchedRoomId = dmResponse.data.id;
      setRoomId(fetchedRoomId);
      setSelectedAgentId(selectedIdeaAgentId);
      setIdeaMode(true);
    } catch (error) {
      console.error('Failed to fetch room ID:', error);
    } finally {
      setLoadingRoom(false);
    }
  };

  const selectedIdeaAgent = sortedAgents.find(agent => agent.id === selectedIdeaAgentId);

  if (!initialized) {
    return (
      <CompactLayout title={'Agents · Altan'}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </CompactLayout>
    );
  }

  return (
    <CompactLayout title={'Agents · Altan'} noPadding>
      <div className="flex h-full bg-gray-50">
        {/* Left Drawer - Agents List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Create Agent Button */}
          <div className="p-4">
            <button
              onClick={handleCreateAgent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Agent</span>
            </button>
          </div>

          {/* Agents List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pt-0 space-y-2">
              {sortedAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm relative ${
                    selectedAgentId === agent.id
                      ? 'bg-blue-50 border-blue-200 border shadow-sm'
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3">
                    <CustomAvatar
                      src={agent.avatar_url}
                      name={agent.name}
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: '14px',
                        fontWeight: 600,
                        boxShadow: '0 0 0 2px white, 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm truncate ${
                        selectedAgentId === agent.id ? 'text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      {agent.name}
                    </h3>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        selectedAgentId === agent.id ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      Created {new Date(agent.date_creation).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Edit Button - appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAgent(agent.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2 w-8 h-8 bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                    title="Edit agent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Selection Indicator */}
                  {selectedAgentId === agent.id && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}

              {sortedAgents.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No agents available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Iframe or Idea Input */}
        <div className="flex-1 flex flex-col">
          {selectedAgentId ? (
            <>
              {/* Iframe Container - Full Height */}
              <div className="flex-1">
                <div className="h-full">
                  {loadingRoom ? (
                    <div className="flex items-center justify-center h-full bg-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading chat room...</p>
                      </div>
                    </div>
                  ) : roomId ? (
                    <iframe
                      src={`https://app.altan.ai/room/${roomId}?header=false${ideaMode && ideaText ? `&idea=${encodeURIComponent(ideaText)}` : ''}`}
                      className="w-full h-full border-0"
                      title="Agent Chat Room"
                      allow="microphone; camera; autoplay; encrypted-media; fullscreen"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-white">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Failed to load chat room</p>
                        <button
                          onClick={() => handleAgentSelect(selectedAgentId)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Idea Input State */
            <div className="flex-1 flex flex-col justify-center bg-white">
              <div className="w-full max-w-[750px] mx-auto px-6 pb-20">
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-semibold text-gray-900 mb-2">Ask anything</h3>
                </div>

                {/* Text Input Component */}
                <div className="relative">
                  <div className="w-full px-4 pt-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg bg-white border border-gray-200">
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-transparent min-h-[24px] max-h-[200px] focus:outline-none text-gray-900 placeholder-gray-400 resize-none pb-14"
                      placeholder="Describe your next idea..."
                      value={ideaText}
                      onChange={(e) => {
                        setIdeaText(e.target.value);
                        adjustTextareaHeight();
                      }}
                    />
                    <div className="absolute bottom-2 left-4 right-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {/* Agent Selection */}
                        <div className="relative">
                          <button
                            ref={agentButtonRef}
                            onClick={() => setAgentMenuOpen(!agentMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 border border-gray-200"
                          >
                            {selectedIdeaAgent && (
                              <CustomAvatar
                                src={selectedIdeaAgent.avatar_url}
                                name={selectedIdeaAgent.name}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  fontSize: '10px',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                            <span className="text-gray-700">
                              {selectedIdeaAgent ? selectedIdeaAgent.name : 'Select Agent'}
                            </span>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Agent Menu */}
                          {agentMenuOpen && (
                            <div
                              ref={agentMenuRef}
                              className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-60 overflow-y-auto"
                            >
                              <div className="p-2">
                                {sortedAgents.map((agent) => (
                                  <button
                                    key={agent.id}
                                    onClick={() => {
                                      setSelectedIdeaAgentId(agent.id);
                                      setAgentMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left ${
                                      selectedIdeaAgentId === agent.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                    }`}
                                  >
                                    <CustomAvatar
                                      src={agent.avatar_url}
                                      name={agent.name}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{agent.name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        Created {new Date(agent.date_creation).toLocaleDateString()}
                                      </div>
                                    </div>
                                    {selectedIdeaAgentId === agent.id && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleIdeaSubmit}
                          disabled={!ideaText.trim() || !selectedIdeaAgentId || loadingRoom}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Send message"
                        >
                          {loadingRoom ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CompactLayout>
  );
}

export default memo(AgentsPage);
