import { Box, Stack, Skeleton } from '@mui/material';
import { memo, useMemo, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import AgentSection from './AgentSection';

// Transform marketplace template to agent-like object
const transformTemplateToAgent = (template) => ({
  id: template.id,
  name: template.name || template.public_name || 'Unnamed Agent',
  avatar_url: template.parent?.avatar_url || '/assets/default-avatar.png',
  is_pinned: false, // Marketplace agents are not pinned
  // Additional marketplace-specific properties
  template_id: template.id,
  template_type: 'marketplace',
  price: template.price,
  remix_count: template.remix_count,
  meta_data: template.meta_data,
});

// Categories for grouping agents
const AGENT_CATEGORIES = [
  'official',
  'personal',
  'sales',
  'marketing',
  'finance',
  'operations',
  'support',
];

const MarketplaceAgentSection = memo(({ templates = [], loading = false }) => {
  const history = useHistory();

  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    uncategorized: false,
    official: false,
    personal: false,
    sales: false,
    marketing: false,
    finance: false,
    operations: false,
    support: false,
  });

  const handleToggleExpanded = useCallback((category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const handleAgentClick = useCallback(
    (agentId) => {
      // Find the original template
      const template = templates.find((t) => t.id === agentId);
      if (template) {
        history.push(`/template/${template.id}`);
      }
    },
    [templates, history],
  );

  // Group templates by category
  const groupedAgents = useMemo(() => {
    const transformed = templates.map(transformTemplateToAgent);

    const groups = {
      uncategorized: [],
      official: [],
      personal: [],
      sales: [],
      marketing: [],
      finance: [],
      operations: [],
      support: [],
    };

    transformed.forEach((agent) => {
      const category = agent.meta_data?.category?.toLowerCase();
      if (category && AGENT_CATEGORIES.includes(category)) {
        groups[category].push(agent);
      } else {
        groups.uncategorized.push(agent);
      }
    });

    return groups;
  }, [templates]);

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Stack spacing={4}>
          {[
            'Uncategorized',
            'Official',
            'Personal',
            'Sales',
            'Marketing',
            'Finance',
            'Operations',
            'Support',
          ].map((title, index) => (
            <Box key={title}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Skeleton
                  variant="text"
                  width={150}
                  height={32}
                />
                <Skeleton
                  variant="text"
                  width={100}
                  height={24}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                {[...Array(4)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{ minWidth: 150, flexShrink: 0 }}
                  >
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
                    >
                      <Skeleton
                        variant="circular"
                        width={64}
                        height={64}
                        sx={{ mb: 2 }}
                      />
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  const hasAnyAgents = Object.values(groupedAgents).some((agents) => agents.length > 0);

  if (!hasAnyAgents) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={4}>
        {/* Uncategorized section */}
        {groupedAgents.uncategorized.length > 0 && (
          <AgentSection
            title="Agents"
            agents={groupedAgents.uncategorized}
            isExpanded={expandedSections.uncategorized}
            onToggleExpanded={() => handleToggleExpanded('uncategorized')}
            onAgentClick={handleAgentClick}
          />
        )}

        {/* Categorized sections */}
        {AGENT_CATEGORIES.map((category) => {
          const agents = groupedAgents[category];
          if (agents.length === 0) return null;

          const title = category.charAt(0).toUpperCase() + category.slice(1);

          return (
            <AgentSection
              key={category}
              title={title}
              agents={agents}
              isExpanded={expandedSections[category]}
              onToggleExpanded={() => handleToggleExpanded(category)}
              onAgentClick={handleAgentClick}
            />
          );
        })}
      </Stack>
    </Box>
  );
});

MarketplaceAgentSection.displayName = 'MarketplaceAgentSection';

export default MarketplaceAgentSection;
