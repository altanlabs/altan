import { Typography } from '@mui/material';
import { m } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import V2TopBar from './components/V2TopBar';
import V2CompactFooter from './components/V2CompactFooter';
import ChatMessage from './onboarding/components/ChatMessage';
import EnhancedCommandInput from './components/EnhancedCommandInput';
import useResponsive from '../../hooks/useResponsive';

export const AGENT_IMAGES = [
  '/agents/1.png',
  '/agents/2.png',
  '/agents/3.png',
  '/agents/4.png',
  '/agents/5.jpeg',
];

const LandingPage = () => {
  const isMobile = useResponsive('down', 'sm');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromDemo = params.get('from') === 'demo';
  
  const [step, setStep] = useState(0);

  // Auto-progress through messages
  useEffect(() => {
    if (fromDemo) {
      if (step === 0) {
        setTimeout(() => setStep(1), 500);
      } else if (step === 1) {
        setTimeout(() => setStep(2), 3000);
      } else if (step === 2) {
        setTimeout(() => setStep(3), 2500);
      } else if (step === 3) {
        setTimeout(() => setStep(4), 3000);
      }
    } else {
      // Direct entry - show input immediately
      setStep(4);
    }
  }, [step, fromDemo]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>Altan · Your Agentic Business OS</title>
      </Helmet>

      {/* Animated Agent Spheres Background */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black overflow-hidden pointer-events-none"
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
          zIndex: -1,
        }}
      >
        {/* Animated Agent Spheres */}
        {[
          // Large spheres - more prominent, slower movement
          { id: 1, size: isMobile ? 85 : 125, top: '8%', left: '12%', delay: 0, duration: 20, blur: isMobile ? 3 : 5, opacity: 0.45, imageIndex: 1 },
          { id: 3, size: isMobile ? 95 : 135, top: '65%', right: '8%', delay: 3, duration: 24, blur: isMobile ? 4 : 6, opacity: 0.42, imageIndex: 1 },
          { id: 5, size: isMobile ? 80 : 120, top: '82%', left: '18%', delay: 6, duration: 22, blur: isMobile ? 3 : 5, opacity: 0.44, imageIndex: 3 },

          // Medium spheres - balanced presence
          { id: 7, size: isMobile ? 65 : 95, top: '28%', right: '22%', delay: 2, duration: 18, blur: isMobile ? 2 : 4, opacity: 0.38, imageIndex: 0 },
          { id: 9, size: isMobile ? 70 : 105, top: '48%', left: '8%', delay: 5, duration: 20, blur: isMobile ? 3 : 4, opacity: 0.40, imageIndex: 4 },
          { id: 11, size: isMobile ? 60 : 90, top: '72%', right: '32%', delay: 8, duration: 21, blur: isMobile ? 2 : 3, opacity: 0.37, imageIndex: 3 },

          // Small spheres - subtle, atmospheric
          { id: 2, size: isMobile ? 50 : 70, top: '18%', left: '42%', delay: 1.5, duration: 16, blur: isMobile ? 2 : 3, opacity: 0.32, imageIndex: 2 },
          { id: 4, size: isMobile ? 55 : 78, top: '38%', right: '48%', delay: 4.5, duration: 17, blur: isMobile ? 2 : 3, opacity: 0.34, imageIndex: 2 },
          { id: 6, size: isMobile ? 45 : 65, top: '58%', left: '52%', delay: 3.5, duration: 15, blur: isMobile ? 1 : 2, opacity: 0.30, imageIndex: 3 },
          { id: 8, size: isMobile ? 52 : 75, top: '88%', right: '18%', delay: 7, duration: 18, blur: isMobile ? 2 : 3, opacity: 0.35, imageIndex: 4 },
        ].map((sphere) => (
          <div
            key={sphere.id}
            className="absolute"
            style={{
              width: `${sphere.size}px`,
              height: `${sphere.size}px`,
              top: sphere.top,
              left: sphere.left,
              right: sphere.right,
              animation: `fadeInAgent 1s ease-out ${sphere.delay * 0.15}s forwards, floatAgentSubtle ${sphere.duration}s ease-in-out ${1 + sphere.delay}s infinite`,
              willChange: 'transform',
              zIndex: -1,
              pointerEvents: 'none',
              opacity: 0,
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${AGENT_IMAGES[sphere.imageIndex]})`,
                borderRadius: '1000px',
                filter: `blur(${sphere.blur}px) brightness(1.15) saturate(1.15)`,
                opacity: sphere.opacity,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(0, 0, 0, 0.08)',
                animation: `breathe ${sphere.duration * 0.5}s ease-in-out ${1 + sphere.delay * 0.5}s infinite`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <V2TopBar onSearch={() => {}} />

      {/* Main Content */}
      <div className="w-full min-h-screen flex flex-col pt-16">
        <m.div
          className="flex-1 flex flex-col items-center justify-center px-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="w-full max-w-4xl">
            {/* Messages from demo or Hero Section */}
            {fromDemo && step < 4 ? (
              <div className="space-y-4 mb-8">
                {step >= 1 && (
                  <ChatMessage
                    key="closing-1"
                    message="This was a glimpse of how our agents work together."
                    isUser={false}
                    showAvatar={true}
                    useTypewriter={step === 1}
                  />
                )}

                {step >= 2 && (
                  <ChatMessage
                    key="closing-2"
                    message="Now it's your turn."
                    isUser={false}
                    showAvatar={true}
                    useTypewriter={step === 2}
                  />
                )}

                {step >= 3 && (
                  <ChatMessage
                    key="closing-3"
                    message="Tell me what you'd like to build, and I'll assemble your team."
                    isUser={false}
                    showAvatar={true}
                    useTypewriter={step === 3}
                  />
                )}
              </div>
            ) : (
              <m.div
                className="flex flex-col items-center text-center relative"
                variants={fadeIn}
              >
                {/* Animated particles breaking free */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full opacity-0"
                      style={{
                        background: `linear-gradient(135deg, ${i % 4 === 0 ? '#83FCB7' : i % 4 === 1 ? '#00E5FF' : i % 4 === 2 ? '#A0C1FF' : '#639CF2'}, transparent)`,
                        animation: `particle-explode-${i} 2.5s ease-out ${1 + i * 0.12}s forwards`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>

                <Typography
                  variant="h2"
                  sx={{
                    textAlign: 'center',
                    margin: 0,
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  <span className="relative inline-block">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Build without{' '}
                    </span>
                    <span className="relative inline-block group">
                      {/* Glowing background */}
                      <span
                        className="absolute inset-0 blur-xl opacity-60"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(131, 252, 183, 0.15), rgba(0, 229, 255, 0.15), rgba(160, 193, 255, 0.15), rgba(99, 156, 242, 0.15))',
                          animation: 'breathe 4s ease-in-out infinite',
                        }}
                      />

                      {/* Main text with gradient */}
                      <span
                        className="relative font-black bg-clip-text text-transparent animate-gradient-x"
                        style={{
                          backgroundImage:
                            'linear-gradient(90deg, #83FCB7, #00E5FF, #A0C1FF, #639CF2)',
                          backgroundSize: '200% 200%',
                        }}
                      >
                        limits
                      </span>

                      {/* Breaking shards effect */}
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rotate-45 opacity-0"
                        style={{
                          background: 'linear-gradient(135deg, #00E5FF, transparent)',
                          animation: 'shard-1 0.8s ease-out 1.4s forwards',
                        }}
                      />
                      <span
                        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rotate-12 opacity-0"
                        style={{
                          background: 'linear-gradient(135deg, #83FCB7, transparent)',
                          animation: 'shard-2 0.8s ease-out 1.5s forwards',
                        }}
                      />
                    </span>
                  </span>
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    margin: 0,
                    mb: 2,
                    color: 'rgba(156, 163, 175, 1)',
                  }}
                >
                  Your AI team to build and run anything you imagine
                </Typography>
              </m.div>
            )}

            {/* Input field */}
            {step >= 4 && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl mx-auto"
              >
                <EnhancedCommandInput handleVoice={() => {}} />
              </m.div>
            )}
          </div>
        </m.div>

        {/* Compact Footer */}
        <V2CompactFooter />
      </div>
    </>
  );
};

export default memo(LandingPage);

