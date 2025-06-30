import { LoadingButton } from '@mui/lab';
import React, { memo, useCallback, useState } from 'react';

import Iconify from '../../../../components/iconify/Iconify';
import { getFlowExecutionDetails } from '../../../../redux/slices/flows';
import { dispatch } from '../../../../redux/store';

const SetExecutionRenderer = ({ data, onClose = null }) => {
  const [loading, setLoading] = useState(false);

  const fetchExecutionData = useCallback(() => {
    if (loading) {
      return false;
    }
    setLoading(true);
    dispatch(getFlowExecutionDetails(data.id, data.workflow_id, data)).then(() => {
      if (onClose) {
        onClose();
      }
      setLoading(false);
    });
  }, [data, loading, onClose]);

  return (
    <LoadingButton
      loading={loading}
      variant="soft"
      onClick={fetchExecutionData}
      startIcon={<Iconify icon="mdi:bug" />}
      size="small"
    >
      Debug
    </LoadingButton>
  );
};

export default memo(SetExecutionRenderer);
