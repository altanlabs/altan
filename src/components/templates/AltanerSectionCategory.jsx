import { Box, Skeleton } from '@mui/material';
import { memo, useMemo, useState, useCallback, useEffect } from 'react';

import AltanerSection from './AltanerSection';
import TemplateDetailsDialog from './TemplateDetailsDialog';
import { optimai_shop } from '../../utils/axios';

// Transform marketplace template for display
const transformTemplateForDisplay = (template) => ({
  id: template.id,
  name: template.name || template.public_name || 'Unnamed Template',
  description: template.description || template.meta_data?.description || '',
  cover_url: getCoverUrl(template),
  icon_url: template.account?.logo_url || template.parent?.icon_url || '/assets/placeholder.svg',
  template_id: template.id,
  template_type: 'altaner',
  price: template.price,
  remix_count: template.remix_count,
  meta_data: template.meta_data,
  selected_version: template.selected_version,
  parent: template.parent,
  account: template.account,
});

function getCoverUrl(template) {
  const selectedVersion = template.selected_version;
  if (selectedVersion?.deployment?.cover_url) {
    return selectedVersion.deployment.cover_url;
  }
  return template.parent?.cover_url || '/assets/placeholder.svg';
}

const AltanerSectionCategory = memo(({ category, title, initialExpanded = false, onTemplateClick }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  }, []);

  const handleTemplateClick = useCallback(
    (templateId) => {
      // If external onTemplateClick handler is provided, use it instead
      if (onTemplateClick) {
        onTemplateClick(templateId);
        return;
      }

      // Fallback to local dialog handling for backward compatibility
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        const transformedTemplate = transformTemplateForDisplay(template);
        setSelectedTemplate(transformedTemplate);
        setDialogOpen(true);
      }
    },
    [templates, onTemplateClick],
  );

  // Fetch templates for this specific category
  const fetchCategoryTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        template_type: 'altaner',
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

      // Filter templates that have cover_url for better display
      const templatesWithCovers = filteredTemplates.filter((template) => {
        return getCoverUrl(template) !== '/assets/placeholder.svg';
      });

      setTemplates(templatesWithCovers);
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

  // Transform templates for display
  const categoryTemplates = useMemo(() => {
    return templates.map(transformTemplateForDisplay);
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
          {[...Array(3)].map((_, i) => ( // Reduced from 4 to 3 cards since they're bigger
            <Box
              key={i}
              sx={{ minWidth: 280, flexShrink: 0 }} // Updated to match new card size
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150} // Increased height for bigger cards
                  sx={{ mb: 2, borderRadius: 1 }}
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

  // Don't render if no templates in this category
  if (!loading && categoryTemplates.length === 0) {
    return null;
  }

  // Use the provided title or capitalize the category name
  const sectionTitle = title || category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <AltanerSection
        title={sectionTitle}
        templates={categoryTemplates}
        isExpanded={isExpanded}
        onToggleExpanded={handleToggleExpanded}
        onTemplateClick={handleTemplateClick}
      />

      <TemplateDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        templateData={selectedTemplate}
      />
    </>
  );
});

AltanerSectionCategory.displayName = 'AltanerSectionCategory';

export default AltanerSectionCategory;