import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
import { memo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Iconify from './iconify/Iconify';
import useFeedbackDispatch from '../hooks/useFeedbackDispatch';
import { updateTemplate } from '../redux/slices/general';
import { listPlanGroups } from '../redux/slices/subscriptions';
import { dispatch } from '../redux/store';
import GroupEditor from '../sections/@dashboard/subscriptions/GroupEditor';

const selectAccountId = (state) => state.general.account?.id;
const selectIsLoadingSubscriptions = (state) => state.subscriptions.isLoading;
const selectInitializedSubscriptions = (state) => state.subscriptions.initialized;

const AltanerSubscriptionGroup = ({ onChange, value }) => {
  console.log('AltanerSubscriptionGroup', value);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const accountId = useSelector(selectAccountId);
  const initialized = useSelector(selectInitializedSubscriptions);
  const isLoading = useSelector(selectIsLoadingSubscriptions);

  useEffect(() => {
    if (accountId && !initialized && !isLoading) {
      dispatch(listPlanGroups(accountId));
    }
  }, [accountId, initialized, isLoading]);

  const handleCreateSusbcription = useCallback(() => {
    const data = {
      create_subscription: true,
    };
    dispatchWithFeedback(updateTemplate(value?.id, data), {
      useSnackbar: true,
      successMessage: 'Altaner Susbcription created successfully.',
      errorMessage: 'Could not create altaner subscription. Maybe it sucks? ',
    }).then(() => {
      // window.location.reload();
    });
  }, [dispatchWithFeedback, value?.id]);

  if (!!value?.subscription_group_id) {
    return (
      <GroupEditor
        groupId={value.subscription_group_id}
        isAltaner={true}
      />
    );
  }
  return (
    <div
      style={{
        width: '100%',
        height: '70vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Stack alignItems="center">
        <Typography
          variant="h4"
          align="center"
        >
          Subscription Magic Awaits!
        </Typography>
        <Typography
          align="center"
          sx={{ maxWidth: 400 }}
        >
          Transform your Altaner into a premium closed-source solution, unlocking the potential for
          recurring revenue and empowering you to monetize your innovative creations like never
          before.
        </Typography>
        <LoadingButton
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mdi:template-plus" />}
          sx={{ mt: 2, maxWidth: 300 }}
          onClick={handleCreateSusbcription}
          loading={isSubmitting}
        >
          Create subscription group
        </LoadingButton>
      </Stack>
    </div>
  );
};

export default memo(AltanerSubscriptionGroup);
