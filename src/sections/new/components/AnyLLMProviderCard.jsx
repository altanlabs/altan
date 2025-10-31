import { m } from 'framer-motion';
import { Bot } from 'lucide-react';
import React from 'react';

const AnyLLMProviderCard = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 1.0 }}
      className="md:col-span-2"
    >
      <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors flex flex-col justify-center">
        <div className="flex items-center justify-center mb-3">
          <Bot className="w-8 h-8 text-foreground" />
        </div>
        <h4 className="text-lg font-semibold text-foreground text-center mb-2">
          Any LLM Provider
        </h4>
        <p className="text-xs text-muted-foreground text-center">
          Switch between OpenAI, Anthropic, xAI, and more with one line of code
        </p>
      </div>
    </m.div>
  );
};

export default AnyLLMProviderCard;

