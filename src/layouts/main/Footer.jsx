import { Box, Grid, Link, Stack, Divider, Container, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// @mui
// routes
import Logo from '../../components/logo';
import { PATH_PAGE } from '../../routes/paths';
// _mock

// ----------------------------------------------------------------------

const LINKS = [
  {
    headline: 'Altan',
    children: [
      { key: 'about-us', name: 'About us', href: PATH_PAGE.about },
      { key: 'contact-us', name: 'Contact us', href: PATH_PAGE.contact },
      { key: 'faqs', name: 'FAQs', href: PATH_PAGE.faqs },
      { key: 'status', name: 'Status', href: 'https://status.altan.ai/' },
    ],
  },
  {
    headline: 'Legal',
    children: [
      { key: 'terms_conditions', name: 'Terms & Conditions', href: PATH_PAGE.terms },
      { key: 'privacy', name: 'Privacy Policy', href: PATH_PAGE.privacy },
    ],
  },
  {
    headline: 'Contact',
    children: [
      { key: 'email', name: 'contact@altan-ai', href: '' },
      {
        key: 'us-title',
        name: <Typography variant="subtitle2">United States</Typography>,
        href: '',
      },
      { key: 'us-address', name: '2055 Limestone Rd, Wilmington, Delaware 19808', href: '' },
      { key: 'eu-title', name: <Typography variant="subtitle2">Europe</Typography>, href: '' },
      { key: 'eu-address', name: 'Barcelona, 08039 Pg. de Joan de Borbó, 99', href: '' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function Footer() {
  const { pathname } = useLocation();

  const isHome = pathname === '/';

  const simpleFooter = (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'rgba(0, 0, 0, 0.45)',
      }}
    >
      <Container>
        <Logo sx={{ mb: 1, mx: 'auto' }} />

        <Typography
          variant="caption"
          component="div"
        >
          © All rights reserved
          <br /> made by &nbsp;
          <Link href="https://www.altan.ai/">Altan </Link>
        </Typography>
      </Container>
    </Box>
  );

  const handleSocialClick = (path) => {
    window.open(path, '_blank');
  };

  const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Divider />

      <Container sx={{ pt: 10 }}>
        <Grid
          container
          justifyContent={{
            xs: 'center',
            md: 'space-between',
          }}
          sx={{
            textAlign: {
              xs: 'center',
              md: 'left',
            },
          }}
        >
          <Grid
            item
            xs={12}
            sx={{ mb: 3 }}
          >
            <Logo sx={{ mx: { xs: 'auto', md: 'inherit' } }} />
          </Grid>

          <Grid
            item
            xs={8}
            md={3}
          >
            <Typography
              variant="body2"
              sx={{ pr: { md: 5 } }}
            >
              Altan was founded in 2022 with the vision to leverage AI innovation for the greater
              good of humanity.
            </Typography>

            <Stack
              spacing={1}
              direction="row"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{
                mt: 5,
                mb: { xs: 5, md: 0 },
              }}
            >
              {/* {_socials.map((social) => (
                <IconButton key={social.name} onClick={() => handleSocialClick(social.path)}>
                  <Iconify icon={social.icon} />
                </IconButton>
              ))} */}
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            md={7}
          >
            <Stack
              spacing={5}
              justifyContent="space-between"
              direction={{ xs: 'column', md: 'row' }}
            >
              {LINKS.map((list) => (
                <Stack
                  key={list.headline}
                  spacing={2}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography
                    component="div"
                    variant="h6"
                  >
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.key}
                      component={RouterLink}
                      to={link.href}
                      color="inherit"
                      variant="body2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          component="div"
          sx={{
            mt: 10,
            pb: 5,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          © 2024. All rights reserved
        </Typography>
      </Container>
    </Box>
  );

  return mainFooter;
}
