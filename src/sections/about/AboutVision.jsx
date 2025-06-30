// @mui
import { Container, Typography } from '@mui/material';

// components

// ----------------------------------------------------------------------

export default function AboutVision() {
  return (
    <Container sx={{ mt: 2, mb: 10 }}>
      {/* <Box
        sx={{
          mb: 10,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image src="/assets/background/overlay_4.jpg" alt="about-vision" style={{height:'200px'}}/>

        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
          sx={{
            bottom: { xs: 24, md: 40 },
            width: 1,
            opacity: 0.48,
            position: 'absolute',
            mb:1
          }}
        >
          <Typography variant="h6" sx={{ color: 'common.white',mr:1 }}>
            Trusted by
          </Typography>
          {['ibm', 'lya', 'spotify', 'netflix', 'hbo', 'amazon'].map((logo) => (
              <Image
                alt={logo}
                src={`/assets/icons/brands/ic_brand_${logo}.svg`}
                sx={{
                  m: { xs: 1.5, md: 2.5, mt:.1, mb:.1 },
                  height: { xs: 30, md: 40 },
                }}
              />
          ))}
        </Stack>
      </Box> */}

      <Typography
        variant="h3"
        sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
      >
        Altan was founded in 2022 with the vision to leverage AI innovation for the greater good of
        humanity.
      </Typography>
    </Container>
  );
}
