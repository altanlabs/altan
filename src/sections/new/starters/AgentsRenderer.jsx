import React from 'react';

import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';

const AgentsRenderer = ({ onSelect }) => {
  const agents = [
    {
      name: 'Customer Support',
      description: 'Handle inquiries and resolve issues',
      prompt: 'Create a customer support agent that answers questions, handles complaints, and escalates complex issues to human agents',
      colors: ['#3B82F6', '#1D4ED8'], // Blue
    },
    {
      name: 'Sales Assistant',
      description: 'Qualify leads and book demos',
      prompt: 'Create a sales agent that qualifies leads, books demos, follows up with prospects, and manages the sales pipeline',
      colors: ['#10B981', '#059669'], // Green
    },
    {
      name: 'Recruiter',
      description: 'Screen candidates and schedule interviews',
      prompt: 'Create a recruiter agent that screens applicants, asks qualifying questions, schedules interviews, and manages candidate pipeline',
      colors: ['#8B5CF6', '#6D28D9'], // Purple
    },
    {
      name: 'Content Writer',
      description: 'Generate blog posts and social content',
      prompt: 'Create a content writing agent that generates blog posts, social media content, email campaigns, and marketing copy',
      colors: ['#F59E0B', '#D97706'], // Amber
    },
    {
      name: 'Data Analyst',
      description: 'Process data and generate insights',
      prompt: 'Create a data analyst agent that processes datasets, generates insights, creates visualizations, and produces analytical reports',
      colors: ['#EF4444', '#DC2626'], // Red
    },
    {
      name: 'Finance Assistant',
      description: 'Handle invoicing and payments',
      prompt: 'Create a finance agent that sends invoices, tracks payments, sends reminders, and manages accounting workflows',
      colors: ['#EC4899', '#DB2777'], // Pink
    },
    {
      name: 'Tech Support',
      description: 'Troubleshoot technical issues',
      prompt: 'Create a technical support agent that diagnoses issues, provides troubleshooting steps, and escalates complex technical problems',
      colors: ['#06B6D4', '#0891B2'], // Cyan
    },
    {
      name: 'Personal Assistant',
      description: 'Manage tasks and scheduling',
      prompt: 'Create a personal assistant agent that manages calendar, schedules meetings, sends reminders, and coordinates tasks',
      colors: ['#14B8A6', '#0D9488'], // Teal
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <button
            key={agent.name}
            type="button"
            onClick={() => onSelect(agent.prompt)}
            className="group w-full h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 flex flex-col items-center justify-center min-h-[180px]"
          >
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                <AgentOrbAvatar
                  size={64}
                  agentId={agent.name}
                  colors={agent.colors}
                  isStatic={false}
                />
              </div>
              <div className="text-center space-y-1.5 w-full">
                <div className="text-sm font-semibold text-foreground leading-tight">{agent.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem] flex items-center justify-center px-2">
                  {agent.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentsRenderer;

