import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import StarterCategories from './starters/StarterCategories';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import { TextGenerateEffect } from '../../components/elevenlabs/ui/text-generate-effect';
import { useSettingsContext } from '../../components/settings';
import { PromptBox } from '../../components/ui/chatgpt-prompt-input';
import useLocales from '../../locales/useLocales';
import QuickAccessSection from '../../pages/dashboard/agentsmenu/QuickAccessSection';
import { createAgent, selectIsAccountFree } from '../../redux/slices/general/index.ts';

const NewHeroSection = ({ onSubmit, isCreating = false, onRequestAuth }) => {
  const { resolvedThemeMode } = useSettingsContext();
  const { isAuthenticated } = useAuthContext();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const history = useHistory();
  const [prefillPrompt, setPrefillPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const promptBoxRef = useRef(null);

  // Check if account is free (for unauthenticated users or users on free plan)
  const isAccountFree = useSelector(selectIsAccountFree);

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

  // Listen for custom event to select template
  useEffect(() => {
    const handleSelectTemplate = (event) => {
      const templateData = {
        id: event.detail.templateId,
        name: event.detail.templateName,
      };
      setSelectedTemplate(templateData);
    };

    window.addEventListener('selectHeroTemplate', handleSelectTemplate);
    return () => window.removeEventListener('selectHeroTemplate', handleSelectTemplate);
  }, []);

  const handleSend = async (value, files, selectedTool, githubData, templateData) => {
    if (!value.trim()) return;

    // Handle based on selected tool
    if (selectedTool === 'createAgent') {
      // Check authentication for agent creation
      if (!isAuthenticated) {
        if (onRequestAuth) {
          onRequestAuth();
        }
        return;
      }

      // Agent creation logic from CreateAgentDashboard
      try {
        const agentName = 'AI Assistant';
        const prompt = `You are a helpful AI assistant. Your goal is to assist users based on: ${value.trim()}`;
        const description =
          value.trim().substring(0, 100) + (value.trim().length > 100 ? '...' : '');

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
      // Create the idea first (even without auth) to preserve the user's input
      if (!isAuthenticated) {
        try {
          const attachments = await Promise.all(
            (files || []).map(async (file) => {
              const fileType = file.file.type;
              const extension = fileType.split('/')[1] || fileType.split('.').pop() || 'bin';
              return {
                file_name: file.name || `file.${extension}`,
                mime_type: fileType,
                file_content: file.url.split(',')[1],
              };
            }),
          );

          const requestBody = {
            name: 'Untitled Project',
            idea: value.trim(),
            icon: 'https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
            attachments,
            is_public: true,
            // Include GitHub data if provided
            ...(githubData?.url && {
              github_url: githubData.url,
              branch: githubData.branch || 'main',
            }),
            ...(githubData?.token && {
              github_token: githubData.token,
            }),
            // Include template_id if provided
            ...(templateData?.id && {
              template_id: templateData.id,
            }),
          };

          const response = await fetch('https://platform-api.altan.ai/idea', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();

          // Store the idea ID in sessionStorage so we can redirect after auth
          sessionStorage.setItem('pendingIdeaId', data.id);

          // Show auth popup
          if (onRequestAuth) {
            onRequestAuth();
          }
        } catch (error) {
          console.error('Error creating idea:', error);
          // Fallback to auth request if idea creation fails
          if (onRequestAuth) {
            onRequestAuth();
          }
        }
      } else {
        // User is authenticated - pass to onSubmit handler
        onSubmit(value.trim(), files, githubData, templateData);
      }
    }
  };

  return (
    <>
      {/* Hero Section - Fixed viewport height with top-aligned content */}
      <div
        id="hero"
        className="relative min-h-screen overflow-x-hidden"
      >
        {/* Fixed position container for title, subtitle, prompt box at consistent position */}
        <div className="w-full flex flex-col items-center relative z-10 px-4 sm:px-6 pt-32 md:pt-64 pb-48 md:pb-80">
          <div className="w-full max-w-2xl flex flex-col gap-4 items-center">
            <TextGenerateEffect
              words={translate('hero.title')}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center"
              duration={0.8}
            />
            <p className="text-center text-foreground/70">{translate('hero.subtitle')}</p>

            <div className="w-full">
              <PromptBox
                ref={promptBoxRef}
                onSend={handleSend}
                disabled={isCreating}
                externalValue={prefillPrompt}
                isAccountFree={isAccountFree}
                externalTemplate={selectedTemplate}
              />
            </div>
          </div>

          {/* Starter Categories - Wider Container - Expands below */}
          <div className="w-full max-w-6xl mt-4 mb-8">
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
        <div className="-mt-48 md:-mt-80 relative z-10 px-4 sm:px-6 flex justify-center overflow-x-hidden">
          <QuickAccessSection />
        </div>
      )}
    </>
  );
};

export default memo(NewHeroSection);
