import { Box, Grid, Button, Container, Typography, LinearProgress } from '@mui/material';
import { alpha, useTheme, styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
// @mui

// hooks
import { Link as RouterLink } from 'react-router-dom';

import Iconify from '../../components/iconify';
import useResponsive from '../../hooks/useResponsive';
// utils
import { PATH_PAGE } from '../../routes/paths';
import { fPercent } from '../../utils/formatNumber';
// _mock_
// components

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  textAlign: 'center',
  paddingTop: theme.spacing(20),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('md')]: {
    textAlign: 'left',
  },
}));

// ----------------------------------------------------------------------

export default function AboutWhat() {
  const theme = useTheme();

  const isDesktop = useResponsive('up', 'md');

  const isLight = theme.palette.mode === 'light';

  const shadow = `-40px 40px 80px ${alpha(
    isLight ? theme.palette.grey[500] : theme.palette.common.black,
    0.48,
  )}`;

  return (
    <StyledRoot>
      <Container>
        <Grid
          container
          spacing={3}
        >
          {/* {isDesktop && (
            <Grid item xs={12} md={6} lg={7} sx={{ pr: { md: 7 } }}>
              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={6}>
                    <Image
                      alt="our office 1"
                      src="/assets/images/about/what_1.jpg"
                      ratio="3/4"
                      sx={{
                        borderRadius: 2,
                        boxShadow: shadow,
                      }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Image
                      alt="our office 2"
                      src="/assets/images/about/what_2.jpg"
                      ratio="1/1"
                      sx={{ borderRadius: 2 }}
                    />
                </Grid>
              </Grid>
            </Grid>
          )} */}

          <Grid
            item
            xs={12}
            md={12}
            lg={12}
          >
            <Typography
              variant="h2"
              sx={{ mb: 3 }}
            >
              What is Altan?
            </Typography>

            <Typography
              sx={{
                color: theme.palette.mode === 'light' ? 'text.secondary' : 'common.white',
              }}
            >
              At Altan, we believe that Artificial Intelligence (AI) has the potential to transform
              industries and improve people's lives. However, we also recognize the responsibility
              that comes with developing and deploying AI technologies. We are committed to using AI
              in a safe and ethical manner, while fostering innovation and pushing the boundaries of
              what is possible.
            </Typography>

            {/* <Box sx={{ my: 5 }}>
              {_skills.map((progress) => (
                  <ProgressItem progress={progress} />
              ))}
            </Box> */}

            <Button
              component={RouterLink}
              to={PATH_PAGE.values}
              variant="outlined"
              color="inherit"
              size="large"
              endIcon={
                <Iconify
                  icon="ic:round-arrow-right-alt"
                  width={24}
                />
              }
            >
              Check out our values
            </Button>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  );
}

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  progress: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  }),
};

function ProgressItem({ progress }) {
  const { label, value } = progress;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2">{label}&nbsp;-&nbsp;</Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {fPercent(value)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          '& .MuiLinearProgress-bar': { bgcolor: 'grey.700' },
          '&.MuiLinearProgress-determinate': { bgcolor: 'divider' },
        }}
      />
    </Box>
  );
}
