import { Typography } from '@mui/material';
import { m } from 'framer-motion';
import React, { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import AltanersWidget from './components/AltanersWidget';
import CreateAgentDashboard from './components/CreateAgentDashboard.jsx';
import CreateAnything from './components/CreateAnything.jsx';
import CreateFlowDashboard from './components/CreateFlowDashboard.jsx';
import VoiceConversation from './components/VoiceConversation.jsx';
import VoiceConversationWithAgentSelection from './components/VoiceConversationWithAgentSelection.jsx';
import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import { CompactLayout } from '../../layouts/dashboard';
import Footer from '../../layouts/main/Footer.jsx';
import useLocales from '../../locales/useLocales.js';
import Agents from '../../sections/@dashboard/agents/Agents.jsx';
import WorkflowsWidget from '../../sections/@dashboard/flows/WorkflowsWidget.jsx';

const DashboardPage = () => {
  const { mode = 'projects' } = useParams();
  const { isAuthenticated, user } = useAuthContext();
  const accountId = useSelector((state) => state.general.account?.id);

  const agents = {
    unauthenticated: {
      id: 'f3a00594-aaf7-4cbd-a9a6-25c804895de9',
      name: 'Altan',
      displayAvatar: false,
    },
    authenticated: {
      main: {
        id: 'ad2b3598-a2b4-4bc5-aba9-6af5fe484951',
        name: 'Altan',
        displayAvatar: false,
      },
      agents: {
        id: 'fe2db702-9463-4698-bac2-e039d7225100',
        displayAvatar: true,
        dynamicVariables: {
          account_id: accountId,
        },
      },
      flows: {
        id: 'ad2b3598-a2b4-4bc5-aba9-6af5fe484951',
        name: 'Altan',
        displayAvatar: false,
      },
    },
  };

  // Initialize voice preference from localStorage, with different defaults based on auth status
  const [isVoice, setIsVoice] = useState(() => {
    const savedPreference = localStorage.getItem('voicePreference');
    if (savedPreference !== null) {
      return JSON.parse(savedPreference);
    }
    // Default: text mode for all users
    return false;
  });

  const [showFloatingVoice, setShowFloatingVoice] = useState(false);
  const { translate } = useLocales();

  // Determine the appropriate agent ID based on authentication status and mode
  const getAgentId = () => {
    if (!isAuthenticated) {
      return agents.unauthenticated;
    }

    switch (mode) {
      case 'agents':
        return agents.authenticated.agents;
      case 'flows':
        return agents.authenticated.flows;
      case 'projects':
      default:
        return agents.authenticated.main;
    }
  };

  const agentConfig = getAgentId();

  // Save voice preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('voicePreference', JSON.stringify(isVoice));
  }, [isVoice]);

  // Track scroll position to show/hide floating voice component
  useEffect(() => {
    const handleScroll = (event) => {
      // Check both window scroll and container scroll
      const windowScrollY = window.scrollY;
      const containerScrollY = event.target.scrollTop || 0;
      const scrollY = Math.max(windowScrollY, containerScrollY);
      const shouldShowFloating = scrollY > 300; // Show after scrolling 300px
      setShowFloatingVoice(shouldShowFloating);
    };

    // Listen to both window scroll and find the layout wrapper
    window.addEventListener('scroll', handleScroll);

    // Also listen to scroll events on the layout wrapper
    const layoutWrapper = document.querySelector('.overflow-y-auto');
    if (layoutWrapper) {
      layoutWrapper.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (layoutWrapper) {
        layoutWrapper.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isVoice]);

  // Render different content based on mode
  const renderContentBasedOnMode = (currentMode) => {
    switch (currentMode) {
      case 'agents':
        return <Agents />;
      case 'flows':
        return <WorkflowsWidget />;
      case 'projects':
      default:
        return <AltanersWidget />;
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const floatingAnimation = {
    hidden: { opacity: 0, y: 100, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <>
      <CompactLayout title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} · Altan`}>
        <div>
          <m.div
            className="grid grid-cols-1 mt-4 sm:mt-12 gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <m.div
              className="flex flex-col py-8 sm:py-20"
              variants={fadeIn}
            >
              {/* VOICE WIDGET */}
              <div>
                <div className="flex flex-col items-center text-center">
                  <Typography
                    variant="h2"
                    sx={{
                      textAlign: 'center',
                      margin: 0,
                      mb: 1,
                    }}
                  >
                    {mode === 'agents' && isAuthenticated && user?.first_name && user?.last_name
                      ? 'What can I do for you?'
                      : translate(
                          mode === 'agents'
                            ? 'dashboard.agents.title'
                            : mode === 'flows'
                              ? 'dashboard.flows.title'
                              : 'dashboard.createAnything.title',
                        )}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      margin: 0,
                      mb: 2,
                    }}
                  >
                    {mode === 'agents' && isAuthenticated && user?.first_name && user?.last_name
                      ? 'Chat with your agents to get the job done'
                      : translate(
                          mode === 'agents'
                            ? 'dashboard.agents.subtitle'
                            : mode === 'flows'
                              ? 'dashboard.flows.subtitle'
                              : 'dashboard.createAnything.subtitle',
                        )}
                  </Typography>
                  {/* Only show original voice component when not floating or when not in voice mode */}
                  {isVoice ? (
                    mode === 'agents' ? (
                      <VoiceConversationWithAgentSelection
                        onCreateAgent={() => setIsVoice(false)}
                      />
                    ) : (
                      <VoiceConversation
                        altanAgentId={agentConfig.id}
                        agentName={agentConfig.name}
                        displayAvatar={agentConfig.displayAvatar}
                        dynamicVariables={agentConfig?.dynamicVariables}
                      />
                    )
                  ) : mode === 'agents' ? (
                    <CreateAgentDashboard handleVoice={() => setIsVoice(!isVoice)} />
                  ) : mode === 'flows' ? (
                    <CreateFlowDashboard handleVoice={() => setIsVoice(!isVoice)} />
                  ) : (
                    <CreateAnything handleVoice={() => setIsVoice(!isVoice)} />
                  )}
                  {isVoice && (
                    <Typography
                      onClick={() => setIsVoice(!isVoice)}
                      className="cursor-pointer flex items-center gap-1"
                      variant="caption"
                    >
                      <Iconify
                        icon={isVoice ? 'material-symbols:keyboard-alt-outline' : 'eva:mic-outline'}
                        width={16}
                      />
                      {translate(isVoice ? 'voice.switchToText' : 'voice.switchToVoice')}
                    </Typography>
                  )}
                </div>
              </div>
            </m.div>

            <m.div
              className="flex flex-col pt-6"
              variants={fadeIn}
            >
              <div className="px-6 py-2 w-full sm:rounded-t-2xl sm:shadow-md sm:bg-white sm:dark:bg-[#1c1c1c] sm:dark:border-gray-800 sm:dark:shadow-[0_2px_8px_rgba(255,255,255,0.03)] max-w-none sm:max-w-7xl mx-auto">
                {renderContentBasedOnMode(mode)}
                <Footer />
              </div>
            </m.div>
          </m.div>
        </div>

        {/* Floating Voice Conversation - only show when in voice mode and scrolled */}
      </CompactLayout>
      {isVoice && showFloatingVoice && (
        <m.div
          className="fixed bottom-12 sm:bottom-6 left-0 right-0 z-[9999] flex justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={floatingAnimation}
          style={{ zIndex: 9999 }}
          onAnimationComplete={() => console.log('Floating component animation completed')}
        >
          <div>
            <VoiceConversation
              altanAgentId={agentConfig.id}
              agentName={agentConfig.name}
              displayAvatar={agentConfig.displayAvatar}
            />
          </div>
        </m.div>
      )}
    </>
  );
};

export default memo(DashboardPage);
