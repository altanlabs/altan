import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import StarterCategories from './starters/StarterCategories';
import { useAuthContext } from '../../auth/useAuthContext';
import { TextGenerateEffect } from '../../components/elevenlabs/ui/text-generate-effect';
import { useSettingsContext } from '../../components/settings';
import { PromptBox } from '../../components/ui/chatgpt-prompt-input';
import QuickAccessSection from '../../pages/dashboard/NewDashboardPage/QuickAccessSection';
import { createAgent } from '../../redux/slices/general';

const NewHeroSection = ({ onSubmit, isCreating = false, onRequestAuth }) => {
  const { resolvedThemeMode } = useSettingsContext();
  const { isAuthenticated } = useAuthContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [prefillPrompt, setPrefillPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const promptBoxRef = useRef(null);

  // Background logo based on theme
  const backgroundLogoSrc = resolvedThemeMode === 'dark' ? '/ALTAN.svg' : '/ALTAN_LIGHT.svg';

  // Update prompt when category changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);

    // Clear prompt when deselecting
    if (!categoryId) {
      setPrefillPrompt('');
    }
  };

  // Listen for custom event to fill prompt
  useEffect(() => {
    const handleFillPrompt = (event) => {
      setPrefillPrompt(event.detail.prompt);
    };

    window.addEventListener('fillHeroPrompt', handleFillPrompt);
    return () => window.removeEventListener('fillHeroPrompt', handleFillPrompt);
  }, []);

  const handleSend = async (value, imagePreview, selectedTool) => {
    if (!value.trim()) return;

    // Check authentication first for any action
    if (!isAuthenticated) {
      if (onRequestAuth) {
        onRequestAuth();
      }
      return;
    }

    // Handle based on selected tool
    if (selectedTool === 'createAgent') {
      // Agent creation logic from CreateAgentDashboard

      try {
        const agentName = 'AI Assistant';
        const prompt = `You are a helpful AI assistant. Your goal is to assist users based on: ${value.trim()}`;
        const description = value.trim().substring(0, 100) + (value.trim().length > 100 ? '...' : '');

        const agentData = {
          name: agentName,
          prompt: prompt,
          description: description,
          voice: null,
          meta_data: {
            agent_type: 'General Assistant',
            goal: 'Assist users',
            industry: null,
            use_case: value.trim(),
            voice_name: null,
            created_from: 'dashboard',
            enhanced: false,
          },
        };

        const newAgent = await dispatch(createAgent(agentData));

        // Redirect to agent page with the use case as initial message
        const messageParam = encodeURIComponent(value.trim());
        history.push(`/agent/${newAgent.id}?message=${messageParam}`);
      } catch {
        // Silent catch - could add error UI here in the future
      }
    } else {
      // Default to project creation
      onSubmit(value.trim());
    }
  };

  return (
    <>
      {/* Hero Section - Fixed viewport height with top-aligned content */}
      <div
        id="hero"
        className="relative min-h-screen"
      >
        {/* Fixed position container for title, subtitle, prompt box at consistent position */}
        <div className="w-full flex flex-col items-center relative z-10 px-6 pt-64 ">
          <div className="w-full max-w-2xl flex flex-col gap-4 items-center">
            <TextGenerateEffect
              words="Build without limits"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center"
              duration={0.8}
            />
            <p className="text-center text-foreground/70">
              Describe the goal. Altan does the rest.{' '}
            </p>
            <div className="w-full">
              <PromptBox
                ref={promptBoxRef}
                onSend={handleSend}
                disabled={isCreating}
                externalValue={prefillPrompt}
              />
            </div>
          </div>

          {/* Starter Categories - Wider Container - Expands below */}
          <div className="w-full max-w-6xl mt-4">
            <StarterCategories
              onSelectPrompt={setPrefillPrompt}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
        {/* Large Background SVG Logo - Fades away when scrolling */}
        {!isAuthenticated && (
          <div className="fixed bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
            <img
              src={backgroundLogoSrc}
              alt=""
              className="w-[90vw] max-w-[1200px] h-auto"
            />
          </div>
        )}
      </div>

      {/* Quick Access Section - Separate section, pulled up with negative margin */}
      {isAuthenticated && (
        <div className="-mt-64 relative z-10 px-6 flex justify-center">
          <QuickAccessSection />
        </div>
      )}
    </>
  );
};

export default memo(NewHeroSection);
