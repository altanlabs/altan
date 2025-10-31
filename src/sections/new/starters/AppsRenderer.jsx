import React from 'react';

const AppsRenderer = ({ onSelect }) => {
  const starters = [
    {
      title: 'Manage my team',
      description: 'Dashboard with task management',
      prompt: 'Create a team management app with task boards, team members, and progress tracking',
    },
    {
      title: 'Track my inventory',
      description: 'Inventory management system',
      prompt: 'Create an inventory management app with stock tracking, alerts, and reporting',
    },
    {
      title: 'Organize my contacts',
      description: 'CRM and contact manager',
      prompt: 'Create a CRM app with contact management, notes, and interaction history',
    },
    {
      title: 'Run my bookings',
      description: 'Scheduling and appointments',
      prompt: 'Create a booking app with calendar, availability management, and customer notifications',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Start with an example:</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {starters.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => onSelect(starter.prompt)}
              className="flex-shrink-0 w-72 p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
            >
              <div className="space-y-2">
                <div className="text-base font-semibold text-foreground">{starter.title}</div>
                <div className="text-sm text-muted-foreground">{starter.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppsRenderer;

