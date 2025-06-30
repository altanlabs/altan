import React, { memo } from 'react';
import { useParams } from 'react-router';

import { CompactLayout } from '../../../layouts/dashboard';
import Workflows from '../../../sections/@dashboard/flows/Workflows';

const FlowsPage = () => {
  const { flowId } = useParams();

  return (
    <CompactLayout
      title={'Flows · Altan'}
      noPadding
    >
      <Workflows />
    </CompactLayout>
  );
};

export default memo(FlowsPage);
