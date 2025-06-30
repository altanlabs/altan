import { LoadingButton } from '@mui/lab';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { createPlanGroup, updatePlanGroupThunk } from '@redux/slices/subscriptions';

import { SubscriptionPlanGroupCreate } from './subscriptionSchemas';
import FormParameter from '../../../components/tools/form/FormParameter';
import formatData from '../../../utils/formatData';

const GroupDialog = ({ open, onClose, currentGroup = null }) => {
  const dispatch = useDispatch();
  const accountId = useSelector((state) => state.general.account.id);
  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      meta_data: {},
    },
  });

  useEffect(() => {
    if (currentGroup) {
      methods.reset(currentGroup);
    } else {
      methods.reset({
        name: '',
        description: '',
        meta_data: {},
      });
    }
  }, [currentGroup, methods]);

  const onSubmit = async (data) => {
    try {
      const groupData = {
        ...data,
        account_id: accountId,
      };
      const clean = formatData(groupData, SubscriptionPlanGroupCreate);
      console.log('clean', clean);
      if (currentGroup) {
        await dispatch(updatePlanGroupThunk(currentGroup.id, clean));
      } else {
        await dispatch(createPlanGroup(clean));
      }

      methods.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save group:', error);
    }
  };

  const renderForm = (schema, excludeFields = []) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Object.entries(schema.properties).map(([key, fieldSchema]) => {
        if (excludeFields.includes(key)) return null;
        return (
          <FormParameter
            key={key}
            fieldKey={key}
            name={key}
            schema={fieldSchema}
            required={schema.required?.includes(key)}
          />
        );
      })}
    </Box>
  );

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{currentGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {renderForm(SubscriptionPlanGroupCreate, ['account_id'])}
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={methods.handleSubmit(onSubmit)}
          loading={methods.formState.isSubmitting}
        >
          {currentGroup ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDialog;
