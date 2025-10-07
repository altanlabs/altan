import { useEffect, useState, useCallback } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useLocation, useHistory } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Custom styles to ensure spotlight area is clear and highlighted
const tourStyles = `
  .__floater__open {
    filter: none !important;
  }
  
  .react-joyride__spotlight {
    background-color: transparent !important;
    border-radius: 12px !important;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 
                0 0 40px 4px rgba(139, 92, 246, 0.4),
                inset 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
    animation: pulse-spotlight 2s ease-in-out infinite !important;
    pointer-events: none !important;
  }
  
  @keyframes pulse-spotlight {
    0%, 100% {
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 
                  0 0 40px 4px rgba(139, 92, 246, 0.4),
                  inset 0 0 0 2px rgba(139, 92, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 
                  0 0 50px 6px rgba(139, 92, 246, 0.6),
                  inset 0 0 0 2px rgba(139, 92, 246, 0.5);
    }
  }
  
  .react-joyride__overlay {
    background-color: transparent !important;
    mix-blend-mode: normal !important;
    pointer-events: auto !important;
  }
  
  .react-joyride__tooltip {
    z-index: 99999 !important;
  }
`;

const ProjectOnboardingTour = ({ altanerId, currentComponent, sortedComponents }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'project-onboarding-tour-styles';
    styleElement.innerHTML = tourStyles;
    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById('project-onboarding-tour-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Check if onboarding query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('onboarding') === 'true') {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        setRun(true);
      }, 500);
    }
  }, [location.search]);

  // Remove the old auto-advance logic since we're now doing it in the callback

  const handleJoyrideCallback = useCallback((data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      // Auto-navigate to Cloud when moving from step 3 (component switcher) to step 4
      if (index === 3 && action === ACTIONS.NEXT && nextStepIndex === 4) {
        const cloudComponent = Object.entries(sortedComponents || {}).find(
          ([id, comp]) => comp.type === 'base'
        );
        if (cloudComponent) {
          history.push(`/project/${altanerId}/c/${cloudComponent[0]}`);
          // Wait for navigation before advancing
          setTimeout(() => {
            setStepIndex(nextStepIndex);
          }, 300);
          return; // Don't advance immediately
        }
      }

      // Auto-navigate to Agents when moving from step 4 to 5
      if (index === 4 && action === ACTIONS.NEXT && nextStepIndex === 5) {
        const agentsComponent = Object.entries(sortedComponents || {}).find(
          ([id, comp]) => comp.type === 'agents'
        );
        if (agentsComponent) {
          history.push(`/project/${altanerId}/c/${agentsComponent[0]}`);
          // Wait for navigation before advancing
          setTimeout(() => {
            setStepIndex(nextStepIndex);
          }, 300);
          return; // Don't advance immediately
        }
      }

      setStepIndex(nextStepIndex);
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      // If target not found, log it but don't auto-advance
      console.error('Target not found for step:', index, steps[index]);
      // Don't advance automatically to avoid loops
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Tour is finished, remove query param and navigate back to Interface
      const params = new URLSearchParams(location.search);
      params.delete('onboarding');
      
      // Find the interface component and navigate to it
      const interfaceComponent = Object.entries(sortedComponents || {}).find(
        ([id, comp]) => comp.type === 'interface'
      );
      
      if (interfaceComponent) {
        history.push(`/project/${altanerId}/c/${interfaceComponent[0]}?${params.toString()}`);
      } else {
        history.replace({
          pathname: location.pathname,
          search: params.toString(),
        });
      }
      
      setRun(false);
    }
  }, [altanerId, history, location.pathname, location.search, sortedComponents]);

  const steps = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Your Project! 🚀
          </div>
          <p className="text-base">
            Let's take a quick tour to help you understand how to build amazing applications with AI assistance.
          </p>
          <p className="text-sm opacity-75">
            This will only take a minute, and you can skip it anytime.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#chat-panel',
      content: (
        <div className="space-y-2">
          <div className="text-lg font-semibold">💬 AI Chat Room</div>
          <p>
            This is your AI-powered workspace. Chat with AI agents to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Request code changes and features</li>
            <li>Ask questions about your project</li>
            <li>Get help debugging issues</li>
            <li>Collaborate in real-time</li>
          </ul>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      spotlightClicks: false,
      styles: {
        spotlight: {
          borderRadius: 12,
        },
      },
    },
    {
      target: '#preview-panel',
      content: (
        <div className="space-y-2">
          <div className="text-lg font-semibold">👁️ Live Preview</div>
          <p>
            This is where you see your <strong>Interface</strong> - your frontend UI.
          </p>
          <p className="text-sm opacity-75">
            The interface updates in real-time as you make changes through the AI chat on the left.
          </p>
          <p className="text-sm font-medium mt-3 text-purple-600 dark:text-purple-400">
            Next, we'll show you how to switch between different parts of your project! →
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
      styles: {
        spotlight: {
          borderRadius: 12,
        },
      },
    },
    {
      target: '[data-tour="component-switcher"]',
      content: (
        <div className="space-y-3">
          <div className="text-lg font-semibold">🔄 Component Switcher</div>
          <p className="text-base">
            These buttons let you switch between different parts of your project:
          </p>
          <div className="space-y-2 text-sm mt-2">
            <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-base">🖥️</span>
              <span><strong>Interface</strong> - Your frontend UI (currently active)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-base">☁️</span>
              <span><strong>Cloud</strong> - Backend infrastructure</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-base">🤖</span>
              <span><strong>Agents</strong> - AI automation</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-400 dark:border-purple-600 mt-3">
            <span className="text-2xl">👉</span>
            <p className="text-sm font-bold">
              Click "Next" and we'll take you to the Cloud backend!
            </p>
          </div>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: true,
      styles: {
        spotlight: {
          borderRadius: 12,
        },
      },
    },
    {
      target: '#preview-panel',
      content: (
        <div className="space-y-2">
          <div className="text-lg font-semibold">☁️ Cloud Backend</div>
          <p>
            Perfect! This is your backend infrastructure:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Database:</strong> Store and query your data</li>
            <li><strong>Authentication:</strong> User login & permissions</li>
            <li><strong>Storage:</strong> File uploads and media</li>
            <li><strong>Functions:</strong> Server-side logic</li>
            <li><strong>Secrets:</strong> API keys and environment variables</li>
          </ul>
          <p className="text-sm opacity-75 mt-2">
            Click "Next" to learn about AI Agents →
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
      spotlightClicks: false,
      styles: {
        spotlight: {
          borderRadius: 12,
        },
      },
    },
    {
      target: '#preview-panel',
      content: (
        <div className="space-y-2">
          <div className="text-lg font-semibold">🤖 AI Agents</div>
          <p>
            This is where you manage your AI agents:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Automate repetitive tasks</li>
            <li>Handle user interactions in your interface</li>
            <li>Process data and make decisions</li>
            <li>Integrate with external services</li>
          </ul>
          <p className="text-sm opacity-75 mt-2">
            Agents can be embedded directly into your interface or used in the chat room.
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
      styles: {
        spotlight: {
          borderRadius: 12,
        },
      },
    },
    {
      target: '[data-tour="publish-button"]',
      content: (
        <div className="space-y-2">
          <div className="text-lg font-semibold">🚀 Publish to Production</div>
          <p>
            When you're ready, click here to deploy your project to production.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Get a live URL instantly</li>
            <li>Connect a custom domain</li>
            <li>View deployment history</li>
            <li>Rollback to previous versions</li>
          </ul>
          <p className="text-sm font-medium mt-2 text-green-600 dark:text-green-400">
            Your app will be live in seconds! 🎉
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            You're All Set! 🎉
          </div>
          <p className="text-base">
            Now you know the basics! Start by chatting with your AI agents on the left to request features or ask questions.
          </p>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium">💡 Pro Tip</p>
            <p className="text-sm mt-1">
              Try asking: "Add a contact form to my interface" or "Show me the users table in my database"
            </p>
          </div>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose={false}
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      disableScrolling={false}
      disableScrollParentFix={true}
      debug={false}
      styles={{
        options: {
          arrowColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.98)
            : alpha(theme.palette.background.paper, 0.98),
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.98)
            : alpha(theme.palette.background.paper, 0.98),
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: theme.palette.primary.main,
          textColor: theme.palette.text.primary,
          width: 450,
          zIndex: 99999,
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
          backdropFilter: 'blur(20px)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}, 0 0 40px ${alpha(theme.palette.primary.main, 0.1)}`
            : `0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}, 0 0 40px ${alpha(theme.palette.primary.main, 0.05)}`,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '0 0 12px 0',
          fontSize: '14px',
          lineHeight: '1.6',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: 12,
        },
        buttonNext: {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 8,
          fontSize: '14px',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
        buttonBack: {
          color: theme.palette.text.secondary,
          fontSize: '14px',
          fontWeight: 500,
          marginRight: 8,
          padding: '10px 16px',
          borderRadius: 8,
        },
        buttonSkip: {
          color: theme.palette.text.secondary,
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 16px',
        },
        buttonClose: {
          color: theme.palette.text.secondary,
          padding: 8,
        },
        spotlight: {
          borderRadius: 12,
          backgroundColor: 'transparent',
        },
        overlay: {
          backgroundColor: 'transparent',
        },
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          },
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

ProjectOnboardingTour.propTypes = {
  altanerId: PropTypes.string.isRequired,
  currentComponent: PropTypes.object,
  sortedComponents: PropTypes.object,
};

export default ProjectOnboardingTour;
