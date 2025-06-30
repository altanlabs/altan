import { Stack, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// @mui

// components
import { TextAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'url(/assets/background/overlay_1.svg), url(/assets/images/about/hero.jpg)',
  padding: theme.spacing(10, 0),
  [theme.breakpoints.up('md')]: {
    height: 560,
    padding: 0,
  },
}));

const StyledContent = styled('div')(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    bottom: 80,
    textAlign: 'left',
    position: 'absolute',
  },
}));

// ----------------------------------------------------------------------

export default function AboutHero() {
  return (
    <StyledRoot>
      <Container>
        <StyledContent>
          <TextAnimate
            text="Who"
            sx={{
              color: 'primary.main',
            }}
          />

          <br />

          <Stack
            spacing={2}
            display="inline-flex"
            direction="row"
            sx={{ color: 'common.white' }}
          >
            <TextAnimate text="we" />
            <TextAnimate text="are?" />
          </Stack>

          <Typography
            variant="h4"
            sx={{
              mt: 5,
              color: 'common.white',
              fontWeight: 'fontWeightMedium',
            }}
          >
            We're bringing the AI
            <br /> revolution to your company.
          </Typography>
        </StyledContent>
      </Container>
    </StyledRoot>
  );
}
