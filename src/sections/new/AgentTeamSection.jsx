import { m } from 'framer-motion';
import { Play } from 'lucide-react';
import React from 'react';

import AgentCollaborationVisual from './components/AgentCollaborationVisual';

const AgentTeamSection = () => {
  return (
    <section
      id="agents"
      className="relative w-full py-24 md:py-32"
    >
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
            Your AI product team.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            The first truly multi-agent system. Specialized AI agents working together in chat
            rooms, building software by agents, for agents.
          </p>
          {/* Demo Button */}
          <div className="mt-12 text-center">
            <a href="/demo">
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 mt-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-medium transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                View Interactive Demo
              </m.button>
            </a>
          </div>
        </m.div>

        {/* Interactive Agent Explorer */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AgentCollaborationVisual />
        </m.div>
      </div>
    </section>
  );
};

export default AgentTeamSection;
