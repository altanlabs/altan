import { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { CompactLayout } from '../../../layouts/dashboard';
import { hideHeader, showHeader } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import Workflow from '../../../sections/@dashboard/flows/Workflow';

const FlowPage = () => {
  const { flowId } = useParams();
  useEffect(() => {
    dispatch(hideHeader());
    return () => dispatch(showHeader());
  }, []);

  return (
    <CompactLayout noPadding>
      <Workflow id={flowId} />
    </CompactLayout>
  );
};

export default memo(FlowPage);
