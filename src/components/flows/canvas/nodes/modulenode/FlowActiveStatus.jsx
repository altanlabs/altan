import { Tooltip } from '@mui/material';
import { memo } from 'react';

import FlowStatusBadge from './FlowStatusBadge';
import { patchFlow, selectFlowDetails, selectFlowStatus } from '../../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../../redux/store';

const FlowActiveStatus = () => {
  const flowStatus = useSelector(selectFlowStatus);
  const flowDetails = useSelector(selectFlowDetails);
  return (
    <Tooltip
      arrow
      title={`${flowDetails?.name || 'Flow'} is ${flowStatus ? 'active' : 'inactive'}. Click to ${flowStatus ? 'deactivate' : 'activate'} flow`}
    >
      <FlowStatusBadge
        status={flowStatus}
        onClick={() => dispatch(patchFlow(flowDetails.id, { is_active: !flowStatus }))}
        sx={{
          position: 'absolute',
          left: -4,
          top: -4,
        }}
      />
    </Tooltip>
  );
};

export default memo(FlowActiveStatus);
