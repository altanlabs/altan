import { Box, Button, Stack, Typography } from '@mui/material';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import { MotionContainer, varBounce, varFade } from '../../components/animate';
import Iconify from '../../components/iconify';
import LoadingScreen from '../../components/loading-screen';
import { bgBlur } from '../../utils/cssStyles';

function logErrorToAPI(errorDetails) {
  fetch('https://api.altan.ai/galaxia/hook/9kse3T', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorDetails),
  }).catch(console.error);
}

const DYN_FETCH_MODULE_ERROR = 'TypeError: Failed to fetch dynamically imported module';

const RootBoundary = ({ error = null }) => {
  const { user } = useAuthContext();
  const accountId = useSelector((state) => state.general.account.id);

  useEffect(() => {
    if (error) {
      const errorDetails = {
        account_id: accountId,
        user_id: user?.id || 'anonymous',
        user_email: user?.email || 'anonymous',
        message: error.message || 'Unknown error',
        stack: error.stack || '',
        status: error.status || 'N/A',
        component: 'RootBoundary',
        url: window.location.href,
      };
      logErrorToAPI(errorDetails);
    }
  }, [error, accountId, user]);

  if (!!error && !!error.stack && error.stack.includes(DYN_FETCH_MODULE_ERROR)) {
    return <LoadingScreen reload={1.5} />;
  }

  return (
    <MotionContainer>
      <Box
        sx={{
          position: 'fixed',
          display: 'flex',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          opacity: 0.9,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <Stack
          spacing={4}
          padding={4}
          sx={{
            textAlign: 'center',
            borderRadius: 5,
            boxShadow: '0px 0px 17px 3px rgba(0,0,0,0.37)',
            ...bgBlur({ opacity: 0.8 }),
          }}
        >
          <Stack spacing={1}>
            <m.div
              variants={varBounce().in}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Typography variant="h3">Error Detected</Typography>
            </m.div>
            <m.div
              variants={varFade().in}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Typography variant="h6">We Apologize for the Inconvenience 😅</Typography>
            </m.div>
            {error && (
              <Typography
                variant="caption"
                sx={{ maxHeight: '50vh', overflowY: 'auto' }}
              >
                {error.stack}
              </Typography>
            )}
          </Stack>

          <m.div variants={varBounce().in}>
            <Stack
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
            >
              <Button
                onClick={() => window.location.reload()}
                size="large"
                color="inherit"
                variant="outlined"
                fullWidth
                startIcon={<Iconify icon="mdi:refresh" />}
              >
                Reload
              </Button>
              <Button
                component={RouterLink}
                to="https://app.altan.ai/form/1c3c9a9b-27a6-4180-968d-d351da211b3c"
                size="large"
                color="inherit"
                variant="outlined"
                fullWidth
                startIcon={<Iconify icon="oui:anomaly-detection" />}
              >
                Report the Bug
              </Button>
              <Button
                fullWidth
                component={RouterLink}
                to="https://dashboard.altan.ai/"
                size="large"
                variant="soft"
                color="inherit"
                startIcon={<Iconify icon="mdi:home" />}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </m.div>
        </Stack>
      </Box>
    </MotionContainer>
  );
};

RootBoundary.propTypes = {
  error: PropTypes.object,
};

export default memo(RootBoundary);
