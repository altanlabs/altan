import { LoadingButton } from '@mui/lab';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { createPlan, updatePlanThunk } from '@redux/slices/subscriptions';

import { SubscriptionPlanCreate } from './subscriptionSchemas';
import FormParameter from '../../../components/tools/form/FormParameter';
import formatData from '../../../utils/formatData';

const PlanDialog = ({ open, onClose, groupId, currentPlan = null }) => {
  const dispatch = useDispatch();
  const accountId = useSelector((state) => state.general.account.id);
  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      credits: '',
      credit_type: '',
      meta_data: '',
      billing_options: [{ price: '', currency: 'USD', billing_frequency: '', billing_cycle: 1 }],
    },
  });

  useEffect(() => {
    if (currentPlan) {
      methods.reset({
        ...currentPlan,
        billing_options: currentPlan.billing_options.items.map((option) => ({
          ...option,
          price: option.price.toString(),
          billing_cycle: option.billing_cycle.toString(),
        })),
      });
    } else {
      methods.reset({
        name: '',
        description: '',
        credits: '',
        credit_type: '',
        meta_data: '',
        billing_options: [{ price: '', currency: 'USD', billing_frequency: '', billing_cycle: 1 }],
      });
    }
  }, [currentPlan, methods]);

  const onSubmit = async (data) => {
    try {
      const planData = {
        ...data,
        account_id: accountId,
        group_id: groupId,
        billing_options: data.billing_options.map((option) => ({
          ...option,
          price: parseInt(option.price, 10),
          billing_cycle: parseInt(option.billing_cycle, 10),
        })),
      };
      console.log('dirty', planData);
      const clean = formatData(planData, SubscriptionPlanCreate);
      console.log('clean', clean);
      dispatch(currentPlan ? updatePlanThunk(currentPlan.id, clean) : createPlan(clean)).then(
        (res) => {
          methods.reset();
          onClose();
        },
      );
    } catch (error) {
      console.error('Failed to save plan:', error);
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
      <DialogTitle>
        {currentPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {renderForm(SubscriptionPlanCreate, ['account_id', 'group_id'])}
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={methods.handleSubmit(onSubmit)}
          loading={methods.formState.isSubmitting}
        >
          {currentPlan ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default PlanDialog;
