import {
  Grid,
  Typography,
  Card,
  Box,
  Skeleton,
  Button,
  MenuItem,
  Select,
  Stack,
  Divider,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { memo, useState } from 'react';

import { useAuthContext } from '../../../auth/useAuthContext';
import AltanerCard from '../../../components/AltanerCard';
import { ProjectCarousel } from '../../../components/carousel';
import SearchField from '../../../components/custom-input/SearchField';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';
import { useSelector } from '../../../redux/store';
import AltanerTemplateMarketplace from '../../../components/templates/AltanerTemplateMarketplace';
import TemplateMarketplace from '../marketplace/templates/TemplateMarketplace';

const AltanerSkeleton = memo(() => (
  <Grid
    item
    lg={3}
    xl={2}
  >
    <Card sx={{ p: 2, height: '100%' }}>
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="80%"
      />
    </Card>
  </Grid>
));

AltanerSkeleton.displayName = 'AltanerSkeleton';

const selectAccountAltaners = (state) => state.general.account?.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;

const AltanersWidget = ({ initialSearchQuery = '' }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortOption, setSortOption] = useState('last_edited_newest');
  const altaners = useSelector(selectAccountAltaners);
  const isDesktop = useResponsive('up', 'md');
  const isLoading = useSelector(selectAltanersLoading);
  const { isAuthenticated } = useAuthContext();

  // Sample carousel cards data for projects
  const projectCarouselCards = [
    {
      backgroundPath: '/videos/projects/project1.mp4',
      title: 'Build Websites & Software',
      description:
        'Create complete websites, web applications, and end-to-end software solutions powered by the most advanced AI agents integrated directly into your projects.',
      buttonText: 'Start Building',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/projects/project1.mp4',
      title: 'Collective AGI',
      description:
        'Experience our revolutionary multi-agent system embedded into all projects. Multiple AI agents work together intelligently to solve complex problems beyond single-agent capabilities.',
      buttonText: 'Discover AGI',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/projects/project1.mp4',
      title: 'Built-in Databases',
      description:
        'Every project comes with powerful built-in database capabilities. Store, query, and manage data seamlessly without external dependencies or complex setup.',
      buttonText: 'Explore Data',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/projects/project1.mp4',
      title: 'AI Code Generation',
      description:
        'Advanced codegen creates production-ready code automatically. Our AI agents write, test, and optimize code across multiple programming languages and frameworks.',
      buttonText: 'Generate Code',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/projects/project1.mp4',
      title: 'End-to-End Solutions',
      description:
        'From concept to deployment - build complete software ecosystems with AI agents, databases, and code generation all working together in perfect harmony.',
      buttonText: 'Build Complete',
      navigateTo: '/auth/register',
    },
  ];

  // If user is not authenticated, show carousel and marketplace
  if (!isAuthenticated) {
    return (
      <Box>
        <ProjectCarousel cards={projectCarouselCards} />
        <AltanerTemplateMarketplace />
      </Box>
    );
  }
  const filteredAltaners = altaners
    ?.filter((altaner) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        altaner.name.toLowerCase().includes(searchLower) ||
        altaner.description?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // First sort by pinned status
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      // Sort based on the selected option
      switch (sortOption) {
        case 'alphabetical_asc':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'alphabetical_desc':
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case 'date_created_newest':
          const createdAtA = new Date(a.created_at || a.last_modified || 0);
          const createdAtB = new Date(b.created_at || b.last_modified || 0);
          return createdAtB.getTime() - createdAtA.getTime();
        case 'date_created_oldest':
          const createdA = new Date(a.created_at || a.last_modified || 0);
          const createdB = new Date(b.created_at || b.last_modified || 0);
          return createdA.getTime() - createdB.getTime();
        case 'last_edited_oldest':
          const modifiedA = new Date(a.last_modified || 0);
          const modifiedB = new Date(b.last_modified || 0);
          return modifiedA.getTime() - modifiedB.getTime();
        case 'last_edited_newest':
        default:
          const dateA = new Date(a.last_modified || 0);
          const dateB = new Date(b.last_modified || 0);
          return dateB.getTime() - dateA.getTime();
      }
    });
  const visibleAltaners =
    showAll || !filteredAltaners?.length ? filteredAltaners : filteredAltaners.slice(0, 6);
  return (
    <>
      <Box sx={{ mb: 4 }}>
        {isLoading ? (
          <Grid
            container
            spacing={2}
          >
            {[...Array(6)].map((_, index) => (
              <AltanerSkeleton key={`skeleton-${index}`} />
            ))}
          </Grid>
        ) : filteredAltaners?.length ? (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                mt: 1,
                px: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, mx: 1 }}
              >
                Projects
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <SearchField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                />

                {isDesktop && (
                  <>
                    <Divider
                      orientation="vertical"
                      flexItem
                    />
                    <FormControl
                      size="small"
                      variant="filled"
                      sx={{ minWidth: 140 }}
                    >
                      <InputLabel id="sort-options-label">Sort by</InputLabel>
                      <Select
                        labelId="sort-options-label"
                        value={sortOption}
                        label="Sort by"
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <MenuItem value="last_edited_newest">Last edited</MenuItem>
                        <MenuItem value="last_edited_oldest">Oldest first</MenuItem>
                        <MenuItem value="date_created_newest">Date created</MenuItem>
                        <MenuItem value="date_created_oldest">Date created (oldest)</MenuItem>
                        <MenuItem value="alphabetical_asc">Alphabetical</MenuItem>
                        <MenuItem value="alphabetical_desc">Alphabetical (Z-A)</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </Stack>
            </Box>
            <Grid
              container
              spacing={2}
            >
              {visibleAltaners.map((altaner) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  key={altaner.id}
                >
                  <AltanerCard
                    id={altaner.id}
                    name={altaner.name}
                    iconUrl={altaner?.icon_url}
                    description={altaner?.description}
                    components={altaner.components?.items || []}
                    last_modified={altaner?.last_modified}
                    isPinned={altaner?.is_pinned}
                  />
                </Grid>
              ))}
            </Grid>
            {filteredAltaners.length > 6 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `View All (${filteredAltaners.length})`}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Iconify
              icon="mdi:robot-outline"
              sx={{ width: 64, height: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
            >
              {searchQuery ? 'No Results Found' : 'No Projects Yet'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first Project to get started'}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <AltanerTemplateMarketplace />
    </>
  );
};

export default memo(AltanersWidget);
