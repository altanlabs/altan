import { Box, Grid, Link, Stack, Divider, Container, Typography, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// routes
import Iconify from '../../components/iconify';
import Logo from '../../components/logo';
import { PATH_PAGE } from '../../routes/paths';
// _mock

// ----------------------------------------------------------------------

const _socials = [
  {
    name: 'LinkedIn',
    icon: 'eva:linkedin-fill',
    path: 'https://www.linkedin.com/company/altanlabs',
  },
  {
    name: 'X (Twitter)',
    icon: 'eva:twitter-fill',
    path: 'https://x.com/altan_ai',
  },
  {
    name: 'Instagram',
    icon: 'ant-design:instagram-filled',
    path: 'https://www.instagram.com/altanlabs/',
  },
  {
    name: 'Discord',
    icon: 'ic:baseline-discord',
    path: 'https://discord.com/invite/2zPbKuukgx',
  },
  {
    name: 'WhatsApp',
    icon: 'ic:baseline-whatsapp',
    path: 'https://chat.whatsapp.com/CQMTRev8J0PJgS7c4ol5I1?mode=ac_t',
  },
];

const LINKS = [
  {
    headline: 'Altan',
    children: [
      // { key: 'about-us', name: 'About us', href: PATH_PAGE.about },
      { key: 'contact', name: 'Contact us', href: PATH_PAGE.contact },
      { key: 'docs', name: 'Docs', href: 'https://docs.altan.ai' },
      { key: 'status', name: 'Status', href: 'https://uptime.altan.ai/' },
    ],
  },
  {
    headline: 'Legal',
    children: [
      { key: 'terms', name: 'Terms & Conditions', href: PATH_PAGE.terms },
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
  const handleSocialClick = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  const mainFooter = (
    <Box
      component="footer"
    >
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
              Altan was founded in 2023 with the vision to create autonomous companies.
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
              {_socials.map((social) => (
                <IconButton key={social.name} onClick={() => handleSocialClick(social.path)}>
                  <Iconify icon={social.icon} />
                </IconButton>
              ))}
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

                  {list.children.map((link) => {
                    const isExternal = link.href.startsWith('http');

                    return (
                      <Link
                        key={link.key}
                        component={isExternal ? 'a' : RouterLink}
                        to={isExternal ? undefined : link.href}
                        href={isExternal ? link.href : undefined}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        color="inherit"
                        variant="body2"
                      >
                        {link.name}
                      </Link>
                    );
                  })}
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
