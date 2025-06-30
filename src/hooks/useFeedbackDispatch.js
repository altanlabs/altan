import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';

import { dispatch } from '../redux/store';

const useFeedbackDispatch = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatchWithFeedback = useCallback(
    (action, options) => {
      const { successMessage, errorMessage, useSnackbar, useConsole } = options ?? {};

      setIsSubmitting(true);

      return dispatch(action)
        .then((res) => {
          if (useSnackbar instanceof Object ? useSnackbar.success : useSnackbar) {
            enqueueSnackbar(
              successMessage instanceof Function ? successMessage(res) : successMessage,
            );
          }
          if (useConsole instanceof Object ? useConsole.success : useConsole) {
            console.log(successMessage);
          }
          return Promise.resolve(res);
        })
        .catch((error) => {
          const detail = error.response?.data?.detail ?? error.message ?? 'Server Error';
          const detailMessage =
            typeof detail === 'object' ? JSON.stringify(detail, null, 2) : detail;
          const errorText = `${errorMessage}${detailMessage}`;
          if (useSnackbar instanceof Object ? useSnackbar.error : useSnackbar) {
            enqueueSnackbar(errorText, { variant: 'error' });
          }
          if (useConsole instanceof Object ? useConsole.error : useConsole) {
            console.error(detail);
          }
          return Promise.reject(detail);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [enqueueSnackbar],
  );

  return useMemo(() => [dispatchWithFeedback, isSubmitting], [dispatchWithFeedback, isSubmitting]);
};

export default useFeedbackDispatch;

// USAGE:
// const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
