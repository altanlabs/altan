import { Popper } from '@mui/material';
import { memo } from 'react';

import ExecutionTimeline from './components/ExecutionTimeline';

const ExecutionHistoryButtonPopover = ({ open, anchorEl, onClose }) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: 1300 }}
    >
      <div
        style={{
          width: '300px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
        }}
      >
        <ExecutionTimeline onClose={onClose} />
      </div>
    </Popper>
  );
};

export default memo(ExecutionHistoryButtonPopover);
