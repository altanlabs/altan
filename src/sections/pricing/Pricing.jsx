import { Box, Switch, Typography, Stack } from '@mui/material';
import React, { useState } from 'react';

import PricingPlanCard from './PricingPlanCard';

// ----------------------------------------------------------------------

const _pricingPlans = [
  {
    index: 1,
    subscription: 'bronze',
    price: 19,
    caption: '',
    lists: [
      { text: '1,000 credits/months', isAvailable: true },
      { text: '5 chatbots', isAvailable: true },
      { text: 'Embed on unlimited websites', isAvailable: true },
      { text: 'Autotranslations', isAvailable: true },
      { text: 'Multiplayer', isAvailable: false },
      { text: 'Option to use GPT-4', isAvailable: false },
      { text: 'Custom domain', isAvailable: false },
      { text: 'Omnichannel: Whatsapp, Instagram...', isAvailable: false },
      { text: 'Unbranded messenger', isAvailable: false },
      { text: 'Personalized service', isAvailable: false },
    ],
    labelAction: 'Start free trial',
  },
  {
    index: 2,
    subscription: 'silver',
    price: 99,
    caption: '',
    lists: [
      { text: '5,000 credits/month', isAvailable: true },
      { text: '10 chatbots', isAvailable: true },
      { text: 'Embed on unlimited websites', isAvailable: true },
      { text: 'Autotranslations', isAvailable: true },
      { text: 'Multiplayer: 5 team members', isAvailable: true },
      { text: 'Option to use GPT-4', isAvailable: true },
      { text: 'Custom domain', isAvailable: true },
      { text: 'Omnichannel: Whatsapp, Instagram...', isAvailable: false },
      { text: 'Unbranded messenger', isAvailable: false },
      { text: 'Personalized service', isAvailable: false },
    ],
    labelAction: 'Start free trial',
  },
  {
    index: 3,
    subscription: 'gold',
    price: 399,
    caption: '',
    lists: [
      { text: '50,000 credits', isAvailable: true },
      { text: '50 chatbots', isAvailable: true },
      { text: 'Embed on unlimited websites', isAvailable: true },
      { text: 'Autotranslations', isAvailable: true },
      { text: 'Multiplayer: 10 team members', isAvailable: true },
      { text: 'Option to use GPT-4', isAvailable: true },
      { text: 'Custom domain', isAvailable: true },
      { text: 'Omnichannel: Whatsapp, Instagram...', isAvailable: true },
      { text: 'Unbranded messenger', isAvailable: true },
      { text: 'Personalized service', isAvailable: true },
    ],
    labelAction: 'Start free trial',
  },
  // {
  //   index: 4,
  //   subscription: 'diamond',
  //   price: 'Custom',
  //   caption: '',
  //   lists: [
  //     { text: 'Unlimited credits', isAvailable: true },
  //     { text: 'Unlimited chatbots', isAvailable: true },
  //     { text: 'Unlimited Integrations', isAvailable: true },
  //     { text: 'Unlimited team members', isAvailable: true },
  //     { text: 'Unlimited access to all models', isAvailable: true },
  //     { text: 'Unbranded messenger', isAvailable: true },
  //     { text: 'Video transcription', isAvailable: true },
  //     { text: 'Text-to-speech', isAvailable: true },
  //     { text: 'Dedicated support agent', isAvailable: true },
  //   ],
  //   labelAction: 'Talk to sales',
  // },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const handleSwitchChange = (event) => {
    setIsYearly(event.target.checked);
  };

  return (
    <>
      <Box sx={{ mb: 2, p: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Typography
            variant="overline"
            sx={{ mr: 1.5 }}
          >
            MONTHLY
          </Typography>

          <Switch onChange={handleSwitchChange} />
          <Typography
            variant="overline"
            sx={{ ml: 1.5 }}
          >
            YEARLY
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          align="right"
          sx={{ color: 'text.secondary', display: 'block' }}
        >
          * Two months free when you pay annually
        </Typography>
      </Box>

      <Box
        gap={2}
        display="grid"
        gridTemplateColumns={{ md: 'repeat(3, 1fr)' }}
      >
        {_pricingPlans.map((card, index) => {
          const price = isYearly ? card.price * 10 : card.price;
          return (
            <PricingPlanCard
              key={card.subscription}
              card={{ ...card, price }}
              index={card.index}
              isYearly={isYearly}
              isEnterprise={card.subscription === 'diamond'}
            />
          );
        })}
      </Box>
    </>
  );
}
