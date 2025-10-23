import { Capacitor } from '@capacitor/core';
import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useHistory } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import useResponsive from '../../hooks/useResponsive';
import { useSelector } from '../../redux/store';

// Selector for altaners
const selectAccountAltaners = (state) => state.general.account?.altaners;

// Utility function to check if we're on iOS Capacitor platform
const isIOSCapacitor = () => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    return isNative && platform === 'ios';
  } catch (error) {
    console.log('❌ Platform detection error:', error);
    return false;
  }
};

export const AGENT_IMAGES = [
  '/agents/1.png',
  '/agents/2.png',
  '/agents/3.png',
  '/agents/4.png',
  '/agents/5.jpeg',
];

const VirtualDesktopLayout = ({ children, title = 'Altan · Your Agentic Business OS' }) => {
  const altaners = useSelector(selectAccountAltaners);
  const isMobile = useResponsive('down', 'sm');
  const isIOS = isIOSCapacitor();
  const { user, isAuthenticated } = useAuthContext();
  const location = useLocation();
  const history = useHistory();

  // Animation states for project creation
  const [isConverging, setIsConverging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [error, setError] = useState(null);
  const apiCallStartedRef = useRef(false);

  // Detect idea param and trigger convergence animation + API call immediately
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ideaId = params.get('idea');

    if (ideaId && !apiCallStartedRef.current) {
      console.log('🎬 STARTING ANIMATION & API CALL');
      apiCallStartedRef.current = true;
      setIsConverging(true);
      const startTime = Date.now();

      import('../../redux/slices/altaners')
        .then(({ createAltaner }) => {
          const createPromise = import('../../redux/store').then(({ dispatch }) =>
            dispatch(createAltaner({ name: 'New Project' }, ideaId)),
          );

          createPromise
            .then((altaner) => {
              const projectId = altaner?.id;

              if (projectId) {
                console.log('✅ Project created successfully!');

                // Calculate how long the animation has been running
                const elapsed = Date.now() - startTime;
                const minAnimationTime = 5000;
                const remainingTime = Math.max(0, minAnimationTime - elapsed);

                // Wait for animation to complete, then redirect
                setTimeout(() => {
                  console.log('💥 Starting burst animation');
                  setIsBursting(true);
                  setTimeout(() => {
                    console.log('🚀 Redirecting to /project/' + projectId);
                    const isFirstProject = !altaners || altaners.length === 0;
                    const onboardingParam = isFirstProject ? '?onboarding=true' : '';
                    history.push(`/project/${projectId}${onboardingParam}`);
                  }, 800);
                }, remainingTime);
              } else {
                console.error('❌ No project ID found in response:', altaner);
                setError('Failed to create project. Please try again.');
                apiCallStartedRef.current = false;
              }
            })
            .catch((err) => {
              console.error('❌ Promise rejected with error:', err);
              setError(err?.message || 'Failed to create project. Please try again.');
              apiCallStartedRef.current = false;
            });
        })
        .catch((importErr) => {
          console.error('❌ Failed to import createAltaner:', importErr);
          apiCallStartedRef.current = false;
        });

      // Transition to creating state after convergence
      setTimeout(() => {
        console.log('✨ Setting isCreating to true');
        setIsCreating(true);
      }, 5000);
    }
  }, [location.search, history, altaners]);

  // Calculate safe area aware padding for iOS
  const getSafeAreaStyle = () => {
    const style = {
      paddingTop: isIOS ? 'env(safe-area-inset-top)' : 0,
      paddingBottom: isIOS ? 'env(safe-area-inset-bottom)' : 0,
    };
    return style;
  };

  return (
    <div
      className="relative z-10 w-full h-full"
      style={{
        opacity: isConverging ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
        pointerEvents: isConverging ? 'none' : 'auto',
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div
        className="fixed top-0 left-0 right-0 bottom-0 flex flex-col overflow-hidden"
        style={getSafeAreaStyle()}
      >
        {/* Overlay for contrast */}
        <div
          className={`fixed top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none ${
            isAuthenticated
              ? 'bg-white/30 dark:bg-black/60'
              : 'bg-black'
          }`}
          style={{
            height: '100dvh',
            maxHeight: '100dvh',
            zIndex: -1,
            backdropFilter: isAuthenticated ? 'brightness(0.95) saturate(0.9)' : 'none',
          }}
        />

        {/* Agent Bubbles Background - Only for authenticated users */}
        {isAuthenticated && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none"
            style={{
              height: '100dvh',
              maxHeight: '100dvh',
              zIndex: 0,
            }}
          >
          {/* Animated Agent Spheres - macOS-style subtle movement */}
          {[
            // Large spheres - very slow, gentle movement
            {
              id: 1,
              size: isMobile ? 90 : 140,
              top: '12%',
              left: '15%',
              delay: 0,
              duration: 35,
              blur: isMobile ? 4 : 6,
              opacity: 0.35,
              imageIndex: 1,
            },
            {
              id: 3,
              size: isMobile ? 100 : 150,
              top: '68%',
              right: '12%',
              delay: 3,
              duration: 40,
              blur: isMobile ? 5 : 7,
              opacity: 0.32,
              imageIndex: 1,
            },
            {
              id: 5,
              size: isMobile ? 85 : 130,
              top: '85%',
              left: '20%',
              delay: 6,
              duration: 38,
              blur: isMobile ? 4 : 6,
              opacity: 0.34,
              imageIndex: 3,
            },

            // Medium spheres - gentle, atmospheric
            {
              id: 7,
              size: isMobile ? 70 : 110,
              top: '25%',
              right: '18%',
              delay: 2,
              duration: 32,
              blur: isMobile ? 3 : 5,
              opacity: 0.28,
              imageIndex: 0,
            },
            {
              id: 9,
              size: isMobile ? 75 : 120,
              top: '50%',
              left: '10%',
              delay: 5,
              duration: 36,
              blur: isMobile ? 4 : 5,
              opacity: 0.3,
              imageIndex: 4,
            },
            {
              id: 11,
              size: isMobile ? 65 : 100,
              top: '75%',
              right: '28%',
              delay: 8,
              duration: 34,
              blur: isMobile ? 3 : 5,
              opacity: 0.27,
              imageIndex: 3,
            },

            // Small spheres - very subtle, barely there
            {
              id: 2,
              size: isMobile ? 55 : 85,
              top: '20%',
              left: '45%',
              delay: 1.5,
              duration: 30,
              blur: isMobile ? 3 : 4,
              opacity: 0.22,
              imageIndex: 2,
            },
            {
              id: 4,
              size: isMobile ? 60 : 90,
              top: '40%',
              right: '45%',
              delay: 4.5,
              duration: 33,
              blur: isMobile ? 3 : 4,
              opacity: 0.24,
              imageIndex: 2,
            },
            {
              id: 6,
              size: isMobile ? 50 : 80,
              top: '60%',
              left: '55%',
              delay: 3.5,
              duration: 28,
              blur: isMobile ? 2 : 4,
              opacity: 0.2,
              imageIndex: 3,
            },
            {
              id: 8,
              size: isMobile ? 58 : 88,
              top: '90%',
              right: '22%',
              delay: 7,
              duration: 31,
              blur: isMobile ? 3 : 4,
              opacity: 0.25,
              imageIndex: 4,
            },
          ].map((sphere) => (
            <div
              key={sphere.id}
              className="absolute"
              style={{
                width: `${sphere.size}px`,
                height: `${sphere.size}px`,
                top: isConverging || isCreating ? '50%' : sphere.top,
                left: isConverging || isCreating ? '50%' : sphere.left,
                right: isConverging || isCreating ? 'auto' : sphere.right,
                transform: isConverging || isCreating ? 'translate(-50%, -50%) scale(2.2)' : 'none',
                animation:
                  isConverging || isCreating
                    ? 'none'
                    : `fadeInAgent 1s ease-out ${sphere.delay * 0.15}s forwards, floatAgentSubtle ${sphere.duration}s ease-in-out ${1 + sphere.delay}s infinite`,
                transition: isConverging
                  ? `transform 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s, top 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s, left 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s`
                  : 'none',
                willChange: 'transform, top, left',
                zIndex: isConverging || isCreating ? 9999 : -1,
                pointerEvents: 'none',
                opacity: isBursting ? 0 : isConverging || isCreating ? 1 : 0,
              }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${AGENT_IMAGES[sphere.imageIndex]})`,
                  borderRadius: '1000px',
                  filter:
                    isConverging || isCreating
                      ? 'blur(10px) brightness(1.25) saturate(1.25)'
                      : `blur(${sphere.blur}px) brightness(1.15) saturate(1.15)`,
                  opacity: isConverging || isCreating ? 0.8 : isAuthenticated ? sphere.opacity : sphere.opacity * 0.3,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.05)',
                  animation:
                    isConverging || isCreating
                      ? isCreating
                        ? `mergeAndPulse 3s ease-in-out ${sphere.delay * 0.1}s infinite`
                        : 'none'
                      : `breathe ${sphere.duration * 0.8}s ease-in-out ${1 + sphere.delay * 0.5}s infinite`,
                  transition: isConverging
                    ? `filter 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s`
                    : 'none',
                }}
              />
            </div>
          ))}
        </div>
        )}

        {/* Creating text overlay */}
        {isCreating && !error && !isBursting && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center pb-20 pointer-events-none">
            <div className="text-xl tracking-wide animate-pulse">Creating your project...</div>
          </div>
        )}

        {/* Error modal */}
        {error && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center max-w-md mx-4">
              <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
                Creation Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsConverging(false);
                  setIsCreating(false);
                  history.push('/v2');
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        <div
          className="relative z-10 w-full h-full"
          style={{
            opacity: isConverging ? 0 : 1,
            transition: 'opacity 0.8s ease-out',
            pointerEvents: isConverging ? 'none' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default memo(VirtualDesktopLayout);
