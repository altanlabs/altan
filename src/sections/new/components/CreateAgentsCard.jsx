import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';

const CreateAgentsCard = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="md:col-span-2 md:row-span-2"
    >
      <div className="h-full p-6 rounded-2xl border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-colors flex flex-col justify-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        <h4 className="text-2xl font-semibold text-foreground text-center mb-3">
          Create New Team Members
        </h4>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Describe the role. Genesis creates the agent — ready to work with the rest of the team.
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span>No coding required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span>Deploy in minutes</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span>Unlimited possibilities</span>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default CreateAgentsCard;

