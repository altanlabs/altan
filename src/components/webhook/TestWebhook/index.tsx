import React, { useState } from 'react';

import { TestWebhookDialog } from './components/TestWebhookDialog';
import { Webhook } from './types';
import InteractiveButton from '../../buttons/InteractiveButton';

interface TestWebhookProps {
  webhook: Webhook;
}

export const TestWebhook: React.FC<TestWebhookProps> = ({ webhook }) => {
  const [open, setOpen] = useState(false);

  if (!webhook?.url) {
    return null;
  }

  return (
    <>
      <InteractiveButton
        icon="uil:bolt"
        title="Send a request to this webhook"
        onClick={() => setOpen(true)}
        duration={8000}
        containerClassName="h-[40] border-transparent"
        borderClassName="h-[80px] w-[250px]"
        enableBorder={true}
        className="p-2"
      />
      
      <TestWebhookDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        webhook={webhook} 
      />
    </>
  );
};

export default TestWebhook;
