import { LoaderCircle } from 'lucide-react';
import { memo, useState, useEffect, useCallback, useRef, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import AgentIdsList from './AgentIdsList';
import AgentModelSettings from './AgentModelSettings';
import AgentToolsList from './AgentToolsList';
import { fetchAgentRoom, updateAgent } from '../../../../redux/slices/agents';
import { getSpace } from '../../../../redux/slices/spaces';
// @ts-expect-error - JSX component without types
import AgentOrbAvatar from '../../../agents/AgentOrbAvatar';
// @ts-expect-error - JSX component without types
import CustomAvatar from '../../../custom-avatar/CustomAvatar';

interface AgentMember {
  member?: {
    agent?: {
      id: string;
    };
    name?: string;
    picture?: string;
  };
}

interface AgentData {
  id: string;
  name?: string;
  avatar_url?: string;
  space_id?: string;
  account_id?: string;
  elevenlabs_id?: string;
  meta_data?: {
    avatar_orb?: {
      colors?: string[];
    };
  };
  llm_config?: {
    model_id?: string;
    provider?: string;
    settings?: {
      temperature?: number;
      token_limit?: number;
      reasoning_effort?: string;
      reasoning_enabled?: boolean;
      beta_headers?: string[];
      web_search?: {
        enabled?: boolean;
      };
    };
  };
}

interface AgentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  agentMember: AgentMember | null;
}

const AgentDetailDialog: FC<AgentDetailDialogProps> = ({ open, onClose, agentMember }) => {
  const dispatch = useDispatch();
  const { currentAgent, isLoading } = useSelector((state: any) => state.agents);
  const currentSpace = useSelector((state: any) => state.spaces.current);
  const [agentData, setAgentData] = useState<AgentData | null>(null);

  // Fetch agent details when dialog opens
  useEffect(() => {
    if (open && agentMember?.member?.agent?.id) {
      dispatch(fetchAgentRoom(agentMember.member.agent.id) as any);
    }
  }, [open, agentMember?.member?.agent?.id, dispatch]);

  // Fetch space/tools when agent loads
  useEffect(() => {
    if (currentAgent?.space_id && open) {
      dispatch(getSpace(currentAgent.space_id) as any);
    }
  }, [currentAgent?.space_id, open, dispatch]);

  // Update local state when currentAgent changes
  useEffect(() => {
    if (currentAgent) {
      setAgentData(currentAgent);
    }
  }, [currentAgent]);

  // Debounced update
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const debouncedUpdateAgent = useCallback(
    (id: string, data: Partial<AgentData>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        dispatch(updateAgent(id, data) as any);
      }, 500);
    },
    [dispatch],
  );

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      if (agentData) {
        const updatedData = { ...agentData, [field]: value };
        setAgentData(updatedData);
        debouncedUpdateAgent(agentData.id, { [field]: value });
      }
    },
    [agentData, debouncedUpdateAgent],
  );

  if (!agentMember) return null;

  const tools = currentSpace?.tools?.items || [];
  
  // Get orb colors from agent meta_data
  const orbColors = agentData?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1'];
  const picture = agentMember.member?.picture || agentData?.avatar_url;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 gap-0 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex-shrink-0">
            {!picture ? (
              <AgentOrbAvatar
                size={24}
                agentId={agentData?.id || agentMember.member?.agent?.id || ''}
                agentState={null}
                isStatic={false}
                colors={orbColors}
              />
            ) : (
              <CustomAvatar
                sx={{ width: 24, height: 24 }}
                variant="circular"
                src={picture}
                name={agentData?.name || agentMember.member?.name || 'Agent'}
              />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {agentData?.name || agentMember.member?.name}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Agent Configuration
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(85vh-3.5rem)]">
          {isLoading || !agentData ? (
            <div className="flex justify-center py-12">
              <LoaderCircle className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="flex flex-col">
              <AgentModelSettings
                agentData={agentData}
                onFieldChange={handleFieldChange}
              />

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              <AgentToolsList
                tools={tools}
                agentId={agentData?.id}
                spaceId={agentData?.space_id ?? undefined}
              />

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              <AgentIdsList agentData={agentData} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(AgentDetailDialog);

