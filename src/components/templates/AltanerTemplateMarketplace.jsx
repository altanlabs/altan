import { Box, Stack, Typography } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import AltanerSectionCategory from './AltanerSectionCategory';
import TemplateDetailsDialog from './TemplateDetailsDialog';

// Altaner categories with display configuration based on the constants
const ALTANER_CATEGORIES = [
  {
    key: 'sites',
    title: 'Websites',
    description: 'Website templates and landing pages',
    initialExpanded: false,
  },
  {
    key: 'internal_tools',
    title: 'Internal Tools',
    description: 'Business automation and internal applications',
    initialExpanded: false,
  },
  {
    key: 'saas',
    title: 'SaaS',
    description: 'Software as a Service applications',
    initialExpanded: false,
  },
  {
    key: 'ai_apps',
    title: 'AI Apps',
    description: 'AI-powered applications and tools',
    initialExpanded: false,
  },
  // {
  //   key: 'games',
  //   title: 'Games',
  //   description: 'Interactive games and entertainment apps',
  //   initialExpanded: false,
  // },
  // {
  //   key: 'clones',
  //   title: 'Clones',
  //   description: 'Clones of popular apps',
  //   initialExpanded: false,
  // },
];

const AltanerTemplateMarketplace = () => {
  const history = useHistory();
  const location = useLocation();

  // State for managing template dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Parse search params
  const searchParams = new URLSearchParams(location.search);

  // Handle template parameter from URL
  useEffect(() => {
    const templateIdFromUrl = searchParams.get('template');
    if (templateIdFromUrl && templateIdFromUrl !== selectedTemplateId) {
      setSelectedTemplateId(templateIdFromUrl);
      setDialogOpen(true);
    }
  }, [location.search, selectedTemplateId]);

  // Handle template click - append query parameter
  const handleTemplateClick = useCallback(
    (templateId) => {
      // Update URL with template parameter
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('template', templateId);

      // Navigate to URL with template parameter
      history.push({
        pathname: location.pathname,
        search: newSearchParams.toString(),
      });

      // The useEffect will handle opening the dialog
    },
    [history, location.pathname, location.search],
  );

  // Handle dialog close - remove query parameter
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTemplateId(null);

    // Remove template parameter from URL
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('template');

    const newSearch = newSearchParams.toString();
    history.replace({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : '',
    });
  }, [history, location.pathname, location.search]);

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
                onTemplateClick={handleTemplateClick}
              />
            </Box>
          ))}

          {/* Uncategorized section - for templates without a specific category */}

          {/* <Box>
            <AltanerSectionCategory
              category="uncategorized"
              title="From the community"
              initialExpanded={false}
              onTemplateClick={handleTemplateClick}
            />
          </Box> */}
        </Stack>
      </Box>

      {/* Template Details Dialog */}
      <TemplateDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        templateData={selectedTemplateId ? { id: selectedTemplateId } : null}
      />
    </Box>
  );
};

export default AltanerTemplateMarketplace;
