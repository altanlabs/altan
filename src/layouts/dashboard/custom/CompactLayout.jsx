import { Capacitor } from '@capacitor/core';
import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector, dispatch } from '../../../redux/store';

// Selector for altaners
const selectAccountAltaners = (state) => state.general.account?.altaners;

// Default header heights and spacing (tailor these as needed)
const DEFAULT_HEADER_MOBILE_HEIGHT = HEADER.H_MOBILE;
const DRAWER_WIDTH = 275; // Match the actual drawer width from ChatDrawer

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

const CompactLayout = ({
  children,
  title,
  overflowHidden = false,
  breadcrumb = null,
  toolbarChildren = null,
  noPadding = false,
  // paddingTop = 0,
  fullWidth = false,
  headerMobileHeight = DEFAULT_HEADER_MOBILE_HEIGHT,
  // subToolbarHeight = DEFAULT_SUBTOOLBAR_HEIGHT,
  hideHeader = false,
  drawerVisible = true,
}) => {
  const headerVisible = useSelector(selectHeaderVisible);
  const altaners = useSelector(selectAccountAltaners);
  const isDesktop = useResponsive('up', 'lg');
  const isMobile = useResponsive('down', 'sm');
  const isIOS = isIOSCapacitor();
  const { user } = useAuthContext();
  const location = useLocation();
  const history = useHistory();

  // Animation states for project creation
  const [isConverging, setIsConverging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [error, setError] = useState(null);
  const apiCallStartedRef = useRef(false);

  // Define paths where gradient background should be shown
  const allowedPaths = ['/', '/agents', '/flows', '/usage', '/pricing'];
  const shouldShowGradient = allowedPaths.includes(location.pathname);

  // Track drawer state from localStorage
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Listen for drawer state changes
  useEffect(() => {
    if (!user) {
      setDrawerOpen(false);
      return;
    }

    const checkDrawerState = () => {
      const savedState = localStorage.getItem('chatDrawerOpen');
      setDrawerOpen(savedState ? JSON.parse(savedState) : false);
    };

    // Initial check
    checkDrawerState();

    // Listen for localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === 'chatDrawerOpen') {
        checkDrawerState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for direct changes (same tab)
    const interval = setInterval(checkDrawerState, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Debug logging
  useEffect(() => {
    // Try to get safe area values
    if (isIOS) {
      const testElement = document.createElement('div');
      testElement.style.paddingTop = 'env(safe-area-inset-top)';
      testElement.style.position = 'fixed';
      testElement.style.top = '0';
      testElement.style.visibility = 'hidden';
      document.body.appendChild(testElement);

      const computedStyle = getComputedStyle(testElement);
      const safeAreaTop = computedStyle.paddingTop;

      document.body.removeChild(testElement);
    }
  }, [isIOS, isMobile, isDesktop, headerVisible, hideHeader, title]);

  // Detect idea param and trigger convergence animation + API call immediately
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ideaId = params.get('idea');
    
    console.log('🔍 Checking for idea param:', ideaId);
    console.log('🔍 API call started ref:', apiCallStartedRef.current);
    
    if (ideaId && !apiCallStartedRef.current) {
      console.log('🎬 STARTING ANIMATION & API CALL');
      apiCallStartedRef.current = true;
      setIsConverging(true);
      const startTime = Date.now();
      
      console.log('📞 Calling createAltaner with idea:', ideaId);
      
      import('../../../redux/slices/altaners').then(({ createAltaner }) => {
        console.log('✅ createAltaner imported successfully');
        
        const createPromise = dispatch(createAltaner({ name: 'New Project' }, ideaId));
        console.log('📤 Dispatch called, promise:', createPromise);
        
        createPromise
          .then((altaner) => {
            console.log('📦 Raw response from createAltaner:', altaner);
            
            // createAltaner returns the altaner object directly (not wrapped)
            const projectId = altaner?.id;
            
            console.log('📝 Project data:', altaner);
            console.log('🆔 Project ID:', projectId);
            
            if (projectId) {
              console.log('✅ Project created successfully!');
              
              // Calculate how long the animation has been running
              const elapsed = Date.now() - startTime;
              const minAnimationTime = 5000; // Minimum time for smooth animation
              const remainingTime = Math.max(0, minAnimationTime - elapsed);
              
              console.log(`⏱️ Animation elapsed: ${elapsed}ms, waiting ${remainingTime}ms more`);
              
              // Wait for animation to complete, then redirect
              setTimeout(() => {
                console.log('💥 Starting burst animation');
                setIsBursting(true);
                setTimeout(() => {
                  console.log('🚀 Redirecting to /project/' + projectId);
                  // Check if this is the first project (for onboarding)
                  const isFirstProject = !altaners || altaners.length === 0;
                  const onboardingParam = isFirstProject ? '?onboarding=true' : '';
                  console.log(`📊 First project: ${isFirstProject}, adding onboarding: ${onboardingParam}`);
                  // Use window.location.href to reload the page
                  window.location.href = `/project/${projectId}${onboardingParam}`;
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
      }).catch((importErr) => {
        console.error('❌ Failed to import createAltaner:', importErr);
        apiCallStartedRef.current = false;
      });
      
      // Transition to creating state after convergence
      setTimeout(() => {
        console.log('✨ Setting isCreating to true');
        setIsCreating(true);
      }, 5000);
    }
  }, [location.search, history]);

  // This logic replicates the original top calculation:
  // If breadcrumb or toolbar exists, double the header height, else 0.75 of it.
  // Add 15px plus an extra 40px if mobile and toolbarChildren exists.
  const top = useMemo(() => {
    if (hideHeader) return 0;
    const baseMultiplier = breadcrumb || toolbarChildren ? 2 : 0.75;
    const calculatedTop =
      headerMobileHeight * baseMultiplier + 15 + (isMobile && toolbarChildren ? 40 : 0);
    return calculatedTop;
  }, [breadcrumb, isMobile, toolbarChildren, headerMobileHeight, hideHeader]);

  const wrapperClasses = [
    'fixed',
    'top-0',
    'left-0',
    'right-0',
    'bottom-0',
    'flex',
    'flex-col',
    'space-y-3',
    'overflow-x-hidden',
    'transition-all',
    'duration-200',
  ];

  // If we want overflow hidden on main area, else auto
  if (overflowHidden) {
    wrapperClasses.push('overflow-hidden');
  } else {
    wrapperClasses.push('overflow-y-auto');
  }

  // For full width, we already have left-0, right-0
  // If not fullWidth, you could add container classes (optional)
  // Just leave as is for now.

  const contentClasses = ['w-full', 'h-full'];

  if (!noPadding) {
    if (fullWidth && isDesktop) {
      // Some padding if fullWidth and desktop
      contentClasses.push('px-6', 'py-4');
    } else {
      // Default padding
      contentClasses.push('p-4');
    }
  }

  // Calculate safe area aware padding for iOS
  const getSafeAreaStyle = () => {
    if (hideHeader) {
      const style = {
        paddingTop: isIOS ? 'env(safe-area-inset-top)' : 0,
        paddingBottom: noPadding ? 0 : '1.25rem',
        // Adjust for persistent drawer only if drawerVisible is true
        paddingLeft: user && drawerOpen && isDesktop && drawerVisible ? `${DRAWER_WIDTH}px` : 0,
        marginLeft: user && drawerOpen && isDesktop && drawerVisible ? 0 : 0,
      };
      return style;
    }

    let paddingTop;
    if (headerVisible) {
      if (isIOS) {
        // Use CSS calc to combine safe area with calculated top value
        paddingTop = `calc(env(safe-area-inset-top) + ${top}px)`;
      } else {
        paddingTop = `${top}px`;
      }
    } else {
      paddingTop = isIOS ? 'env(safe-area-inset-top)' : 0;
    }

    const style = {
      paddingTop,
      paddingBottom: noPadding ? 0 : '1.25rem',
      // Adjust for persistent drawer only if drawerVisible is true
      paddingLeft: user && drawerOpen && isDesktop && drawerVisible ? `${DRAWER_WIDTH}px` : 0,
      marginLeft: user && drawerOpen && isDesktop && drawerVisible ? 0 : 0,
    };

    return style;
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div
        className={wrapperClasses.join(' ')}
        style={getSafeAreaStyle()}
      >
        {shouldShowGradient && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none"
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
                  top: (isConverging || isCreating) ? '50%' : sphere.top,
                  left: (isConverging || isCreating) ? '50%' : sphere.left,
                  right: (isConverging || isCreating) ? 'auto' : sphere.right,
                  transform: (isConverging || isCreating) ? 'translate(-50%, -50%) scale(2.2)' : 'none',
                  animation: (isConverging || isCreating)
                    ? 'none'
                    : `fadeInAgent 1s ease-out ${sphere.delay * 0.15}s forwards, floatAgentSubtle ${sphere.duration}s ease-in-out ${1 + sphere.delay}s infinite`,
                  transition: isConverging 
                    ? `transform 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s, top 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s, left 4s cubic-bezier(0.16, 1, 0.3, 1) ${sphere.delay * 0.05}s`
                    : 'none',
                  willChange: 'transform, top, left',
                  zIndex: (isConverging || isCreating) ? 9999 : -1,
                  pointerEvents: 'none',
                  opacity: isBursting ? 0 : ((isConverging || isCreating) ? 1 : 0),
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${AGENT_IMAGES[sphere.imageIndex]})`,
                    borderRadius: '1000px',
                    filter: isConverging || isCreating
                      ? 'blur(10px) brightness(1.25) saturate(1.25)' 
                      : `blur(${sphere.blur}px) brightness(1.15) saturate(1.15)`,
                    opacity: isConverging || isCreating ? 0.8 : sphere.opacity,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(0, 0, 0, 0.08)',
                    animation: (isConverging || isCreating)
                      ? (isCreating ? `mergeAndPulse 3s ease-in-out ${sphere.delay * 0.1}s infinite` : 'none')
                      : `breathe ${sphere.duration * 0.5}s ease-in-out ${1 + sphere.delay * 0.5}s infinite`,
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
            <div 
              className="text-xl tracking-wide animate-pulse"
            >
              Creating your project...
            </div>
          </div>
        )}

        {/* Error modal */}
        {error && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center max-w-md mx-4">
              <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Creation Failed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setIsConverging(false);
                  setIsCreating(false);
                  history.push('/');
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        <div 
          className={contentClasses.join(' ')}
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

export default memo(CompactLayout);
