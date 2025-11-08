import { useState, useEffect, useCallback } from 'react';

import DynamicAgentAvatar from '../../agents/DynamicAgentAvatar';
import Iconify from '../../iconify/Iconify.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useAuthContext } from '../../../auth/useAuthContext';
import { cn } from '../../../lib/utils';
import { selectMembers, selectRoomId } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';

import { AgentDetailDialog } from './agent-detail';

const AgentSelectionChip = ({
  agents = [],
  selectedAgent,
  onAgentSelect,
  onAgentClear,
  isVoiceActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailDialogAgent, setDetailDialogAgent] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const members = useSelector(selectMembers);
  const roomId = useSelector(selectRoomId);
  const { user } = useAuthContext();

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // LocalStorage key for this room's selected agent
  const getStorageKey = useCallback(() => `selectedAgent_${roomId}`, [roomId]);

  // Load persisted agent selection for this room
  useEffect(() => {
    if (roomId && agents.length > 0 && !selectedAgent) {
      try {
        const savedAgentId = localStorage.getItem(getStorageKey());
        if (savedAgentId) {
          const savedAgent = agents.find(agent => agent.id === savedAgentId);
          if (savedAgent) {
            onAgentSelect(savedAgent);
          } else {
            // Clean up invalid stored agent ID
            localStorage.removeItem(getStorageKey());
          }
        }
      } catch {
        // Error loading saved agent selection
      }
    }
  }, [roomId, agents, selectedAgent, onAgentSelect, getStorageKey]);

  const handleAgentSelect = (agent) => {
    // Save selection to localStorage for this room
    try {
      localStorage.setItem(getStorageKey(), agent.id);
    } catch {
      // Error saving agent selection
    }
    onAgentSelect(agent);
    setIsOpen(false);
  };

  const handleAgentClear = () => {
    // Remove selection from localStorage for this room
    try {
      localStorage.removeItem(getStorageKey());
    } catch {
      // Error clearing agent selection
    }
    onAgentClear();
  };

  const handleAgentInfo = (event, agent) => {
    event.stopPropagation();
    // Get the full member object from Redux
    const fullMember = members.byId[agent.id];
    setDetailDialogAgent(fullMember);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogAgent(null);
  };

  // Don't show if there's only one agent or if voice is active
  if (agents.length <= 1 || isVoiceActive) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-full h-[26px] transition-all',
              'text-[11px] font-medium',
              'bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10',
              'backdrop-blur-sm',
              'text-gray-700 dark:text-gray-300',
              'border border-white/20 dark:border-white/10',
              'shadow-sm hover:shadow',
              'focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600',
              isMobile && !selectedAgent ? 'min-w-[24px] px-1' : 'px-2',
            )}
          >
            {selectedAgent ? (
              <>
                <DynamicAgentAvatar
                  agent={members.byId[selectedAgent.id]?.member?.agent || selectedAgent}
                  size={12}
                  isStatic
                />
                {!isMobile && <span className="opacity-90 max-w-[80px] truncate">{selectedAgent.name}</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAgentClear();
                  }}
                  className="-mr-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <Iconify icon="mdi:close" className="w-2.5 h-2.5" />
                </button>
              </>
            ) : (
              <>
                <Iconify icon="mdi:at" className="w-3 h-3" />
                {!isMobile && <span className="opacity-90">{agents.length} agents</span>}
              </>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-56 p-1.5 backdrop-blur-xl bg-white/50 dark:bg-white/10 border-white/20 dark:border-white/10 shadow-lg"
          align="start"
          side="top"
          sideOffset={8}
        >
          <div className="text-[10px] text-gray-600 dark:text-gray-400 px-2 py-1 mb-0.5 uppercase tracking-wide font-medium opacity-70">
            Mention agent
          </div>
          <div className="space-y-0.5">
            {agents.map((agent) => {
              const originalMember = members.byId[agent.id];
              const hasVoice = !!originalMember?.member?.agent?.elevenlabs_id;

              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={cn(
                    'w-full rounded-md px-2 py-1.5 text-left transition-all',
                    'hover:bg-white/50 dark:hover:bg-white/10',
                    'flex items-center gap-1.5',
                  )}
                >
                  <DynamicAgentAvatar
                    agent={originalMember?.member?.agent || agent}
                    size={20}
                    isStatic
                  />
                  <span className="text-xs font-medium flex-1 truncate text-gray-700 dark:text-gray-300">
                    {agent.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {hasVoice && (
                      <Iconify
                        icon="mdi:microphone"
                        className="w-3 h-3 text-green-600 dark:text-green-400 opacity-70"
                      />
                    )}
                    {user?.xsup && (
                      <button
                        onClick={(e) => handleAgentInfo(e, agent)}
                        className={cn(
                          'p-0.5 rounded hover:bg-white/50 dark:hover:bg-white/20',
                          'text-gray-600 dark:text-gray-400 hover:text-primary transition-colors',
                        )}
                        title="Agent details"
                      >
                        <Iconify icon="eva:settings-2-outline" className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Agent Detail Dialog for Super Users */}
      {user?.xsup && (
        <AgentDetailDialog
          open={!!detailDialogAgent}
          onClose={handleCloseDetailDialog}
          agentMember={detailDialogAgent}
        />
      )}
    </>
  );
};

export default AgentSelectionChip;