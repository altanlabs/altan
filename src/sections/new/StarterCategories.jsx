import { m } from 'framer-motion';
import { BarChart3, Bot, Globe, LayoutGrid, Layers } from 'lucide-react';
import React from 'react';

import { AgentOrbAvatar } from '../../components/agents/AgentOrbAvatar';
import AltanerSectionCategory from '../../components/templates/AltanerSectionCategory';

// Website Templates Grid Component
const WebsiteTemplatesGrid = ({ onSelect }) => {
  const handleTemplateClick = (templateId) => {
    // When a template is clicked, we could either:
    // 1. Fill a prompt to remix the template
    // 2. Or handle it separately
    // For now, let's create a prompt to remix the template
    onSelect(`Remix template ${templateId} and customize it for my needs`);
  };

  return (
    <AltanerSectionCategory
      category="sites"
      title="Templates"
      initialExpanded={true}
      onTemplateClick={handleTemplateClick}
    />
  );
};

// Websites Renderer
const WebsitesRenderer = ({ onSelect }) => {
  const starters = [
    {
      title: 'Portfolio',
      description: 'Showcase your work with a modern portfolio',
      prompt: 'Create a modern portfolio website with projects showcase, about section, and contact form',
    },
    {
      title: 'Landing Page',
      description: 'Launch products with high-converting pages',
      prompt: 'Create a landing page for a SaaS product with hero section, features, pricing, and CTA',
    },
    {
      title: 'E-commerce',
      description: 'Sell products online with a complete store',
      prompt: 'Create an e-commerce website with product catalog, shopping cart, and checkout',
    },
    {
      title: 'Blog',
      description: 'Share your thoughts and stories',
      prompt: 'Create a blog website with article listing, individual posts, and author profiles',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Get Started Section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Get started with</h3>
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

      {/* Templates Section */}
      <div>
        <WebsiteTemplatesGrid onSelect={onSelect} />
      </div>
    </div>
  );
};

// Visualizations Renderer
const VisualizationsRenderer = ({ onSelect }) => {
  const prompts = [
    { label: 'Dashboard', prompt: 'Create an analytics dashboard with charts showing sales trends, user growth, and key metrics' },
    { label: 'Chart Gallery', prompt: 'Create a data visualization gallery with bar charts, line graphs, and pie charts' },
    { label: 'Report', prompt: 'Create an interactive report with data tables, charts, and export functionality' },
    { label: 'Infographic', prompt: 'Create an animated infographic showing statistics and key insights' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">Choose a visualization type:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.label}
            type="button"
            onClick={() => onSelect(prompt.prompt)}
            className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-sm text-foreground hover:bg-background hover:border-primary/20 transition-all duration-200 text-left"
          >
            <div className="font-medium">{prompt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Agents Renderer
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

// Systems Renderer - Shows Software + Agent combination
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

// Main StarterCategories Component
const StarterCategories = ({ onSelectPrompt, selectedCategory, onCategoryChange }) => {
  const categories = [
    {
      id: 'websites',
      label: 'Websites',
      icon: Globe,
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: LayoutGrid,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: Bot,
    },
    {
      id: 'systems',
      label: 'Systems',
      icon: Layers,
    },
    {
      id: 'visualizations',
      label: 'Visualizations',
      icon: BarChart3,
    },
  ];

  const handleCategoryClick = (categoryId) => {
    // Toggle: if clicking the same category, deselect it
    if (selectedCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Category Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                isSelected
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-background hover:border-primary/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
              {isSelected && (
                <span className="ml-1 text-xs">×</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Renderer - Only show if a category is selected */}
      {selectedCategory && (
        <m.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedCategory === 'websites' && <WebsitesRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'visualizations' && <VisualizationsRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'agents' && <AgentsRenderer onSelect={onSelectPrompt} />}
          {selectedCategory === 'systems' && <SystemsRenderer onSelect={onSelectPrompt} />}
        </m.div>
      )}
    </div>
  );
};

export default StarterCategories;
