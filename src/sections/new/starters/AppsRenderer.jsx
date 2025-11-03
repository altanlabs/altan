import React from 'react';

import useLocales from '../../../locales/useLocales';

const AppsRenderer = ({ onSelect }) => {
  const { translate } = useLocales();

  const starters = [
    {
      title: translate('starters.apps.manageTeam.title'),
      description: translate('starters.apps.manageTeam.description'),
      prompt: 'Create a team management app with task boards, team members, and progress tracking',
    },
    {
      title: translate('starters.apps.trackInventory.title'),
      description: translate('starters.apps.trackInventory.description'),
      prompt: 'Create an inventory management app with stock tracking, alerts, and reporting',
    },
    {
      title: translate('starters.apps.organizeContacts.title'),
      description: translate('starters.apps.organizeContacts.description'),
      prompt: 'Create a CRM app with contact management, notes, and interaction history',
    },
    {
      title: translate('starters.apps.runBookings.title'),
      description: translate('starters.apps.runBookings.description'),
      prompt: 'Create a booking app with calendar, availability management, and customer notifications',
    },
    {
      title: translate('starters.apps.collectFeedback.title'),
      description: translate('starters.apps.collectFeedback.description'),
      prompt: 'Create a feedback form with rating, comments, category selection, and thank you message',
    },
    {
      title: translate('starters.apps.trackTime.title'),
      description: translate('starters.apps.trackTime.description'),
      prompt: 'Create a time tracking app with project timers, timesheet approval, and billing reports',
    },
    {
      title: translate('starters.apps.manageInvoices.title'),
      description: translate('starters.apps.manageInvoices.description'),
      prompt: 'Create an invoicing app with client management, invoice generation, payment tracking, and reminders',
    },
    {
      title: translate('starters.apps.handleTickets.title'),
      description: translate('starters.apps.handleTickets.description'),
      prompt: 'Create a support ticket app with ticket creation, assignment, status tracking, and customer portal',
    },
    {
      title: translate('starters.apps.trackExpenses.title'),
      description: translate('starters.apps.trackExpenses.description'),
      prompt: 'Create an expense tracking app with receipt uploads, category management, and approval workflows',
    },
    {
      title: translate('starters.apps.manageProjects.title'),
      description: translate('starters.apps.manageProjects.description'),
      prompt: 'Create a project management app with milestones, tasks, team assignments, and progress dashboards',
    },
    {
      title: translate('starters.apps.organizeDocuments.title'),
      description: translate('starters.apps.organizeDocuments.description'),
      prompt: 'Create a document management app with file upload, folders, version control, and sharing permissions',
    },
    {
      title: translate('starters.apps.runSurveys.title'),
      description: translate('starters.apps.runSurveys.description'),
      prompt: 'Create a survey app with question builder, response collection, and analytics dashboard',
    },
    {
      title: translate('starters.apps.trackLeads.title'),
      description: translate('starters.apps.trackLeads.description'),
      prompt: 'Create a lead tracking app with pipeline stages, activity logging, and conversion analytics',
    },
    {
      title: translate('starters.apps.manageHR.title'),
      description: translate('starters.apps.manageHR.description'),
      prompt: 'Create an HR app with employee profiles, leave management, onboarding workflows, and performance reviews',
    },
    {
      title: translate('starters.apps.handleOrders.title'),
      description: translate('starters.apps.handleOrders.description'),
      prompt: 'Create an order management app with order tracking, fulfillment status, inventory sync, and customer notifications',
    },
    {
      title: translate('starters.apps.planEvents.title'),
      description: translate('starters.apps.planEvents.description'),
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
