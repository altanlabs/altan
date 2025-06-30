import { memo } from 'react';
import { useParams } from 'react-router';

import Interface from './Interface.jsx';
import { CompactLayout } from '../../../layouts/dashboard';

function InterfacePage() {
  const { interfaceId } = useParams();

  return (
    <CompactLayout noPadding>
      <Interface id={interfaceId} />
    </CompactLayout>
  );
}

export default memo(InterfacePage);
