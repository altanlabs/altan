import { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Agent from '../../components/agents/v2/Agent';

export default function AgentPage() {
  const history = useHistory();
  const { agentId } = useParams();

  const onGoBack = useCallback(() => history.push('/'), [history]);

  return (
    <div>
      <Agent
        agentId={agentId}
        onGoBack={onGoBack}
      />
    </div>
  );
}
