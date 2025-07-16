import { Box, Skeleton } from '@mui/material';
import { memo, useMemo, useState, useCallback, useEffect } from 'react';

import AgentDetailsDialog from './AgentDetailsDialog';
import AgentSection from './AgentSection';
import { optimai_shop } from '../../utils/axios';

// Transform marketplace template to agent-like object
const transformTemplateToAgent = (template) => ({
  id: template.id,
  name: template?.parent?.name || template.name || template.public_name || 'Unnamed Agent',
  description: template.description || template.meta_data?.description || '',
  avatar_url: template.parent?.avatar_url || '/assets/default-avatar.png',
  is_pinned: false,
  template_id: template.id,
  template_type: 'marketplace',
  price: template.price,
  remix_count: template.remix_count,
  meta_data: template.meta_data,
  // Add some default capabilities for marketplace agents
  elevenlabs_id: template.meta_data?.has_voice || false,
});

const AgentSectionCategory = memo(({ category, title, initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedAgent(null);
  }, []);

  const handleAgentClick = useCallback(
    (agentId) => {
      // Find the original template
      const template = templates.find((t) => t.id === agentId);
      if (template) {
        // Transform template to agent-like object for the dialog
        const agentData = transformTemplateToAgent(template);
        setSelectedAgent(agentData);
        setDialogOpen(true);
      }
    },
    [templates],
  );

  // Fetch templates for this specific category
  const fetchCategoryTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        template_type: 'agent',
      });

      // Add category filter for specific categories
      if (category && category !== 'uncategorized') {
        params.append('category', category);
      }

      const response = await optimai_shop.get(`/v2/templates/list?${params}`);
      const fetchedTemplates = response?.data?.templates || [];

      // For uncategorized, we need to filter out templates that have categories
      let filteredTemplates = fetchedTemplates;
      if (category === 'uncategorized') {
        filteredTemplates = fetchedTemplates.filter((template) => {
          const templateCategory = template.meta_data?.category?.toLowerCase();
          return !templateCategory || templateCategory === '';
        });
      }

      setTemplates(filteredTemplates);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setTemplates([]);
      } else {
        setError('Failed to load templates');
        setTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchCategoryTemplates();
  }, [fetchCategoryTemplates]);

  // Transform templates to agent-like objects
  const categoryAgents = useMemo(() => {
    return templates.map(transformTemplateToAgent);
  }, [templates]);

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
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
    );
  }

  // Handle error state
  if (error) {
    return null; // Silently fail for now - could show error message if needed
  }

  // Don't render if no agents in this category
  if (!loading && categoryAgents.length === 0) {
    return null;
  }

  // Use the provided title or capitalize the category name
  const sectionTitle = title || category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <AgentSection
        title={sectionTitle}
        agents={categoryAgents}
        isExpanded={isExpanded}
        onToggleExpanded={handleToggleExpanded}
        onAgentClick={handleAgentClick}
      />

      <AgentDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        agentData={selectedAgent}
      />
    </>
  );
});

AgentSectionCategory.displayName = 'AgentSectionCategory';

export default AgentSectionCategory;
