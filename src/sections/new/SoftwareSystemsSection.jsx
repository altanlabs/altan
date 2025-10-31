import { m } from 'framer-motion';
import { Cpu } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const SoftwareSystemsSection = () => {
  const systems = [
    {
      title: 'Sales System',
      description: 'CRM + Sales Agent that follows up and drafts outreach messages.',
      prompt:
        'Create a Sales System with a CRM and a Sales Agent. The agent should update lead statuses, remind me to follow up, and draft outreach messages in my tone.',
    },
    {
      title: 'Support System',
      description: 'Support portal + Agent that answers customer requests.',
      prompt:
        'Create a Support System with a customer portal and a Support Agent that reads incoming requests, suggests or sends replies, and escalates when needed.',
    },
    {
      title: 'Hiring System',
      description: 'Careers page + Recruiter Agent that screens and coordinates candidates.',
      prompt:
        'Create a Hiring System with a careers page and a Recruiter Agent that reviews applications, schedules interviews, and keeps candidates updated.',
    },
    {
      title: 'Finance System',
      description: 'Billing dashboard + Agent that sends invoices and tracks payments.',
      prompt:
        'Create a Finance System with a billing dashboard and a Finance Agent that sends invoices, monitors payment status, and reminds clients when overdue.',
    },
    {
      title: 'Operations System',
      description: 'Task & inventory dashboard + Agent that coordinates workflows.',
      prompt:
        'Create an Operations System with a dashboard and an Operations Agent that assigns tasks, tracks progress, and coordinates delivery steps.',
    },
    {
      title: 'Scheduling System',
      description: 'Calendar interface + Agent that manages meetings and availability.',
      prompt:
        'Create a Scheduling System with a calendar and a Scheduling Agent that books meetings, reschedules automatically, and avoids conflicts.',
    },
  ];

  const handleSystemClick = (prompt) => {
    // Scroll to hero input and fill it with the prompt
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroOffset = heroSection.offsetTop - 80;
      window.scrollTo({
        top: heroOffset,
        behavior: 'smooth',
      });

      // Dispatch custom event to fill the prompt
      window.dispatchEvent(new CustomEvent('fillHeroPrompt', { detail: { prompt } }));
    }
  };

  return (
    <section
      id="systems"
      className="relative w-full py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm mb-6">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Use cases</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Software that runs itself.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Software + the AI role that operates it.
          </p>
        </m.div>

        {/* Systems Grid */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {systems.map((system, index) => (
            <m.button
              key={system.title}
              onClick={() => handleSystemClick(system.prompt)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
              className="group p-8 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/20 transition-all duration-300 text-left"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{system.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {system.description}
                </p>
              </div>
            </m.button>
          ))}
        </m.div>

        {/* Footer Text */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-6"
        >
          <p className="text-sm text-muted-foreground">
            Not just dashboards. Not just chatbots.
            <br />
            <span className="font-semibold text-foreground">
              Systems that run work on their own.
            </span>
          </p>

          <Link to="/marketplace">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 mt-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-medium transition-all duration-300"
            >
              Explore community
            </m.button>
          </Link>
        </m.div>
      </div>
    </section>
  );
};

export default SoftwareSystemsSection;
