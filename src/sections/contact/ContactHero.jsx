import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// components
import { TextAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'url(/assets/background/overlay_1.svg), url(/assets/images/contact/hero.jpg)',
  padding: theme.spacing(10, 0),
  [theme.breakpoints.up('md')]: {
    height: 480,
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

export default function ContactHero() {
  return (
    <StyledRoot>
      <Container>
        <StyledContent>
          <TextAnimate
            text="Get"
            sx={{
              color: 'primary.main',
            }}
          />

          <br />

          <Box
            sx={{
              display: 'inline-flex',
              gap: 2,
              color: 'common.white',
            }}
          >
            <TextAnimate text="in" />
            <TextAnimate text="touch" />
          </Box>

          <Typography
            variant="h4"
            sx={{
              mt: 5,
              color: 'common.white',
              fontWeight: 'fontWeightMedium',
            }}
          >
            We're here to help you succeed
            <br />
            with your AI projects.
          </Typography>
        </StyledContent>
      </Container>
    </StyledRoot>
  );
} 