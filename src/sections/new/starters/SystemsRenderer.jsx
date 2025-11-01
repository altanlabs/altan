import React from 'react';

import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';

const SystemsRenderer = ({ onSelect }) => {
  const systems = [
    {
      name: 'Sales System',
      software: 'CRM',
      agent: 'Sales Agent',
      outcome: 'Runs outreach & follow-ups',
      colors: ['#3B82F6', '#1D4ED8'], // Blue
      prompt: `Create a sales system with a CRM and a Sales Agent.

The agent should update lead statuses, remind me to follow up, and draft outreach messages.`,
    },
    {
      name: 'Support System',
      software: 'Help Center',
      agent: 'Support Agent',
      outcome: 'Answers questions automatically',
      colors: ['#10B981', '#059669'], // Green
      prompt: `Create a support system with a help center and a Support Agent.

The agent should answer questions using stored knowledge and escalate when needed.`,
    },
    {
      name: 'Hiring System',
      software: 'Job Portal',
      agent: 'Recruiter Agent',
      outcome: 'Screens & schedules candidates',
      colors: ['#8B5CF6', '#6D28D9'], // Purple
      prompt: `Create a hiring system with a job portal and a Recruiter Agent.

The agent should screen applicants, request missing info, and schedule interviews.`,
    },
    {
      name: 'Finance System',
      software: 'Invoicing',
      agent: 'Billing Agent',
      outcome: 'Sends invoices & tracks payments',
      colors: ['#F59E0B', '#D97706'], // Amber
      prompt: `Create a finance system with invoicing and a Billing Agent.

The agent should send invoices, track payments, and send polite reminders.`,
    },
    {
      name: 'Operations System',
      software: 'Inventory',
      agent: 'Operations Agent',
      outcome: 'Manages stock & reorders',
      colors: ['#EF4444', '#DC2626'], // Red
      prompt: `Create an operations system with inventory tracking and an Operations Agent.

The agent should update quantities, detect low stock, and suggest reorders.`,
    },
    {
      name: 'Scheduling System',
      software: 'Calendar',
      agent: 'Coordination Agent',
      outcome: 'Books meetings automatically',
      colors: ['#EC4899', '#DB2777'], // Pink
      prompt: `Create a scheduling system with calendars and a Coordination Agent.

The agent should find availability, schedule meetings, and send confirmations.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Concept Explanation */}
      <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Systems = Software + Agent.</span>
          {' '}Not just an app. Not just a chatbot. A complete solution that runs the work.
        </p>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((system) => (
          <button
            key={system.name}
            type="button"
            onClick={() => onSelect(system.prompt)}
            className="group w-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
          >
            <div className="space-y-4">
              {/* System Name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0">
                  <AgentOrbAvatar
                    size={40}
                    agentId={system.name}
                    colors={system.colors}
                    isStatic={false}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-foreground">{system.name}</h4>
                  <p className="text-xs text-muted-foreground">{system.outcome}</p>
                </div>
              </div>

              {/* Components */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/30 text-center">
                  <span className="text-muted-foreground">{system.software}</span>
                </div>
                <span className="text-muted-foreground">+</span>
                <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/30 text-center">
                  <span className="text-muted-foreground">{system.agent}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemsRenderer;

