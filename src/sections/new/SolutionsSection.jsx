import { m } from 'framer-motion';
import { ArrowRight, Briefcase, Calendar, DollarSign, HeadphonesIcon, Package, TrendingUp } from 'lucide-react';
import React from 'react';

const SolutionsSection = () => {
  const systems = [
    {
      name: 'Sales System',
      icon: TrendingUp,
      description: 'CRM + Sales Agent that runs outreach and follow-up',
      prompt: `Create a sales system with a CRM and a Sales Agent.

The agent should update lead statuses, remind me to follow up, and draft outreach messages.`,
    },
    {
      name: 'Support System',
      icon: HeadphonesIcon,
      description: 'Support Portal + Agent that answers customer requests',
      prompt: `Create a support system with a help center and a Support Agent.

The agent should answer questions using stored knowledge and escalate when needed.`,
    },
    {
      name: 'Hiring System',
      icon: Briefcase,
      description: 'Careers Page + Recruiter Agent that screens and coordinates candidates',
      prompt: `Create a hiring system with a job portal and a Recruiter Agent.

The agent should screen applicants, request missing info, and schedule interviews.`,
    },
    {
      name: 'Finance System',
      icon: DollarSign,
      description: 'Billing Dashboard + Agent that sends invoices and tracks payments',
      prompt: `Create a finance system with invoicing and a Billing Agent.

The agent should send invoices, track payments, and send polite reminders.`,
    },
    {
      name: 'Operations System',
      icon: Package,
      description: 'Inventory Dashboard + Agent that handles restocking workflows',
      prompt: `Create an operations system with inventory tracking and an Operations Agent.

The agent should update quantities, detect low stock, and suggest reorders.`,
    },
    {
      name: 'Scheduling System',
      icon: Calendar,
      description: 'Calendar + Agent that coordinates tasks and meetings',
      prompt: `Create a scheduling system with calendars and a Coordination Agent.

The agent should find availability, schedule meetings, and send confirmations.`,
    },
  ];

  const handleSystemClick = (prompt) => {
    // Dispatch event to fill prompt
    window.dispatchEvent(
      new CustomEvent('fillHeroPrompt', {
        detail: { prompt },
      }),
    );

    // Smooth scroll to hero section
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="solutions" className="relative w-full py-24 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Software That Runs Itself.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Software + the AI role that operates it.
          </p>
        </m.div>

        {/* Systems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system, index) => (
            <m.button
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleSystemClick(system.prompt)}
              type="button"
              className="group text-left p-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <system.icon className="w-6 h-6 text-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{system.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{system.description}</p>
            </m.button>
          ))}
        </div>

        {/* Tagline */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Not just dashboards. Not just chatbots.{' '}
            <span className="font-semibold text-foreground">Systems that run work on their own.</span>
          </p>
        </m.div>
      </div>
    </section>
  );
};

export default SolutionsSection;
