import { useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, memo } from 'react';
import { useHistory } from 'react-router-dom';

import { useAnalytics } from '../../hooks/useAnalytics.js';
import { createAltaner } from '../../redux/slices/altaners.js';
import { useDispatch, store } from '../../redux/store';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify';
import { TeamAssemblyAnimation } from '../ui/TeamAssemblyAnimation.jsx';

// Clean and minimal - removed all unused components and CSS

function AltanerFromIdea({ idea, onClose }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const analytics = useAnalytics();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleRetry = () => {
    setError(null);
    setIsCreating(false);
  };

  useEffect(() => {
    if (!idea || isCreating || error) return;

    setIsCreating(true);

    let isSubscribed = true;

    // Check if this is the user's first project (before creating the new one)
    const existingAltaners = store.getState()?.general?.account?.altaners || [];
    const isFirstProject = existingAltaners.length === 0;

    // Start the actual creation process
    console.log('Starting project creation with idea:', idea); // Debug log
    const createPromise = dispatch(createAltaner({ name: 'New Project' }, idea));
    console.log('Create promise:', createPromise); // Debug log
    
    createPromise
      .then((altaner) => {
        console.log('Promise resolved with altaner:', altaner); // Debug log
        
        if (!altaner) {
          console.error('No altaner returned from createAltaner'); // Debug log
          if (isSubscribed) {
            setError('Failed to create project. Please try again.');
            setIsCreating(false);
          }
          return;
        }
        
        if (!altaner.id) {
          console.error('Altaner missing ID:', altaner); // Debug log
          if (isSubscribed) {
            setError('Failed to create project. Please try again.');
            setIsCreating(false);
          }
          return;
          }
          try {
            analytics.trackCreateProject(
              altaner.name || 'New Project',
              'App',
              {
                project_id: altaner.id,
                creation_source: 'idea_dialog',
                has_idea: !!idea,
                idea_length: idea ? idea.length : 0,
                is_public: altaner.is_public || false,
                account_id: altaner.account_id,
                created_via_spiral_animation: true,
              }
            );
          } catch (analyticsError) {
            console.error('Analytics tracking failed:', analyticsError);
          }
          
          try {
            // Try fast client-side navigation first
            const projectUrl = `/project/${altaner.id}${isFirstProject ? '?onboarding=true' : ''}`;
            history.push(projectUrl);
            console.log('React Router navigation successful');
            
            // Close dialog after successful navigation
            if (onClose) onClose();
            
          } catch (navError) {
            console.log('React Router failed, using window.location fallback');
            // Fallback to full page redirect if React Router fails
            const projectUrl = `/project/${altaner.id}${isFirstProject ? '?onboarding=true' : ''}`;
            if (onClose) onClose();
            window.location.href = projectUrl;
          }
      })
      .catch((error) => {
        console.error('Promise rejected with error:', error); // Debug log
        if (!isSubscribed) return;
        setError(error?.message || 'Failed to create project. Please try again.');
        setIsCreating(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [idea, isCreating, error, dispatch, history]);


  if (!idea) return null;

  return (
    <CustomDialog
      dialogOpen={!!idea}
      onClose={onClose}
      alwaysFullScreen={true}
      height="100vh"
    >
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background:
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.97)' : 'rgba(245, 245, 245, 0.97)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[400px] px-4">
              {error ? (
                // Error state
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mb-8">
                    <Iconify
                      icon="heroicons:exclamation-triangle"
                      width={48}
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#ef4444' : '#dc2626',
                        marginBottom: '1rem',
                      }}
                    />
                    <h2
                      className="text-xl font-medium mb-4"
                      style={{
                        color: theme.palette.mode === 'dark' ? 'white' : 'black',
                      }}
                    >
                      Project Creation Failed
                    </h2>
                    <p
                      className="text-sm mb-8"
                      style={{
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      {error}
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.1)',
                        color: theme.palette.mode === 'dark' ? 'white' : 'black',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'transparent',
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </m.div>
              ) : (
                // Loading state with team assembly animation
                <div className="absolute inset-0">
                  <TeamAssemblyAnimation />
                </div>
              )}
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    </CustomDialog>
  );
}

export default memo(AltanerFromIdea);
