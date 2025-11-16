import { useState, useMemo, useCallback } from 'react';

import { getMemberDetails } from '../../utils';

interface Agent {
  id: string;
  name: string;
}

interface RoomMember {
  member?: {
    member_type?: string;
    agent?: {
      id?: string;
    };
    agent_id?: string;
  };
}

interface Members {
  byId?: Record<string, RoomMember>;
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

interface UseAgentSelectionProps {
  members: Members;
  altanerId?: string;
  altaner?: Altaner | null;
  operateMode: boolean;
}

interface UseAgentSelectionReturn {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  agents: Agent[];
  clearAgent: () => void;
  getAgentMention: () => string | undefined;
}

export const useAgentSelection = ({
  members,
  altanerId,
  altaner,
  operateMode,
}: UseAgentSelectionProps): UseAgentSelectionReturn => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Get agents from room members, filtered by altaner's agent list in operate mode
  const agents = useMemo(() => {
    // Get all agent members from the room
    const allAgentMembers = Object.values(members.byId || {}).filter(
      (member: RoomMember) => member?.member?.member_type === 'agent',
    );

    const allAgents = allAgentMembers.map((member: RoomMember) => getMemberDetails(member));

    // Only filter by altaner's agents when in OPERATE mode
    if (operateMode && altanerId && altaner) {
      const agentsComponent = altaner.components?.items?.find((c) => c.type === 'agents');
      const altanerAgentIds = agentsComponent?.params?.ids || [];

      if (altanerAgentIds.length > 0) {
        // Filter by comparing altaner agent IDs with the actual agent.id
        return allAgentMembers
          .filter((member: RoomMember) => {
            const agentId = member.member?.agent?.id || member.member?.agent_id;
            return altanerAgentIds.includes(agentId);
          })
          .map((member: RoomMember) => getMemberDetails(member));
      }
    }

    return allAgents;
  }, [members.byId, altanerId, altaner, operateMode]);

  const clearAgent = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  // Get agent mention text if agent is selected
  const getAgentMention = useCallback((): string | undefined => {
    if (!selectedAgent) return undefined;
    return `**[@${selectedAgent.name}](/member/${selectedAgent.id})**`;
  }, [selectedAgent]);

  return {
    selectedAgent,
    setSelectedAgent,
    agents,
    clearAgent,
    getAgentMention,
  };
};

