import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  MenuItem,
  Card,
  CardContent,
  Grid,
  styled,
  Stack,
} from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { createPlan, updatePlanThunk } from '@redux/slices/subscriptions';

import { RHFTextField } from '../../../components/hook-form';
import { dispatch } from '../../../redux/store';
import { optimai } from '../../../utils/axios';

const IOSSlider = styled(Slider)(({ theme }) => ({
  color: '#007bff',
  height: 5,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
      '@media (hover: none)': {
        boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
      },
    },
    '&:before': {
      boxShadow:
        '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: 2,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: '#000',
      ...(theme.palette.mode === 'dark' && {
        color: '#fff',
      }),
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 5,
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    boxShadow: 'inset 0px 0px 4px -2px #000',
    backgroundColor: '#d0d0d0',
  },
  ...(theme.palette.mode === 'dark' && {
    color: '#0a84ff',
  }),
}));

const AltanerPlanDialog = ({ open, onClose, groupId, currentPlan = null }) => {
  const [pricing, setPricing] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState({});
  const accountId = useSelector((state) => state.general.account.id);

  const methods = useForm();

  const resetForm = () => {
    methods.reset({
      name: currentPlan?.name || '',
      description: currentPlan?.description || '',
      credits: currentPlan?.credits || 0,
      credit_type: currentPlan?.credit_type || '',
      margin: currentPlan?.meta_data?.margin_percentage || 0,
      billing_frequency: currentPlan?.billing_options?.items[0]?.billing_frequency || 'monthly',
    });
  };

  useEffect(() => {
    if (open) {
      const fetchPricing = async () => {
        try {
          const response = await optimai_shop.get('/pricing');
          const filteredPricing = response.data.pricing.map((group) => ({
            ...group,
            plans: {
              ...group.plans,
              items: [
                {
                  id: `${group.id}-zero`,
                  name: '0 Credits',
                  credits: 0,
                  billing_options: {
                    items: [
                      { billing_frequency: 'monthly', price: 0 },
                      { billing_frequency: 'yearly', price: 0 },
                    ],
                  },
                },
                ...group.plans.items
                  .filter((plan) => plan.name.toLowerCase() !== 'free')
                  .sort((a, b) => a.credits - b.credits),
              ],
            },
          }));
          setPricing(filteredPricing);
        } catch (error) {
          console.error('Failed to fetch pricing:', error);
        }
      };

      fetchPricing();
    }
  }, [open]);

  useEffect(() => {
    if (pricing) {
      resetForm();
      initializeSelectedPlans(pricing, currentPlan?.meta_data?.selected_plans || {});
    }
  }, [pricing, currentPlan]);

  const initializeSelectedPlans = (pricingData, currentSelectedPlans) => {
    const initialPlans = {};
    pricingData.forEach((group) => {
      const currentSelectedPlanId = currentSelectedPlans[group.id];
      if (currentSelectedPlanId) {
        initialPlans[group.id] = currentSelectedPlanId;
      } else if (group.plans.items.length > 0) {
        initialPlans[group.id] = group.plans.items[0].id;
      }
    });
    setSelectedPlans(initialPlans);
  };

  const getPriceForFrequency = (plan, frequency) => {
    const billingOption = plan.billing_options?.items.find(
      (o) => o.billing_frequency === frequency,
    );
    return billingOption ? billingOption.price : 0;
  };

  const formatPrice = (priceInCents) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const totalBaseCost = useMemo(() => {
    if (!pricing) return 0;
    let total = 0;
    Object.entries(selectedPlans).forEach(([groupId, planId]) => {
      const group = pricing.find((g) => g.id === groupId);
      const plan = group?.plans.items.find((p) => p.id === planId);
      if (plan) {
        total += getPriceForFrequency(plan, methods.watch('billing_frequency'));
      }
    });
    return total;
  }, [selectedPlans, methods.watch('billing_frequency'), pricing]);

  const calculateGroupPrice = (group) => {
    const billingFrequency = methods.watch('billing_frequency');
    const selectedPlan = group.plans.items.find((p) => p.id === selectedPlans[group.id]);
    return selectedPlan
      ? formatPrice(getPriceForFrequency(selectedPlan, billingFrequency))
      : '$0.00';
  };

  const handleClose = () => {
    methods.reset();
    setSelectedPlans({});
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      const planData = {
        name: data.name,
        description: data.description,
        account_id: accountId,
        group_id: groupId,
        credits: data.credits,
        credit_type: data.credit_type,
        billing_options: [
          {
            price: Math.round(totalBaseCost * (1 + parseFloat(data.margin) / 100)),
            currency: 'USD',
            billing_frequency: 'monthly',
            billing_cycle: 1,
          },
          {
            price: Math.round(totalBaseCost * 10 * (1 + parseFloat(data.margin) / 100)),
            currency: 'USD',
            billing_frequency: 'yearly',
            billing_cycle: 1,
          },
        ],
        meta_data: {
          ...data.meta_data,
          selected_plans: selectedPlans,
          margin_percentage: data.margin,
        },
      };
      if (currentPlan) {
        await dispatch(updatePlanThunk(currentPlan.id, planData));
      } else {
        await dispatch(createPlan(planData));
      }

      handleClose();
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const sliderComponents = useMemo(() => {
    if (!pricing) return null;

    return pricing.map((group) => (
      <Box
        key={group.id}
        my={3}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">{group.name}</Typography>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
          >
            {calculateGroupPrice(group)}
          </Typography>
        </Box>
        <IOSSlider
          value={group.plans.items.findIndex((p) => p.id === selectedPlans[group.id])}
          marks
          min={0}
          max={group.plans.items.length - 1}
          step={1}
          valueLabelDisplay="on"
          valueLabelFormat={(value) =>
            `${group.plans.items[value].credits.toLocaleString()} credits`}
          onChange={(_, newValue) => {
            setSelectedPlans((prev) => ({
              ...prev,
              [group.id]: group.plans.items[newValue].id,
            }));
          }}
        />
      </Box>
    ));
  }, [pricing, selectedPlans, methods.watch('billing_frequency')]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        {currentPlan ? 'Edit Project Subscription Plan' : 'Create Project Subscription Plan'}
      </DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack
              my={2}
              spacing={1}
            >
              <RHFTextField
                name="name"
                label="Plan Name"
                size="small"
                variant="filled"
              />
              <RHFTextField
                name="description"
                label="Plan Description"
                multiline
                size="small"
                variant="filled"
              />
              <Stack
                direction="row"
                spacing={1}
              >
                <RHFTextField
                  name="credits"
                  label="Credits"
                  type="number"
                  size="small"
                  variant="filled"
                />
                <RHFTextField
                  name="credit_type"
                  label="Unit of credits"
                  size="small"
                  variant="filled"
                />
              </Stack>
            </Stack>

            {sliderComponents}

            <Box my={2}>
              <RHFTextField
                name="billing_frequency"
                label="Billing Frequency"
                select
                fullWidth
                size="small"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </RHFTextField>
            </Box>

            <Grid
              container
              spacing={2}
              my={2}
            >
              <Grid
                item
                xs={4}
              >
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                    >
                      Base Cost
                    </Typography>
                    <Typography variant="h4">{formatPrice(totalBaseCost)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid
                item
                xs={4}
              >
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                    >
                      Your Margin
                    </Typography>
                    <RHFTextField
                      name="margin"
                      type="number"
                      InputProps={{
                        endAdornment: '%',
                        inputProps: { min: 0 },
                      }}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid
                item
                xs={4}
              >
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                    >
                      Total Price
                    </Typography>
                    <Typography variant="h4">
                      {formatPrice(
                        totalBaseCost * (1 + (Math.max(0, methods.watch('margin')) || 0) / 100),
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="soft"
          color="primary"
          onClick={methods.handleSubmit(onSubmit)}
          loading={methods.formState.isSubmitting}
        >
          {currentPlan ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AltanerPlanDialog;
