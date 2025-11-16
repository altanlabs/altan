import { memo } from 'react';

import AgentSelectionChip from '@/components/attachment/components/AgentSelectionChip.jsx';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { BuildModeToggle } from '../BuildModeToggle';
import { SendIcon, PlusIcon, MicIcon } from '../icons';

interface Agent {
  id: string;
  name: string;
}

interface Altaner {
  components?: {
    items?: Array<{
      type: string;
      params?: {
        ids?: string[];
      };
    }>;
  };
}

interface InputActionsProps {
  // Attach button
  onAttachClick: () => void;
  disabled: boolean;

  // Agent selection
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent | null) => void;
  onAgentClear: () => void;
  altaner?: Altaner | null;
  operateMode: boolean;

  // Send/Voice/Stop actions
  hasActiveGeneration: boolean;
  hasValue: boolean;
  onSendClick: () => void;
  onStopGeneration: () => void;
  onStartRecording: () => void;
}

export const InputActions = memo(
  ({
    onAttachClick,
    disabled,
    agents,
    selectedAgent,
    onAgentSelect,
    onAgentClear,
    altaner,
    operateMode,
    hasActiveGeneration,
    hasValue,
    onSendClick,
    onStopGeneration,
    onStartRecording,
  }: InputActionsProps) => {
    return (
      <div className="p-2 pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-between">
            {/* Left: Attach button + Agent Selection */}
            <div className="flex items-center gap-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onAttachClick}
                    disabled={disabled}
                    className="h-8 w-8 rounded-full"
                  >
                    <PlusIcon />
                    <span className="sr-only">Attach files</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>

              {/* Agent Selection */}
              <AgentSelectionChip
                agents={agents}
                selectedAgent={selectedAgent}
                onAgentSelect={onAgentSelect}
                onAgentClear={onAgentClear}
                isVoiceActive={false}
                altaner={altaner}
                operateMode={operateMode}
              />
            </div>

            {/* Right: Build mode chip + Send/Voice button */}
            <div className="flex items-center gap-2">
              {/* Build Mode Chip */}
              <BuildModeToggle operateMode={operateMode} />

              {/* Stop Generation Button (when agent is generating) */}
              {hasActiveGeneration ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onStopGeneration}
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                        />
                      </svg>
                      <span className="sr-only">Stop generation</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Stop generation</p>
                  </TooltipContent>
                </Tooltip>
              ) : hasValue ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onSendClick}
                      disabled={disabled}
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <SendIcon />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onStartRecording}
                      disabled={disabled}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                    >
                      <MicIcon />
                      <span className="sr-only">Start voice recording</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Voice input</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    );
  },
);

InputActions.displayName = 'InputActions';

