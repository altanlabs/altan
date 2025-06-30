import { Grid, Typography, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StyledCard = styled(Card)(({ theme, isSelected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
  ...(isSelected && {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[10],
  }),
}));

const FeatureList = styled('ul')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  marginBottom: 0,
}));

export default function SubscriptionPlan({
  plans,
  step,
  selectedPlan,
  yearly,
  onPlanSelect,
  convertCurrency,
  getPlanPrice,
}) {
  const sortedPlans = [...plans.items].sort((a, b) => getPlanPrice(a) - getPlanPrice(b));

  return (
    <Grid
      container
      spacing={2}
    >
      {sortedPlans.map((plan) => (
        <Grid
          item
          xs={12}
          sm={6}
          key={plan.id}
        >
          <StyledCard
            isSelected={selectedPlan?.id === plan.id}
            onClick={() => onPlanSelect(step, plan)}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
              >
                {plan.name}
              </Typography>
              <Typography
                variant="h3"
                gutterBottom
              >
                {plan.billing_options?.items ? (
                  <>
                    {convertCurrency(getPlanPrice(plan))}
                    <Typography
                      component="span"
                      variant="body2"
                    >
                      /{yearly ? 'year' : 'mo'}
                    </Typography>
                  </>
                ) : (
                  'Price not available'
                )}
              </Typography>
              <FeatureList>
                {plan.meta_data?.features?.map((feature, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component="li"
                  >
                    {feature}
                  </Typography>
                ))}
              </FeatureList>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
}
