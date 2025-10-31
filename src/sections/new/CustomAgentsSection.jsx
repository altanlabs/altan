import { m } from 'framer-motion';
import React from 'react';

import AnyLLMProviderCard from './components/AnyLLMProviderCard';
import CreateAgentsCard from './components/CreateAgentsCard';
import DeveloperSDKCard from './components/DeveloperSDKCard';
import MCPCard from './components/MCPCard';
import VoiceCallCard from './components/VoiceCallCard';
import YourAgentsCard from './components/YourAgentsCard';

const CustomAgentsSection = () => {
  return (
    <section className="relative w-full py-24 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            Create Your Own Agents
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            The Altan SDK lets you create new specialized agents that plug into the team.
          </p>
          <p className="text-lg text-muted-foreground/90 max-w-3xl mx-auto">
            Describe the role, define its responsibilities, or connect APIs — Genesis assembles them automatically.
          </p>
        </m.div>

        {/* Bento Grid Layout */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 lg:gap-6">
            <CreateAgentsCard />
            <YourAgentsCard />
            <VoiceCallCard />
            <MCPCard />
            <DeveloperSDKCard />
            <AnyLLMProviderCard />
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default CustomAgentsSection;

