import { m } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import EnhancedCommandInput from '../../components/EnhancedCommandInput';
import AgentRecruitment from '../components/AgentRecruitment';
import ChatMessage from '../components/ChatMessage';
import DemoClarifyingQuestions from '../components/DemoClarifyingQuestions';
import DemoPlanExecution from '../components/DemoPlanExecution';
import DemoPlanWidget from '../components/DemoPlanWidget';
import SimulatedInput from '../components/SimulatedInput';
import { DIALOGUE_SCRIPT, DEMO_QUESTIONS, DEMO_PLAN, AGENT_RECRUITMENT } from '../mockData';

const Scene3_Simulation = () => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const stepParam = params.get('step');
  const sceneParam = params.get('scene');
  const subsceneParam = params.get('subscene');

  const fullMessage = DIALOGUE_SCRIPT.problem;
  const displayPrompt = 'Just type any problem or goal you have';

  // Determine initial step based on query params
  let initialStep = 0;
  let initialBuildComplete = false;
  let initialClosingStep = 0;
  if (sceneParam === 'plan' || subsceneParam === 'plan') {
    initialStep = 6; // Jump to execution view
  } else if (subsceneParam === 'finish') {
    initialStep = 7; // Jump to closing sequence
    initialBuildComplete = true;
    initialClosingStep = 0; // Start from beginning of closing sequence
  } else if (stepParam) {
    initialStep = parseInt(stepParam);
  }

  const [step, setStep] = useState(initialStep);
  const [messages, setMessages] = useState(
    initialStep >= 6
      ? [
          { id: 1, text: fullMessage, isUser: true },
          { id: 3, text: 'Perfect. Let me bring in the right specialists for this.', isUser: false },
          { id: 'agent-Genesis', text: "Genesis here. I'll create your specialized AI agents with voice capabilities", isUser: false, agentName: 'Genesis' },
          { id: 'agent-Cloud', text: "Cloud here. I'll build your ticket system, customer database, and knowledge base", isUser: false, agentName: 'Cloud' },
          { id: 'agent-Interface', text: "Interface here. I'll design your support dashboard with AI chat and real-time updates", isUser: false, agentName: 'Interface' },
          { id: 'agent-Services', text: "Services here. I'll automate Slack alerts and intelligent ticket categorization", isUser: false, agentName: 'Services' },
          { id: 'planning-intro', text: "Now that I have the team ready, I'll create a plan.", isUser: false },
        ]
      : [],
  );
  const [typedMessage, setTypedMessage] = useState(initialStep >= 1 ? fullMessage : '');
  const [typedDisplayMessage, setTypedDisplayMessage] = useState(initialStep >= 1 ? displayPrompt : '');
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [buildComplete, setBuildComplete] = useState(initialBuildComplete);
  const [closingStep, setClosingStep] = useState(initialClosingStep);

  // Step 0: Auto-type user message (display the prompt placeholder)
  useEffect(() => {
    if (step === 0 && typedDisplayMessage.length < displayPrompt.length) {
      const timer = setTimeout(() => {
        setTypedDisplayMessage(displayPrompt.slice(0, typedDisplayMessage.length + 1));
        // Also track the actual message in background
        setTypedMessage(fullMessage.slice(0, typedDisplayMessage.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else if (step === 0 && typedDisplayMessage.length === displayPrompt.length) {
      // Set full actual message when display typing completes
      setTypedMessage(fullMessage);
      setTimeout(() => setStep(1), 1500);
    }
  }, [step, typedDisplayMessage, fullMessage, displayPrompt]);

  // Step 1: Send message
  useEffect(() => {
    if (step === 1) {
      setMessages([{ id: 1, text: fullMessage, isUser: true }]);
      setTimeout(() => setStep(2), 1000);
    }
  }, [step, fullMessage]);

  // Step 2: Altan responds
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 3: Questions complete → show recruitment message
  const handleQuestionsComplete = () => {
    // First, move to step 3.5 to hide questions
    setTimeout(() => {
      setStep(3.5);
      // Then show recruitment message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 3,
            text: 'Perfect. Let me bring in the right specialists for this.',
            isUser: false,
          },
        ]);
        // Wait before starting agent recruitment (allow audio to play)
        setTimeout(() => setStep(4), 3000);
      }, 800);
    }, 500);
  };

  // Handle agent messages being added to chat history
  const handleAgentMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  // Step 4: Agents recruited → Altan says making plan
  const handleRecruitmentComplete = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'planning-intro',
          text: "Now that I have the team ready, I'll create a plan.",
          isUser: false,
        },
      ]);
      setStep(5);
    }, 2500); // Increased delay to show hired team longer
  };

  // Step 5: Plan shown, auto-show approve button
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => setShowApproveButton(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 6: Plan approved → show execution
  const handleApprovePlan = () => {
    setShowApproveButton(false);
    // Update URL to add subscene=plan
    const newParams = new URLSearchParams(location.search);
    newParams.set('subscene', 'plan');
    history.replace({ search: newParams.toString() });
    setTimeout(() => setStep(6), 500);
  };

  // Handler to move to landing page
  const handleContinue = () => {
    history.push('/demo/landing?from=demo');
  };

  // Closing sequence - show messages one by one
  useEffect(() => {
    if (step === 7) {
      if (closingStep === 0) {
        setTimeout(() => setClosingStep(1), 500);
      } else if (closingStep === 1) {
        setTimeout(() => setClosingStep(2), 3000);
      } else if (closingStep === 2) {
        setTimeout(() => setClosingStep(3), 2500);
      } else if (closingStep === 3) {
        setTimeout(() => setClosingStep(4), 3000);
      }
    }
  }, [step, closingStep]);

  // Before approval: Centered chat view
  if (step < 6) {
    return (
      <div className="w-full h-full flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-4xl max-h-full space-y-6 overflow-y-auto scrollbar-hide">
          {/* Chat Messages - All messages stay visible */}
          <div className="space-y-4">
            {/* User message */}
            {step >= 1 && messages.find((m) => m.id === 1) && (
              <ChatMessage
                key="user-msg"
                message={fullMessage}
                isUser={true}
                showAvatar={false}
              />
            )}

            {/* Altan response */}
            {step >= 2 && (
              <ChatMessage
                key="altan-response"
                message={DIALOGUE_SCRIPT.response}
                isUser={false}
                showAvatar={true}
                useTypewriter={step === 2}
                audioFile={step === 2 ? '/audio/agents/altan-response.mp3' : null}
              />
            )}

            {/* Recruitment message */}
            {step >= 3.5 && messages.find((m) => m.id === 3) && (
              <ChatMessage
                key="recruitment-msg"
                message="Perfect. Let me bring in the right specialists for this."
                isUser={false}
                showAvatar={true}
                audioFile={step === 3.5 ? '/audio/agents/altan-recruitment.mp3' : null}
              />
            )}

            {/* Planning message (after agents recruited) */}
            {step >= 5 && messages.find((m) => m.id === 'planning-intro') && (
              <ChatMessage
                key="planning-msg"
                message="Now that I have the team ready, I'll create a plan."
                isUser={false}
                showAvatar={true}
                useTypewriter={step === 5}
                audioFile={step === 5 ? '/audio/agents/altan-planning.mp3' : null}
              />
            )}
          </div>

          {/* Typing Input (Step 0 only) */}
          {step === 0 && (
            <SimulatedInput
              value={typedMessage}
              displayValue={typedDisplayMessage}
              isComplete={typedDisplayMessage === displayPrompt}
              showPulse={false}
              audioFile="/audio/agents/altan-prompt.mp3"
            />
          )}

          {/* Clarifying Questions (Step 3) */}
          {step === 3 && (
            <DemoClarifyingQuestions
              questions={DEMO_QUESTIONS}
              onComplete={handleQuestionsComplete}
              autoSelect={true}
            />
          )}

          {/* Agent Recruitment as Chat Messages (Step 4) */}
          {step === 4 && (
            <AgentRecruitment
              agents={AGENT_RECRUITMENT}
              onComplete={handleRecruitmentComplete}
              onAgentMessage={handleAgentMessage}
            />
          )}

          {/* Plan Widget (Step 5) */}
          {step === 5 && (
            <div className="space-y-4">
              <DemoPlanWidget
                plan={DEMO_PLAN}
                onApprove={handleApprovePlan}
                showApproveButton={showApproveButton}
              />

              {/* Hint to approve */}
              {showApproveButton && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <p className="text-sm text-gray-500">Click the green button to start execution</p>
                </m.div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 6: After approval - Split layout (chat stays visible)
  if (step === 6) {
    return (
      <div className="w-full h-full flex overflow-hidden">
        {/* Left: Chat (30%) - Always visible */}
        <div className="w-[30%] border-r border-gray-700/50 p-6 pt-12 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Show all previous messages with correct avatars */}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                showAvatar={!msg.isUser}
                agentName={msg.agentName}
              />
            ))}

            {/* Execution message */}
            <ChatMessage
              message="Plan approved! Executing now. Watch the progress on the right..."
              isUser={false}
              showAvatar={true}
              audioFile={step === 6 && !buildComplete ? '/audio/agents/altan-execution.mp3' : null}
            />

            {/* Build complete message */}
            {buildComplete && (
              <>
                <ChatMessage
                  message="🎉 Your AI Customer Support Hub is live! Check it out on the right."
                  isUser={false}
                  showAvatar={true}
                  audioFile="/audio/agents/altan-complete.mp3"
                />
                
                {/* Continue button with prominent styling */}
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex flex-col items-center mt-8 pt-6 border-t border-gray-700/50"
                >
                  <div className="relative">
                    {/* Pulsing glow effect */}
                    <m.div
                      className="absolute inset-0 rounded-full bg-blue-500/40 blur-2xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: 'calc(100% + 32px)',
                        height: 'calc(100% + 32px)',
                        left: '-16px',
                        top: '-16px',
                      }}
                    />
                    
                    <m.button
                      onClick={handleContinue}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative px-10 py-4 rounded-full text-lg font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors duration-200 shadow-2xl"
                    >
                      Ready to build your own?
                    </m.button>
                  </div>
                  
                  {/* Helper text */}
                  <m.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-sm text-gray-400 mt-3 flex items-center gap-2"
                  >
                    <m.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ☝️
                    </m.span>
                    Click to get started with your own AI team
                  </m.p>
                </m.div>
              </>
            )}
          </div>
        </div>

        {/* Right: Plan Execution (70%) */}
        <div className="w-[70%] overflow-hidden">
        <DemoPlanExecution
          plan={DEMO_PLAN}
          isBuildComplete={buildComplete}
          onBuildComplete={() => {
            setBuildComplete(true);
          }}
        />
        </div>
      </div>
    );
  }

  // Step 7: Closing sequence → prompt user to start
  if (step === 7) {
    return (
      <div className="w-full h-full flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-4xl space-y-8">
          {/* Closing messages */}
          <div className="space-y-4">
            {closingStep >= 1 && (
              <ChatMessage
                key="closing-1"
                message="This was a glimpse of how our agents work together."
                isUser={false}
                showAvatar={true}
                useTypewriter={closingStep === 1}
              />
            )}

            {closingStep >= 2 && (
              <ChatMessage
                key="closing-2"
                message="Now it's your turn."
                isUser={false}
                showAvatar={true}
                useTypewriter={closingStep === 2}
              />
            )}

            {closingStep >= 3 && (
              <ChatMessage
                key="closing-3"
                message="Tell me what you'd like to build, and I'll assemble your team."
                isUser={false}
                showAvatar={true}
                useTypewriter={closingStep === 3}
              />
            )}
          </div>

          {/* Show input field after messages */}
          {closingStep >= 4 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-3xl mx-auto mt-8"
            >
              <EnhancedCommandInput handleVoice={() => {}} />
            </m.div>
          )}
        </div>
      </div>
    );
  }

  // Fallback - shouldn't reach here
  return null;
};

export default memo(Scene3_Simulation);
