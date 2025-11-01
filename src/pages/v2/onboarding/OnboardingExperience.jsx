import { m, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import SignupModal from './components/SignupModal';
import OnboardingLayout from './OnboardingLayout';
import Scene1_Welcome from './scenes/Scene1_Welcome';
import Scene3_Simulation from './scenes/Scene3_Simulation';
import Scene4_DirectInput from './scenes/Scene4_DirectInput';

const OnboardingExperience = () => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const sceneParam = params.get('scene');

  const [currentScene, setCurrentScene] = useState(sceneParam || 'demo'); // welcome | demo | direct - default to demo
  const [showSignup, setShowSignup] = useState(false);

  // Update URL when scene changes (only if not default 'demo')
  useEffect(() => {
    if (currentScene !== 'demo') {
      const newParams = new URLSearchParams(location.search);
      newParams.set('scene', currentScene);
      history.replace({ search: newParams.toString() });
    }
  }, [currentScene, history, location.search]);

  const handlePathSelect = (path) => {
    if (path === 'demo') {
      setCurrentScene('demo');
    } else if (path === 'direct') {
      // Redirect to landing page for direct input
      history.push('/demo/landing');
    }
  };

  // Path B (direct) uses CreateAnything which already handles signup flow
  // No need for custom signup modal here

  const handleCloseSignup = () => {
    setShowSignup(false);
  };

  return (
    <OnboardingLayout showFooter={currentScene === 'welcome'}>
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          {currentScene === 'welcome' && (
            <m.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <Scene1_Welcome onPathSelect={handlePathSelect} />
            </m.div>
          )}

          {currentScene === 'demo' && (
            <m.div
              key="demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <Scene3_Simulation />
            </m.div>
          )}

          {currentScene === 'direct' && (
            <m.div
              key="direct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <Scene4_DirectInput />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignup}
        onClose={handleCloseSignup}
        message="Create your Altan account to get started."
      />
    </OnboardingLayout>
  );
};

export default memo(OnboardingExperience);
