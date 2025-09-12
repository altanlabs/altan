import { memo } from 'react';
import { useParams } from 'react-router-dom';

import Workflow from '../../../sections/@dashboard/flows/Workflow';

const FlowPage = () => {
  const { flowId } = useParams();
  return (
    <>
      <Workflow
        id={flowId}
        useCompactLayout={true}
      />
    </>
  );
};

export default memo(FlowPage);
