import {
  Box,
  Grid,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import { memo, useCallback, useState, useEffect, useRef } from 'react';

// components
import Iconify from '../iconify';
import AgentCard from '../members/AgentCard.jsx';

// Component for rendering agent sections
const AgentSection = memo(({
  title,
  agents,
  isExpanded,
  onToggleExpanded,
  onAgentClick,
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
        left: -300,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollPosition, agents.length]);

  if (agents.length === 0) return null;

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
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
        <Grid container spacing={2}>
          {agents.map((agent) => (
            <Grid
              key={agent.id}
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <AgentCard
                agent={agent}
                onClick={() => onAgentClick(agent.id)}
              />
            </Grid>
          ))}
        </Grid>
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
            {agents.map((agent) => (
              <Box
                key={agent.id}
                sx={{
                  minWidth: 170,
                  maxWidth: 170,
                  flexShrink: 0,
                }}
              >
                <AgentCard
                  agent={agent}
                  onClick={() => onAgentClick(agent.id)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
});

AgentSection.displayName = 'AgentSection';

export default AgentSection;
