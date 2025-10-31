import { m, useAnimation } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React, { useState } from 'react';

import { AgentOrbAvatar } from '../../../../components/agents/AgentOrbAvatar';
import { GlassButton } from '../../../../components/ui/glass-button';

const GenesisAgentRenderer = ({ description }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const controls1 = useAnimation();
  const controls2 = useAnimation();

  const handleCreateAgent = async () => {
    setIsCreating(true);
    setShowNewAgent(false);

    // Start division animation
    // Stage 1: Original orb stretches
    await controls1.start({
      scaleX: 1.3,
      transition: { duration: 0.6, ease: 'easeInOut' },
    });

    // Stage 2: Start showing second orb
    setShowNewAgent(true);
    
    // Wait a bit for React to render the new agent before animating
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Move both orbs apart
    await Promise.all([
      controls1.start({
        x: -80,
        scaleX: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
      }),
      controls2.start({
        x: 80,
        opacity: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
      }),
    ]);

    // Stage 3: Brief pause - keep both agents visible
    await new Promise(resolve => setTimeout(resolve, 1500));

    // End state - both agents remain visible
    setIsCreating(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Left side - Description */}
      <m.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6 flex flex-col justify-center h-full"
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ffdd00] to-[#9de5e7] bg-clip-text text-transparent">
            Creating New Agents
          </h3>
        </m.div>

        <m.p
          className="text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description}
        </m.p>

        <m.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Dynamic agent generation</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Custom capabilities tailored to your needs</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Seamless team integration</span>
          </div>
        </m.div>

        {/* Create Agent Button */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-start"
        >
          <GlassButton
            onClick={handleCreateAgent}
            disabled={isCreating}
            size="default"
            className="disabled:opacity-70 disabled:cursor-not-allowed"
            contentClassName="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isCreating ? 'Creating...' : 'Create New Agent'}
          </GlassButton>
        </m.div>
      </m.div>

      {/* Right side - Cell Division Animation */}
      <m.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative flex items-center justify-center min-h-[400px]"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Original/Parent Agent Orb */}
          <m.div
            animate={controls1}
            initial={{ x: 0, scaleX: 1 }}
            className="absolute"
          >
            <AgentOrbAvatar
              size={180}
              agentId="Genesis"
              colors={['#ffdd00', '#9de5e7']}
              agentState={isCreating ? 'thinking' : null}
              isStatic={false}
            />
            
            {/* Glow effect during creation */}
            {isCreating && (
              <m.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ffdd00]/30 to-[#9de5e7]/30 rounded-full blur-3xl scale-150" />
              </m.div>
            )}
          </m.div>

          {/* New Agent Orb */}
          {showNewAgent && (
            <m.div
              animate={controls2}
              initial={{ x: 0, opacity: 0 }}
              className="absolute z-10"
            >
              <AgentOrbAvatar
                size={180}
                agentId="NewAgent"
                colors={['#ff6b35', '#4a90e2']}
                agentState="thinking"
                isStatic={false}
              />
              
              {/* Birth effect */}
              <m.div
                className="absolute inset-0 -z-10 pointer-events-none"
                initial={{ opacity: 1, scale: 1.5 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/50 to-[#4a90e2]/50 rounded-full blur-2xl" />
              </m.div>
            </m.div>
          )}

          {/* Connection line during split */}
          {isCreating && showNewAgent && (
            <m.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.5 }}
              transition={{ duration: 0.4 }}
              className="absolute w-32 h-0.5 bg-gradient-to-r from-[#ffdd00] via-white to-[#ff6b35]"
              style={{ transformOrigin: 'center' }}
            />
          )}

          {/* Particles effect */}
          {isCreating && (
            <>
              {[...Array(8)].map((_, i) => (
                <m.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-[#ffdd00] to-[#9de5e7] rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 8) * 150,
                    y: Math.sin((i * Math.PI * 2) / 8) * 150,
                    opacity: 0,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Status text */}
        {isCreating && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {!showNewAgent ? 'Duplicating...' : 'New agent is born!'}
            </p>
          </m.div>
        )}
      </m.div>
    </div>
  );
};

export default GenesisAgentRenderer;

