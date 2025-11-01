import React, { memo, useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import NewLayout from '../../layouts/dashboard/new/NewLayout';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider';
import { useSelector, dispatch } from '../../redux/store';
import FeaturesSection from '../../sections/new/FeaturesSection';
import NewHeroSection from '../../sections/new/NewHeroSection';

// Redux selectors
const selectAccountAltaners = (state) => state.general.account?.altaners;

const NewDashboardPage = () => {
  const history = useHistory();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  // Creation states
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const apiCallStartedRef = useRef(false);

  // Auth dialog opener ref
  const openAuthDialogRef = useRef(null);
  const handleRequestAuth = (opener) => {
    openAuthDialogRef.current = opener;
  };

  // Redux data
  const altaners = useSelector(selectAccountAltaners);

  // Handle URL parameter for creating projects from ideas
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ideaId = params.get('idea');

    if (ideaId && !apiCallStartedRef.current && isAuthenticated) {
      apiCallStartedRef.current = true;
      setIsCreating(true);

      import('../../redux/slices/altaners').then(({ createAltaner }) => {
        dispatch(createAltaner({ name: 'New Project' }, ideaId))
          .then((altaner) => {
            const projectId = altaner?.id;

            if (projectId) {
              // Check if this is the first project (for onboarding)
              const isFirstProject = !altaners || altaners.length === 0;
              const onboardingParam = isFirstProject ? '?onboarding=true' : '';

              // Navigate to the new project
              window.location.href = `/project/${projectId}${onboardingParam}`;
            } else {
              setCreationError('Failed to create project. Please try again.');
              setIsCreating(false);
              apiCallStartedRef.current = false;
            }
          })
          .catch((err) => {
            setCreationError(err?.message || 'Failed to create project. Please try again.');
            setIsCreating(false);
            apiCallStartedRef.current = false;
          });
      }).catch(() => {
        setCreationError('Failed to load project creator. Please try again.');
        setIsCreating(false);
        apiCallStartedRef.current = false;
      });
    }
  }, [location.search, isAuthenticated, altaners]);

  const handleSubmit = async (message) => {
    if (!message || !message.trim()) return;

    setIsCreating(true);
    setCreationError(null);

    try {
      // First, create the idea
      const response = await fetch('https://api.altan.ai/platform/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: message.trim(),
          attachments: [],
          is_public: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create idea');
      }

      const data = await response.json();

      if (!data.id) {
        throw new Error('No idea ID returned');
      }

      // Redirect with idea parameter - the useEffect will pick it up and create the project
      history.push(`/?idea=${data.id}`);
    } catch (err) {
      setCreationError(err?.message || 'Failed to create project. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <NewLayout onRequestAuth={handleRequestAuth}>
      {/* Simple Creation Loader */}
      {isCreating && !creationError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 dark:bg-[#0D0D0D]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-foreground/70 animate-pulse">Creating your project...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {creationError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Creation Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{creationError}</p>
            <button
              onClick={() => {
                setCreationError(null);
                setIsCreating(false);
                apiCallStartedRef.current = false;
                // Clear URL params if any
                const params = new URLSearchParams(location.search);
                if (params.has('idea')) {
                  history.replace(location.pathname);
                }
              }}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Always first */}
      <NewHeroSection
        onSubmit={handleSubmit}
        isCreating={isCreating}
        onRequestAuth={() => openAuthDialogRef.current?.()}
      />

      {/* Features Section - Only for unauthenticated users, appears after scroll */}
      {!isAuthenticated && (
        <VoiceConversationProvider>
          <FeaturesSection />
        </VoiceConversationProvider>
      )}
    </NewLayout>
  );
};

export default memo(NewDashboardPage);
