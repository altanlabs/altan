import { m } from 'framer-motion';
import { Phone } from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';
import { GlassButton } from '../../../components/ui/glass-button';
import { useVoiceConversation } from '../../../providers/voice/VoiceConversationProvider';

const DEMO_AGENT_ID = 'f3a00594-aaf7-4cbd-a9a6-25c804895de9';
const DEMO_AGENT_ELEVENLABS_ID = 'agent_01jy1hqg8jehq8v9zd7j9qxa2a';

const VoiceCallCard = () => {
  const { isConnected, isConnecting, startConversation, stopConversation } = useVoiceConversation();
  const [error, setError] = useState(null);

  const handleStartCall = useCallback(async () => {
    try {
      setError(null);
      const success = await startConversation({
        agentId: DEMO_AGENT_ELEVENLABS_ID,
        onConnect: () => {
          console.log('✅ Voice call connected');
        },
        onDisconnect: () => {
          console.log('🛑 Voice call disconnected');
        },
        onError: (err) => {
          console.error('❌ Voice call error:', err);
          setError('Failed to start voice call. Please check your microphone permissions.');
        },
      });

      if (!success) {
        setError('Could not start call. Please try again.');
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start voice call');
    }
  }, [startConversation]);

  const handleStopCall = useCallback(() => {
    stopConversation();
  }, [stopConversation]);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="md:col-span-2 md:row-span-2"
    >
      <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors flex flex-col group">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-1">AI Voice Agents</h4>
            <p className="text-xs text-muted-foreground">Talk to your agents naturally</p>
          </div>
        </div>

        {/* Center - Orb with Overlay Button */}
        <div className="flex-1 flex flex-col justify-center items-center">
          {/* Agent Orb Avatar with Overlay Button */}
          <div className="relative">
            <AgentOrbAvatar
              size={220}
              agentId={DEMO_AGENT_ID}
              colors={['#00fbff', '#68dffd']}
              agentState={isConnected ? 'speaking' : isConnecting ? 'thinking' : null}
              isStatic={false}
            />

            {/* Overlay Button - Static glass button with icon and text */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isConnected ? (
                <GlassButton
                  onClick={handleStartCall}
                  disabled={isConnecting}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  contentClassName="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {isConnecting ? 'Connecting...' : 'Try a Call'}
                </GlassButton>
              ) : (
                <GlassButton
                  onClick={handleStopCall}
                  className="!bg-red-500/20 !border-red-500/30 hover:!bg-red-500/30"
                  contentClassName="flex items-center gap-2 text-red-400"
                >
                  <Phone className="w-4 h-4" />
                  End Call
                </GlassButton>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/50" />
            <span>Low latency conversational AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/50" />
            <span>31 languages • 1000s of voices</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/50" />
            <span>Web, mobile, or telephony</span>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default VoiceCallCard;
