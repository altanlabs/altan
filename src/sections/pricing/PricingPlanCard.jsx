import { Player } from '@lottiefiles/react-lottie-player';
import {
  Card,
  Button,
  Typography,
  Box,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import Label from '../../components/label';
import { createSubscription } from '../../redux/slices/subscription';

const animationUrls = {
  bronze: 'https://assets10.lottiefiles.com/private_files/lf30_rhzlr20k.json',
  silver: 'https://assets10.lottiefiles.com/private_files/lf30_klgngxio.json',
  gold: 'https://assets10.lottiefiles.com/private_files/lf30_bo2860in.json',
  diamond: 'https://lottie.host/e83d748c-8181-47c7-9fcb-b05f6baa6792/u7qVYCAlAj.json',
};

export default function PricingPlanCard({ card, isYearly, index, isEnterprise, sx, ...other }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { account } = useSelector((state) => state.general);
  // console.log(account);
  const { subscription, price, caption, lists, labelAction } = card;
  const dispatch = useDispatch();

  const handleSubscription = useCallback(
    (userEmail, plan, account_id) => {
      dispatch(createSubscription({ userEmail, plan, account_id, isYearly }));
    },
    [dispatch, isYearly],
  );

  const onButtonClick = useCallback(() => {
    if (subscription === 'free' || !user) {
      navigate('/auth/register', { replace: true });
    } else if (!account) {
      navigate('/platform/account/settings?tab=billing', { replace: true });
    } else {
      handleSubscription(user.email, subscription, account.id);
    }
  }, [handleSubscription, subscription, user]);

  const renderPlayer = (subscription) => {
    return (
      <Player
        src={animationUrls[subscription]}
        className="player"
        loop
        autoplay
      >
      </Player>
    );
  };

  return (
    <Card
      sx={{
        p: 4,
        minWidth: 300,
        boxShadow: (theme) => theme.customShadows.z24,
        ...((index === 0 || index === 2) && {
          bgcolor: 'background.default',
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }),
        ...sx,
      }}
      {...other}
    >
      {index === 2 && (
        <Label
          color="info"
          sx={{ top: 16, right: 16, position: 'absolute' }}
        >
          POPULAR
        </Label>
      )}

      <Typography
        variant="overline"
        sx={{ color: 'text.secondary' }}
      >
        {subscription}
      </Typography>

      <Stack
        spacing={1}
        direction="row"
        sx={{ my: 2 }}
      >
        {isEnterprise ? (
          <Typography variant="h2">Custom</Typography>
        ) : (
          <>
            {index < 4 && <Typography variant="h5">$</Typography>}
            <Typography variant="h2">{price === 0 ? 'Free' : price}</Typography>
            <Typography
              component="span"
              sx={{ alignSelf: 'center', color: 'text.secondary' }}
            >
              {isYearly ? '/yearly' : '/monthly'}
            </Typography>
          </>
        )}
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: 'primary.main',
          textTransform: 'capitalize',
        }}
      >
        {caption}
      </Typography>

      <Box sx={{ width: 180, height: 100, mb: 10, mt: -2, ml: -4 }}>
        {renderPlayer(subscription)}
      </Box>
      <Button
        fullWidth
        size="large"
        variant="soft"
        onClick={onButtonClick}
      >
        {labelAction}
      </Button>
      <Accordion sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
          <Typography variant="subtitle1">View features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            {lists.map((item) => (
              <Stack
                key={item.text}
                component="li"
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  typography: 'body2',
                  color: item.isAvailable ? 'text.primary' : 'text.disabled',
                }}
              >
                <Iconify
                  icon={item.isAvailable ? 'eva:checkmark-fill' : 'eva:close-fill'}
                  width={16}
                  sx={{
                    color: item.isAvailable ? 'primary.main' : 'inherit',
                  }}
                />
                <Typography variant="body2">{item.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

PricingPlanCard.propTypes = {
  sx: PropTypes.object,
  card: PropTypes.shape({
    subscription: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    caption: PropTypes.string,
    lists: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        isAvailable: PropTypes.bool.isRequired,
      }),
    ).isRequired,
    labelAction: PropTypes.string.isRequired,
  }),
  index: PropTypes.number,
  isYearly: PropTypes.bool,
  isEnterprise: PropTypes.bool,
};
