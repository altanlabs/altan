import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

import AgentSectionCategory from './AgentSectionCategory';

// Agent categories with display configuration
const AGENT_CATEGORIES = [
  {
    key: 'official',
    title: 'Base Agents',
    description: 'Curated agents from the Altan team',
    initialExpanded: false,
  },
  {
    key: 'personal',
    title: 'Personal Assistant',
    description: 'Agents for personal productivity and assistance',
    initialExpanded: false,
  },
  {
    key: 'sales',
    title: 'Sales & CRM',
    description: 'Agents to boost your sales process',
    initialExpanded: false,
  },
  {
    key: 'marketing',
    title: 'Marketing & Growth',
    description: 'Agents for marketing automation and growth',
    initialExpanded: false,
  },
  {
    key: 'support',
    title: 'Customer Support',
    description: 'Agents for customer service and support',
    initialExpanded: false,
  },
  {
    key: 'finance',
    title: 'Finance & Operations',
    description: 'Agents for financial and operational tasks',
    initialExpanded: false,
  },
];

const AgentTemplateMarketplace = () => {
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
          Discover and clone AI agents built by the community. Find specialized agents for sales,
          marketing, customer support, and more.
        </Typography>
      </Box>

      {/* Agent Categories */}
      <Box>
        <Stack spacing={1}>
          {AGENT_CATEGORIES.map((category) => (
            <Box key={category.key}>
              {/* Agent Section */}
              <AgentSectionCategory
                category={category.key}
                title={category.title}
                initialExpanded={category.initialExpanded}
              />
            </Box>
          ))}

          {/* Uncategorized section - for agents without a specific category */}
          <Box>
            <AgentSectionCategory
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

export default AgentTemplateMarketplace;
