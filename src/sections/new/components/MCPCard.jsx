import { m } from 'framer-motion';
import { Plug } from 'lucide-react';
import React from 'react';

const MCPCard = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="md:col-span-2"
    >
      <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
          <Plug className="w-6 h-6 text-foreground" />
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-2">
          Model Context Protocol
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Extend with custom MCP servers
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/50" />
            <span>Custom integrations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/50" />
            <span>Unlimited extensibility</span>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default MCPCard;

