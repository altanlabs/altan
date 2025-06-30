import { Stack, Typography, Popper, Chip } from '@mui/material';
import { memo, useCallback } from 'react';

import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { stopExecution } from '../../../../redux/slices/flows';
import { bgBlur } from '../../../../utils/cssStyles';
import { fToNow } from '../../../../utils/formatTime';

const RunningExecutionsPopover = ({ open, anchorEl, runningExecutions }) => {
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const handleStopExecution = useCallback(
    (currentExecutionId) => {
      dispatchWithFeedback(stopExecution(currentExecutionId), {
        successMessage: 'Execution stop requested successfully!',
        errorMessage: 'Error stopping execution',
        useSnackbar: true,
      });
    },
    [dispatchWithFeedback],
  );
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: 1300 }}
    >
      <Stack
        sx={{
          width: '200px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
        }}
        spacing={1}
      >
        {runningExecutions?.map((e) => (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            key={`to-stop-${e.id}`}
            padding={1}
            sx={{
              borderRadius: 2,
              ...bgBlur({ opacity: 0.5 }),
            }}
          >
            <Stack>
              <Typography
                variant="body2"
                sx={{
                  width: 120,
                }}
                noWrap
              >
                {e.id}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  width: 120,
                }}
              >
                {!e.date_creation ? 'no date' : fToNow(e.date_creation)}
              </Typography>
            </Stack>
            <Chip
              size="small"
              color="error"
              label="Stop"
              onClick={() => handleStopExecution(e.id)}
            />
          </Stack>
        ))}
      </Stack>
    </Popper>
  );
};

export default memo(RunningExecutionsPopover);
