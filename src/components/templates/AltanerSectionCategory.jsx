import { Box, Skeleton } from '@mui/material';
import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AltanerSection from './AltanerSection';
import TemplateDetailsDialog from './TemplateDetailsDialog';
import { 
  fetchCategoryTemplates, 
  selectCategoryState,
  invalidateCategory 
} from '../../redux/slices/templates';

// Transform marketplace template for display (now handled in Redux)
const transformTemplateForDisplay = (template) => ({
  id: template.id,
  name: template.name || template.public_name || 'Unnamed Template',
  description: template.description || template.meta_data?.description || '',
  cover_url: template.cover_url || '/assets/placeholder.svg', // Already processed in Redux
  icon_url: template.account?.logo_url || template.parent?.icon_url || '/assets/placeholder.svg',
  template_id: template.id,
  template_type: 'altaner',
  price: template.price,
  remix_count: template.remix_count,
  meta_data: template.meta_data,
  selected_version: template.selected_version,
  parent: template.parent,
  account: template.account,
  has_cover: template.has_cover, // Already processed in Redux
});

const AltanerSectionCategory = memo(
  ({ category, title, initialExpanded = false, onTemplateClick }) => {
    const dispatch = useDispatch();
    
    // Get category state from Redux
    const categoryState = useSelector(selectCategoryState(category));
    const { templates, loading, error, initialized, hasMore, isFresh } = categoryState;
    
    // Local UI state
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const [loadingMore, setLoadingMore] = useState(false);
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

    // Fetch templates using Redux
    const fetchTemplates = useCallback(
      async (loadMore = false, forceRefresh = false) => {
        if (loadMore) {
          setLoadingMore(true);
        }

        try {
          await dispatch(fetchCategoryTemplates(category, { loadMore, forceRefresh }));
        } catch (err) {
          console.error('Failed to fetch templates:', err);
        } finally {
          if (loadMore) {
            setLoadingMore(false);
          }
        }
      },
      [dispatch, category],
    );

    // Manual refresh function
    const refreshTemplates = useCallback(() => {
      fetchTemplates(false, true);
    }, [fetchTemplates]);

    const handleLoadMore = useCallback(() => {
      if (!loadingMore && hasMore && category === 'uncategorized') {
        fetchTemplates(true);
      }
    }, [loadingMore, hasMore, category, fetchTemplates]);

    useEffect(() => {
      // Only fetch if not initialized and not currently loading
      if (!initialized && !loading) {
        dispatch(fetchCategoryTemplates(category, { loadMore: false }));
      }
    }, [dispatch, category, initialized, loading]);

    // Transform templates for display and filter out ones without covers
    const categoryTemplates = useMemo(() => 
      templates
        .filter(template => template.has_cover) // Only show templates with actual covers
        .map(transformTemplateForDisplay), 
      [templates]
    );

    // Loading skeleton
    if (loading) {
      return (
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
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
            {[...Array(3)].map(
              (
                _,
                i, // Reduced from 4 to 3 cards since they're bigger
              ) => (
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
              ),
            )}
          </Box>
        </Box>
      );
    }

    // Handle error state
    if (error) {
      return null; // Silently fail for now - could show error message if needed
    }

    // Don't render if no templates in this category (except for uncategorized - always show it)
    if (!loading && categoryTemplates.length === 0 && category !== 'uncategorized') {
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
          showLoadMore={category === 'uncategorized' && hasMore}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
        />

        <TemplateDetailsDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          templateData={selectedTemplate}
        />
      </>
    );
  },
);

AltanerSectionCategory.displayName = 'AltanerSectionCategory';

export default AltanerSectionCategory;
