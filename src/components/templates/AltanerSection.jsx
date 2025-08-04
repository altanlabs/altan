import { Box, Grid, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import { memo, useCallback, useState, useEffect, useRef } from 'react';

// components
import Iconify from '../iconify';
import AltanerTemplateCard from './AltanerTemplateCard';

// Component for rendering template sections
const AltanerSection = memo(
  ({
    title,
    templates,
    isExpanded,
    onToggleExpanded,
    onTemplateClick,
    showLoadMore = false,
    onLoadMore,
    loadingMore = false,
  }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollPosition = useCallback(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    }, []);

    const scrollLeft = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: -400, // Increased scroll amount for bigger cards
          behavior: 'smooth',
        });
      }
    }, []);

    const scrollRight = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: 400, // Increased scroll amount for bigger cards
          behavior: 'smooth',
        });
      }
    }, []);

    useEffect(() => {
      checkScrollPosition();
      const handleResize = () => checkScrollPosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [checkScrollPosition, templates.length]);

    if (templates.length === 0) return null;

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Button
            size="small"
            onClick={onToggleExpanded}
            endIcon={<Iconify icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>

        {isExpanded ? (
          // Grid view when expanded
          <Box>
            <Grid
              container
              spacing={2}
            >
              {templates.map((template) => (
                <Grid
                  key={template.id}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <AltanerTemplateCard
                    template={template}
                    onClick={() => onTemplateClick(template.id)}
                  />
                </Grid>
              ))}
            </Grid>
            {/* Load More Button */}
            {showLoadMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  startIcon={
                    loadingMore ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Iconify
                        icon="mdi:arrow-down"
                        width={16}
                      />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          // Horizontal scroll view with navigation arrows when collapsed
          <Box sx={{ position: 'relative' }}>
            {/* Left Arrow */}
            {canScrollLeft && (
              <IconButton
                onClick={scrollLeft}
                sx={{
                  position: 'absolute',
                  left: -16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <Iconify icon="mdi:chevron-left" />
              </IconButton>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <IconButton
                onClick={scrollRight}
                sx={{
                  position: 'absolute',
                  right: -16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <Iconify icon="mdi:chevron-right" />
              </IconButton>
            )}

            {/* Scrollable Container */}
            <Box
              ref={scrollContainerRef}
              onScroll={checkScrollPosition}
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 0,
                pb: 0,
                // Hide scrollbar completely
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
                '&::-webkit-scrollbar': {
                  display: 'none', // Chrome, Safari, Opera
                },
              }}
            >
              {templates.map((template) => (
                <Box
                  key={template.id}
                  sx={{
                    minWidth: 280, // Increased width for bigger cards
                    maxWidth: 280,
                    flexShrink: 0,
                  }}
                >
                  <AltanerTemplateCard
                    template={template}
                    onClick={() => onTemplateClick(template.id)}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
);

AltanerSection.displayName = 'AltanerSection';

export default AltanerSection;
