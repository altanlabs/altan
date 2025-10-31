import { m } from 'framer-motion';
import { ArrowRight, Briefcase, Code2, Palette, Shield, Sparkles, Users } from 'lucide-react';
import React from 'react';

const AgentTeamSection = () => {
  const agents = [
    { name: 'Full-Stack Engineers', icon: Code2, description: 'Build robust applications' },
    { name: 'UX Designers', icon: Palette, description: 'Craft beautiful interfaces' },
    { name: 'Product Managers', icon: Briefcase, description: 'Define product strategy' },
    { name: 'DevOps Engineers', icon: Shield, description: 'Deploy & scale infrastructure' },
  ];

  return (
    <section id="agents" className="relative w-full py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Collective AGI</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Your AI product team.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Altan works like a real development team.
            Product, Design, Engineering, QA, and DevOps.
            All collaborating to build and operate your system.
          </p>
        </m.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card - Main Concept */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 md:row-span-2"
          >
            <div className="h-full p-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-semibold text-foreground mb-4">
                Collaborative Intelligence
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Unlike single-agent solutions, Altan orchestrates specialized AI agents that work
                together like a real development team. Each agent brings deep expertise in their
                domain, collaborating in real-time to transform your ideas into production-ready
                software.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-1">10x Faster Development</p>
                    <p className="text-sm text-muted-foreground">
                      From concept to deployment in days, not months
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Production-Ready Quality</p>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade code with built-in best practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Autonomous Collaboration</p>
                    <p className="text-sm text-muted-foreground">
                      Agents communicate and coordinate without human intervention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Agent Role Cards */}
          {agents.map((agent, index) => (
            <m.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="md:col-span-1"
            >
              <div className="h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <agent.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
              </div>
            </m.div>
          ))}

          {/* Additional Capabilities Card */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="md:col-span-3"
          >
            <div className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">And more specialized agents</span>{' '}
                  including QA Specialists, Data Scientists, Security Experts, and Technical
                  Writers—all working together to deliver exceptional results.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default AgentTeamSection;
