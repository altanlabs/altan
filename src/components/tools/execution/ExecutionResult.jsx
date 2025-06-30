import { Box } from '@mui/material';
import React, { memo } from 'react';

import useCopyToClipboard from '../../../hooks/useCopyToClipboard';
import AceWrapper from '../../json/AceWrapper';

const ExecutionResult = ({ actionExecution }) => {
  const { copy } = useCopyToClipboard();

  // console.log("actionExecution", actionExecution)
  if (!actionExecution.result && !actionExecution.error) return null;
  const getDisplayValue = (value) => {
    try {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString();
      if (stringValue.length > 10000) {
        return stringValue.substring(0, 10000) + '...';
      }
      return stringValue;
    } catch (e) {
      console.error('Error processing value:', e);
      return 'Error displaying data';
    }
  };

  const content = actionExecution.result || actionExecution.error;
  const displayValue = getDisplayValue(content);

  return (
    <div style={{ position: 'relative' }}>
      <Box
        sx={{
          mt: 1,
          border: `1px solid ${!actionExecution.error ? 'green' : 'red'}`,
          borderRadius: '12px',
          minHeight: '100px',
          height: 'min-content',
          maxHeight: '400px',
          overflowX: 'hidden',
          overflowY: 'auto',
          cursor: 'copy',
        }}
        onClick={() =>
          copy(typeof content === 'object' ? JSON.stringify(content, null, 2) : content.toString())}
      >
        <AceWrapper
          name="executionResult"
          value={displayValue}
          readOnly={true}
        />
      </Box>
    </div>
  );
};

export default memo(ExecutionResult);
