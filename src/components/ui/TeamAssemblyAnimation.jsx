import { useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

const AGENT_AVATARS = [
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/1.jpeg',
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/2.jpeg',
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/3.jpeg',
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/4.jpeg',
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/5.jpeg',
  'https://storage.googleapis.com/logos-chatbot-optimai/avatars/6.jpeg',
];

const CONVERSATIONS = [
  {
    agentIndex: 0,
    name: 'Altan',
    message: "Let's help you get started!",
    delay: 800,
  },
  {
    agentIndex: 1,
    name: 'Designer',
    message: 'Creating the interface...',
    delay: 2000,
  },
  {
    agentIndex: 2,
    name: 'Developer',
    message: 'Setting up the architecture',
    delay: 3200,
  },
  {
    agentIndex: 3,
    name: 'Database Expert',
    message: 'Preparing data structures',
    delay: 4400,
  },
  {
    agentIndex: 4,
    name: 'QA Agent',
    message: 'Ready to ensure quality',
    delay: 5600,
  },
  {
    agentIndex: 5,
    name: 'Deploy Agent',
    message: 'Standing by for launch',
    delay: 6800,
  },
];

function AgentBubble({ avatar, name, message, index, isVisible }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Position agents in a circular pattern
  const angle = (index * Math.PI * 2) / AGENT_AVATARS.length;
  const radius = 280;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Agent Avatar */}
        <m.div
          animate={{
            scale: isVisible ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <div
            className={`w-16 h-16 rounded-full border-2 overflow-hidden ${
              isVisible
                ? 'border-blue-400 shadow-lg shadow-blue-500/50'
                : isDark
                ? 'border-white/20'
                : 'border-gray-300/50'
            }`}
            style={{
              transition: 'all 0.3s ease',
            }}
          >
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Active indicator */}
          <AnimatePresence>
            {isVisible && (
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
              />
            )}
          </AnimatePresence>
        </m.div>

        {/* Chat Bubble */}
        <AnimatePresence>
          {isVisible && (
            <m.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.9 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="relative max-w-[160px]"
            >
              {/* Glass bubble */}
              <div
                className="px-4 py-2 rounded-2xl backdrop-blur-xl border shadow-lg"
                style={{
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                }}
              >
                {/* Agent name */}
                <div
                  className="text-[10px] font-semibold mb-1"
                  style={{
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {name}
                </div>

                {/* Message */}
                <div
                  className="text-xs leading-relaxed"
                  style={{
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {message}
                </div>
              </div>

              {/* Bubble tail */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  top: '-6px',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: `6px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)'
                  }`,
                }}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
}

function CentralLogo() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <m.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
    >
      <div
        className="w-24 h-24 rounded-full backdrop-blur-2xl border-2 flex items-center justify-center shadow-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
          boxShadow: isDark
            ? '0 20px 60px rgba(59, 130, 246, 0.3)'
            : '0 20px 60px rgba(59, 130, 246, 0.2)',
        }}
      >
        {/* Pulsing effect */}
        <m.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent)',
          }}
        />

        {/* Altan logo/icon */}
        <div
          className="text-4xl font-bold z-10"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          A
        </div>
      </div>

      {/* Rotating orbital ring */}
      <m.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
        }}
      >
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: '50%',
            right: 0,
            transform: 'translate(50%, -50%)',
            background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          }}
        />
      </m.div>
    </m.div>
  );
}

function ConnectionLines({ activeIndices }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {activeIndices.map((agentIndex) => {
        const angle = (agentIndex * Math.PI * 2) / AGENT_AVATARS.length;
        const radius = 280;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 960;
        const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 540;

        return (
          <m.line
            key={agentIndex}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            x1={centerX}
            y1={centerY}
            x2={centerX + x}
            y2={centerY + y}
            stroke={isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        );
      })}
    </svg>
  );
}

export function TeamAssemblyAnimation() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [visibleConversations, setVisibleConversations] = useState([]);

  useEffect(() => {
    // Show conversations sequentially
    const timeouts = CONVERSATIONS.map((conv) =>
      setTimeout(() => {
        setVisibleConversations((prev) => [...prev, conv.agentIndex]);
      }, conv.delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
        }}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <m.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              opacity: 0,
            }}
            animate={{
              y: [
                null,
                Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              ],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(59, 130, 246, 0.3)',
            }}
          />
        ))}
      </div>

      {/* Connection lines */}
      <ConnectionLines activeIndices={visibleConversations} />

      {/* Main content container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-[800px] max-h-[800px]">
          {/* Central logo */}
          <CentralLogo />

          {/* Agent bubbles */}
          {CONVERSATIONS.map((conv, index) => (
            <AgentBubble
              key={index}
              avatar={AGENT_AVATARS[conv.agentIndex]}
              name={conv.name}
              message={conv.message}
              index={index}
              isVisible={visibleConversations.includes(conv.agentIndex)}
            />
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
      >
        <div
          className="text-sm tracking-wide uppercase font-light"
          style={{
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          }}
        >
          Your AI team is assembling...
        </div>
      </m.div>
    </div>
  );
}
