import { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Agent from '../../components/agents/v2/Agent';
import { CompactLayout } from '../../layouts/dashboard';

export default function AgentPage() {
  const history = useHistory();;
  const { agentId } = useParams();

  const onGoBack = useCallback(() => history.push('/agents'), [history]);

  return (
    <CompactLayout noPadding>
      <Agent
        agentId={agentId}
        onGoBack={onGoBack}
      />
    </CompactLayout>
  );
}
