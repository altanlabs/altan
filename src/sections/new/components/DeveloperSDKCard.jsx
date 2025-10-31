import { m } from 'framer-motion';
import { Code2 } from 'lucide-react';
import React from 'react';

const DeveloperSDKCard = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="md:col-span-4"
    >
      <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-foreground mb-2">Developer SDK</h4>
            <p className="text-xs text-muted-foreground">
              Integrate agents into any React or Next.js app. Switch models effortlessly.
            </p>
          </div>
        </div>

        {/* Code snippet */}
        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30 overflow-x-auto">
          <pre className="text-xs text-foreground/80 font-mono leading-relaxed">
            {`import { Room } from '@altanlabs/sdk';

<Room
  mode="agent"
  agentId="agent-123"
  model="openai/gpt-4o"  // Switch anytime!
/>`}
          </pre>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-muted-foreground">Use it with</span>
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            OpenAI
          </span>
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Anthropic
          </span>
          <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
            xAI
          </span>
          <span className="text-muted-foreground">and more</span>
        </div>
      </div>
    </m.div>
  );
};

export default DeveloperSDKCard;

