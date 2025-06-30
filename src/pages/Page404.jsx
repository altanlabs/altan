import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// components
import { PageNotFoundIllustration } from '../assets/illustrations';
import { MotionContainer, varBounce } from '../components/animate';
// assets

// ----------------------------------------------------------------------

export default function Page404() {
  const theme = useTheme();
  const contrastColor = theme.palette.mode === 'light' ? '#000000' : '#ffffff';
  return (
    <>
      <Helmet>
        <title> 404 Page Not Found · Altan</title>
      </Helmet>

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
          }}
        >
          <Stack spacing={4}>
            <Stack spacing={1}>
              <PageNotFoundIllustration />
              <m.div variants={varBounce().in}>
                <Typography
                  variant="h3"
                  paragraph
                >
                  Sorry, page not found!
                </Typography>
              </m.div>

              <m.p
                variants={varBounce().in}
                style={{ color: 'text.secondary', width: 300 }}
              >
                Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the
                URL? Be sure to check your spelling.
              </m.p>
            </Stack>

            <m.div variants={varBounce().in}>
              <Stack
                spacing={1.5}
                alignItems="center"
                justifyContent="center"
              >
                <Button
                  fullWidth
                  component={RouterLink}
                  to="/"
                  size="large"
                  variant="soft"
                  color="inherit"
                >
                  Go to Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="https://app.altan.ai/"
                  size="large"
                  color="inherit"
                  variant="outlined"
                  fullWidth
                >
                  Go to my Circle
                </Button>
              </Stack>
            </m.div>
          </Stack>
        </Box>
      </MotionContainer>
    </>
  );
}
