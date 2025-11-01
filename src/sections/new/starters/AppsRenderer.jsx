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
    {
      title: 'Build custom forms',
      description: 'Form builder and submissions',
      prompt: 'Create a form builder app with drag-and-drop editor, submission management, and data export',
    },
    {
      title: 'Track my time',
      description: 'Time tracking and timesheets',
      prompt: 'Create a time tracking app with project timers, timesheet approval, and billing reports',
    },
    {
      title: 'Manage invoices',
      description: 'Billing and invoicing',
      prompt: 'Create an invoicing app with client management, invoice generation, payment tracking, and reminders',
    },
    {
      title: 'Handle support tickets',
      description: 'Customer support system',
      prompt: 'Create a support ticket app with ticket creation, assignment, status tracking, and customer portal',
    },
    {
      title: 'Track expenses',
      description: 'Expense management',
      prompt: 'Create an expense tracking app with receipt uploads, category management, and approval workflows',
    },
    {
      title: 'Manage projects',
      description: 'Project planning and tracking',
      prompt: 'Create a project management app with milestones, tasks, team assignments, and progress dashboards',
    },
    {
      title: 'Organize documents',
      description: 'Document management system',
      prompt: 'Create a document management app with file upload, folders, version control, and sharing permissions',
    },
    {
      title: 'Run surveys',
      description: 'Survey creation and analytics',
      prompt: 'Create a survey app with question builder, response collection, and analytics dashboard',
    },
    {
      title: 'Track leads',
      description: 'Sales pipeline management',
      prompt: 'Create a lead tracking app with pipeline stages, activity logging, and conversion analytics',
    },
    {
      title: 'Manage HR',
      description: 'Employee management',
      prompt: 'Create an HR app with employee profiles, leave management, onboarding workflows, and performance reviews',
    },
    {
      title: 'Handle orders',
      description: 'Order management system',
      prompt: 'Create an order management app with order tracking, fulfillment status, inventory sync, and customer notifications',
    },
    {
      title: 'Plan events',
      description: 'Event planning and coordination',
      prompt: 'Create an event planning app with guest lists, vendor management, budget tracking, and schedules',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Start with an example:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {starters.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => onSelect(starter.prompt)}
              className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
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

