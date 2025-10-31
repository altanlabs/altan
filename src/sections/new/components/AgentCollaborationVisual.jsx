import { m } from 'framer-motion';
import { Code2, Database, Layout, Plug, Server, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';

import CloudAgentRenderer from './renderers/CloudAgentRenderer';
import GenesisAgentRenderer from './renderers/GenesisAgentRenderer';
import InterfaceAgentRenderer from './renderers/InterfaceAgentRenderer';
import ServicesAgentRenderer from './renderers/ServicesAgentRenderer';
import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';

const agentColors = {
  Interface: ['#f9cf39', '#fb190b'],
  Cloud: ['#00fbff', '#68dffd'],
  Services: ['#ae2cdd', '#ae00ff'],
  Genesis: ['#ffdd00', '#9de5e7'],
};

const agents = [
  { id: 'Interface', name: 'Interface' },
  { id: 'Genesis', name: 'Genesis' },
  { id: 'Cloud', name: 'Cloud' },
  { id: 'Services', name: 'Services' },
];

const agentDetails = {
  Interface: {
    description:
      'Designs and builds beautiful, responsive user interfaces using modern frameworks.',
    capabilities: [
      { icon: Layout, label: 'UI/UX Design', desc: 'Creates intuitive and elegant interfaces' },
      { icon: Code2, label: 'React & Next.js', desc: 'Expert in modern frontend frameworks' },
      {
        icon: Sparkles,
        label: 'Component Libraries',
        desc: 'Implements Shadcn UI and Tailwind CSS',
      },
      { icon: Zap, label: 'Responsive Design', desc: 'Mobile-first, accessible designs' },
    ],
  },
  Genesis: {
    description: 'The agent creator. Builds new specialized agents on demand to expand your team.',
    capabilities: [
      { icon: Sparkles, label: 'Agent Creation', desc: 'Generates new agents for specific tasks' },
      { icon: Code2, label: 'Custom Logic', desc: 'Tailored capabilities for unique needs' },
      { icon: Zap, label: 'Dynamic Scaling', desc: 'Expands team based on project requirements' },
      { icon: Layout, label: 'Integration', desc: 'Seamlessly joins existing workflows' },
    ],
  },
  Cloud: {
    description:
      'Manages databases, infrastructure, and cloud deployments with enterprise-grade reliability.',
    capabilities: [
      { icon: Database, label: 'Database Management', desc: 'PostgreSQL, Supabase, and more' },
      {
        icon: Server,
        label: 'Cloud Infrastructure',
        desc: 'AWS, Vercel, and serverless deployments',
      },
      { icon: Zap, label: 'Real-time Sync', desc: 'WebSocket and live data synchronization' },
      { icon: Code2, label: 'Backend APIs', desc: 'RESTful and GraphQL API design' },
    ],
  },
  Services: {
    description:
      'Integrates third-party APIs and external services to extend your application capabilities.',
    capabilities: [
      { icon: Plug, label: 'API Integration', desc: 'Connects to any REST or GraphQL API' },
      { icon: Code2, label: 'Authentication', desc: 'OAuth, JWT, and secure auth flows' },
      { icon: Zap, label: 'Payment Processing', desc: 'Stripe, PayPal integration' },
      { icon: Server, label: 'External Services', desc: 'Email, SMS, storage, and more' },
    ],
  },
};

const AgentCollaborationVisual = () => {
  const [selectedAgent, setSelectedAgent] = useState('Interface');

  return (
    <div className="mx-auto w-full space-y-12">
      {/* Orbs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
        {agents.map((agent, index) => {
          const isSelected = selectedAgent === agent.id;
          return (
            <m.button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className="flex flex-col items-center gap-4 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Orb */}
              <div className="relative">
                <m.div
                  animate={{
                    opacity: isSelected ? 1 : 0.6,
                    scale: isSelected ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* Glow effect on selected */}
                  {isSelected && (
                    <m.div
                      className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <AgentOrbAvatar
                    size={140}
                    agentId={agent.id}
                    colors={agentColors[agent.id]}
                    agentState={null}
                    isStatic={false}
                  />
                </m.div>
              </div>

              {/* Agent Name */}
              <div className="text-center">
                <m.div
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className={`text-lg font-semibold transition-colors ${
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {agent.name}
                  </span>
                </m.div>
              </div>
            </m.button>
          );
        })}
      </div>

      {/* Agent Details Below */}
      <m.div
        key={selectedAgent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-6xl mx-auto"
      >
        {selectedAgent === 'Interface' ? (
          <InterfaceAgentRenderer description={agentDetails[selectedAgent].description} />
        ) : selectedAgent === 'Genesis' ? (
          <GenesisAgentRenderer description={agentDetails[selectedAgent].description} />
        ) : selectedAgent === 'Cloud' ? (
          <CloudAgentRenderer description={agentDetails[selectedAgent].description} />
        ) : selectedAgent === 'Services' ? (
          <ServicesAgentRenderer description={agentDetails[selectedAgent].description} />
        ) : (
          /* Default Description for other agents */
          <p className="text-lg text-muted-foreground text-center leading-relaxed">
            {agentDetails[selectedAgent].description}
          </p>
        )}
      </m.div>
    </div>
  );
};

export default AgentCollaborationVisual;
