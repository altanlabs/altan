import { Box, Tooltip } from '@mui/material';
import { memo, useCallback } from 'react';

import useFeedbackDispatch from '../../../../../hooks/useFeedbackDispatch';
import { addRouterCondition } from '../../../../../redux/slices/flows';
import Iconify from '../../../../iconify';

const PlusIconRouter = ({ id, type, selected }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const onClick = useCallback(
    () =>
      dispatchWithFeedback(addRouterCondition(id), {
        useSnackbar: false,
      }),
    [dispatchWithFeedback, id],
  );

  return (
    <Tooltip
      title="Add new route. Every added route becomes the origin of a subpath in the workflow"
      arrow
      followCursor
    >
      <Box
        className="plus-icon-router"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          display: 'none',
          transition: 'all 300ms ease',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: '#fff',
          color: '#000',
          cursor: 'pointer',
          ...((selected || isSubmitting) && {
            display: 'flex',
          }),
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            backgroundColor: '#ccc',
          },
        }}
        onClick={onClick}
      >
        <Iconify
          icon={isSubmitting ? 'eos-icons:loading' : 'mdi:plus'}
          width={30}
        />
      </Box>
    </Tooltip>
  );
};

export default memo(PlusIconRouter);
