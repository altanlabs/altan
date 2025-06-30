import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Agent from '../../components/agents/v2/Agent';
import { CompactLayout } from '../../layouts/dashboard';

export default function AgentPage() {
  const navigate = useNavigate();
  const { agentId } = useParams();

  const onGoBack = useCallback(() => navigate('/agents'), []);

  return (
    <CompactLayout noPadding>
      <Agent
        agentId={agentId}
        onGoBack={onGoBack}
      />
    </CompactLayout>
  );
}
