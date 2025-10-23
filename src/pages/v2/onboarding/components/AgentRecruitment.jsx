import React, { useState, useEffect, memo } from 'react';

import ChatMessage from './ChatMessage';

const AgentRecruitment = ({ agents, onComplete, onAgentMessage }) => {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [shownAgents, setShownAgents] = useState([]);

  // Map agent names to their audio files
  const agentAudioFiles = {
    Genesis: '/audio/agents/genesis-intro.mp3',
    Cloud: '/audio/agents/cloud-intro.mp3',
    Interface: '/audio/agents/interface-intro.mp3',
    Services: '/audio/agents/services-intro.mp3',
  };

  // Show agents one by one and add to parent's message history
  useEffect(() => {
    if (currentAgentIndex < agents.length) {
      const timer = setTimeout(() => {
        const agent = agents[currentAgentIndex];
        setShownAgents((prev) => [...prev, agent]);
        // Notify parent to add message to history
        if (onAgentMessage) {
          onAgentMessage({
            id: `agent-${agent.name}`,
            text: `${agent.name} here. ${agent.message}`,
            isUser: false,
            agentName: agent.name,
          });
        }
        setCurrentAgentIndex((prev) => prev + 1);
      }, currentAgentIndex === 0 ? 0 : 4500); // First agent immediately, then 4.5s between agents
      return () => clearTimeout(timer);
    } else if (currentAgentIndex === agents.length) {
      setTimeout(() => {
        onComplete();
      }, 2000); // Wait after last agent
    }
  }, [currentAgentIndex, agents, onComplete, onAgentMessage]);

  return (
    <div className="space-y-4">
      {shownAgents.map((agent, idx) => (
        <ChatMessage
          key={agent.name}
          message={`${agent.name} here. ${agent.message}`}
          isUser={false}
          showAvatar={true}
          useTypewriter={idx === shownAgents.length - 1}
          agentName={agent.name}
          audioFile={idx === shownAgents.length - 1 ? agentAudioFiles[agent.name] : null}
        />
      ))}
    </div>
  );
};

export default memo(AgentRecruitment);
