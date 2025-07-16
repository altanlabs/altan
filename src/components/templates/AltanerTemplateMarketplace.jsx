import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

import AltanerSectionCategory from './AltanerSectionCategory';

// Altaner categories with display configuration based on the constants
const ALTANER_CATEGORIES = [
  {
    key: 'sites',
    title: 'Websites',
    description: 'Website templates and landing pages',
    initialExpanded: false,
  },
  {
    key: 'clones',
    title: 'Clones',
    description: 'Clones of popular apps',
    initialExpanded: false,
  },
  {
    key: 'saas',
    title: 'SaaS',
    description: 'Software as a Service applications',
    initialExpanded: false,
  },
  {
    key: 'internal_tools',
    title: 'Internal Tools',
    description: 'Business automation and internal applications',
    initialExpanded: false,
  },
  {
    key: 'games',
    title: 'Games',
    description: 'Interactive games and entertainment apps',
    initialExpanded: false,
  },
  {
    key: 'ai_apps',
    title: 'AI Apps',
    description: 'AI-powered applications and tools',
    initialExpanded: false,
  },
];

const AltanerTemplateMarketplace = () => {
  return (
    <Box sx={{ width: '100%', pt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
          }}
        >
          Marketplace
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
          }}
        >
          Discover and clone templates built by the community. Find specialized templates for SaaS,
          internal tools, websites, and more.
        </Typography>
      </Box>

      {/* Template Categories */}
      <Box>
        <Stack spacing={1}>
          {ALTANER_CATEGORIES.map((category) => (
            <Box key={category.key}>
              {/* Template Section */}
              <AltanerSectionCategory
                category={category.key}
                title={category.title}
                initialExpanded={category.initialExpanded}
              />
            </Box>
          ))}

          {/* Uncategorized section - for templates without a specific category */}
          <Box>
            <AltanerSectionCategory
              category="uncategorized"
              title="From the community"
              initialExpanded={false}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default AltanerTemplateMarketplace;
