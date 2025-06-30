// BasicOpGroup.js
import { Stack } from '@mui/material';
import React, { memo, useCallback } from 'react';

import BasicOperator from './BasicOperator';
import VarsEditor from '../../flows/modules/VarsEditor';

const BasicOpGroup = ({ param, operation, onChange, disabled = false }) => {
  const handleParamChange = useCallback(
    (v) => {
      onChange({ param: v, operation });
    },
    [onChange, operation],
  );

  const handleOperationChange = useCallback(
    (operation) => {
      onChange({ param, operation });
    },
    [onChange, param],
  );

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      width="100%"
      className="flex-wrap"
    >
      <VarsEditor
        value={param ?? ''}
        onChange={handleParamChange}
        disabled={disabled}
      />
      <BasicOperator
        operator={operation.operator}
        value={operation.value}
        onChange={handleOperationChange}
        disabled={disabled}
      />
    </Stack>
  );
};

export default memo(BasicOpGroup);
