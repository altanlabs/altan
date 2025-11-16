import { useState, memo } from 'react';
import { useHistory } from 'react-router-dom';

import TextAreaWithButtons from './create/TextAreaWithButtons';
import { useAuthContext } from '../../../auth/useAuthContext.ts';
import { createFlow } from '../../../redux/slices/general/index.ts';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';

function CreateFlowDashboard({ handleVoice }) {
  const history = useHistory();
  const { isAuthenticated } = useAuthContext();
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (files, githubData, isPublic = true, customPrompt = null) => {
    // Use custom prompt if provided, otherwise use inputValue
    const promptToUse = customPrompt || inputValue;

    if (!promptToUse.trim()) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      history.push('/auth/register');
      return;
    }

    setLoading(true);
    try {
      // Call FlowSync webhook to generate flow name and description
      const webhookResponse = await fetch('https://api.altan.ai/galaxia/hook/CaUlF9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToUse,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to generate flow details from FlowSync');
      }

      const flowData = await webhookResponse.json();
      
      // Create flow with the generated data
      const completeData = {
        name: flowData.name || 'Untitled Flow',
        description: flowData.description || promptToUse.substring(0, 100) + (promptToUse.length > 100 ? '...' : ''),
      };

      // Create the flow using the Redux action with null prompt and altaner_component_id as requested
      const newFlow = await dispatchWithFeedback(createFlow(completeData, null, null), {
        successMessage: 'Workflow created successfully',
        errorMessage: 'There was an error creating the flow: ',
        useSnackbar: true,
        useConsole: { error: true },
      });

      // Redirect to the new flow
      if (newFlow && newFlow.id) {
        history.push(`/flow/${newFlow.id}`);
      }

    } catch (error) {
      console.error('Error creating flow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto">
      <div className="text-center">
        <div
          data-aos="fade-down"
          data-aos-delay="200"
        >
          <div className="relative flex flex-col mt-2">
            <TextAreaWithButtons
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleCreate={handleCreate}
              loading={loading}
              handleVoice={handleVoice}
              showPlusButton={false}
              showAutopilotButton={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateFlowDashboard); 