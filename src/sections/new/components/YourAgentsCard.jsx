import { m } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';

const YourAgentsCard = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="md:col-span-2"
    >
      <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h4 className="text-lg font-semibold text-foreground text-center mb-2">
          Your Agents
        </h4>
        <p className="text-xs text-muted-foreground text-center">
          Create custom agents for any task
        </p>
      </div>
    </m.div>
  );
};

export default YourAgentsCard;

