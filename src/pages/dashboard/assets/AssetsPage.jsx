import { Grid, Card, CardHeader } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import React, { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { CompactLayout } from '../../../layouts/dashboard';
import { PATH_DASHBOARD } from '../../../routes/paths';

// import { AppWelcome } from '../../../sections/@dashboard/general/app';
// import { SeoIllustration } from '../../../assets/illustrations';

const ASSETS = [
  // {
  //   id: "flows",
  //   name: "Flow Orchestrator",
  //   description: "Create and activate workflows that can become jobs, part of megajobs and tools.",
  //   link: PATH_DASHBOARD.assets.flows,
  //   // background_image: "tools.png"
  // },
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    description: 'Central hub for storing FAQs, articles, and textual resources.',
    link: PATH_DASHBOARD.assets.knowledge,
    // background_image: "knowledge.png"
  },
  // {
  //   id: "databases",
  //   name: "Data Lake",
  //   description: "Robust storage for structured data and information management.",
  //   link: PATH_DASHBOARD.assets.knowledge,
  //   // background_image: "data.png"
  // },
  {
    id: 'media',
    name: 'Media Library',
    description: 'Organize and access images, videos, and audio files with ease.',
    link: PATH_DASHBOARD.assets.media,
    // background_image: "media2.png"
  },
  // {
  //   id: "tools",
  //   name: "Tool Factory",
  //   description: "Create and customize tools using proprietary or third-party solutions.",
  //   link: PATH_DASHBOARD.assets.tools,
  //   // background_image: "tools.png"
  // },
  // {
  //   id: "connections",
  //   name: "Connection Hub",
  //   description: "Seamlessly integrate with various external applications.",
  //   link: PATH_DASHBOARD.assets.connections,
  //   // background_image: "connections.png"
  // },
  {
    id: 'products',
    name: 'Products',
    description: 'Efficiently manage and update your product catalog data.',
    link: PATH_DASHBOARD.assets.products,
    // background_image: "catalogs.png"
  },
  {
    id: 'clients',
    name: 'Clients',
    description: 'Efficiently manage and update your clients in your CRM.',
    link: PATH_DASHBOARD.assets.customers,
    // background_image: "catalogs.png"
  },
  // {
  //   id: "prompts",
  //   name: "Prompt Engineering",
  //   description: "Define interactive prompts for AI agents, enhancing user-system interaction.",
  //   link: PATH_DASHBOARD.assets.catalogs,
  //   // background_image: "commands.webp"
  // },
];

const createGradient = (mode) =>
  mode === 'light'
    ? 'rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4)';
const getFormattedTitle = (title) => {
  const words = title.split(' ');
  const firstWord = words.shift();
  const remainingWords = words.join(' ');

  return (
    <>
      <span style={{ fontWeight: 'bold' }}>{firstWord}</span>
      {remainingWords && <span style={{ opacity: 0.6 }}> {remainingWords}</span>}
    </>
  );
};

const StyledCard = styled(Card)(({ theme, bgimage }) => ({
  backgroundImage: `linear-gradient(${createGradient(theme.palette.mode)}), url(/assets/platform/${bgimage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  minHeight: '200px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
    transform: 'scale(1.01)',
    '& .subheader': {
      opacity: 1,
    },
  },
  color: theme.palette.text.primary,
}));

const AssetCard = ({ theme, asset }) => (
  <Grid
    item
    xs={12}
    sm={6}
    md={4}
  >
    <RouterLink
      to={asset.link}
      style={{ textDecoration: 'none' }}
    >
      <StyledCard
        bgimage={asset.background_image}
        theme={theme}
      >
        <CardHeader
          title={getFormattedTitle(asset.name)}
          titleTypographyProps={{
            variant: 'h3',
          }}
          subheader={asset.description}
          subheaderTypographyProps={{
            className: 'subheader',
            sx: {
              color: 'primary',
              opacity: 0.6,
              transition: 'opacity 0.3s ease',
            },
          }}
        />
      </StyledCard>
    </RouterLink>
  </Grid>
);

const AssetsPage = () => {
  const theme = useTheme();
  // const { user } = useAuthContext();

  return (
    <CompactLayout title={'Assets · Altan'}>
      <Grid
        container
        spacing={2}
        sx={{ pb: 2 }}
      >
        {/* <Grid item xs={12} md={12}>
          <AppWelcome
            title={`Welcome to assets, \n ${user?.first_name}`}
            description="Your centralized library for Knowledge, Media, Tools and Widgets."
          />
        </Grid>  */}
        {ASSETS.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            theme={theme}
          />
        ))}
      </Grid>
    </CompactLayout>
  );
};

export default memo(AssetsPage);
