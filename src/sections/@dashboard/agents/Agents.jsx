/* eslint-disable import/order */
/* eslint-disable react/display-name */
import {
  Box,
  Stack,
  Grid,
  Tooltip,
  IconButton,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// components
import Agent from '../../../components/agents/Agent';
import { AgentCarousel } from '../../../components/carousel';
import SearchField from '../../../components/custom-input/SearchField.jsx';
import Iconify from '../../../components/iconify';
import AgentCard from '../../../components/members/AgentCard.jsx';
import SearchNotFound from '../../../components/search-not-found';
import useResponsive from '../../../hooks/useResponsive';
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';

// hooks
import TemplateMarketplace from '../../../pages/dashboard/marketplace/templates/TemplateMarketplace.jsx';
import { useSelector } from '../../../redux/store';
import { useAuthContext } from '../../../auth/useAuthContext';

// selectors
const getAgents = (state) => state.general.account?.agents;
const getAgentsInitialized = (state) => state.general.accountAssetsInitialized.agents;

// Skeleton component for agent cards
const AgentCardSkeleton = memo(() => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      p: 2,
    }}
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
));

AgentCardSkeleton.displayName = 'AgentCardSkeleton';

function Agents({ filterIds = null, altanerComponentId = null, altanerId = null }) {
  const [searchMembers, setSearchMembers] = useState('');
  const [editAltanerComponentOpen, setEditAltanerComponentOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [sortOption, setSortOption] = useState('last_edited_newest');
  const onSearchMembers = (event) => setSearchMembers(event.target.value);
  const isDesktop = useResponsive('up', 'md');
  const agents = useSelector(getAgents);
  const initialized = useSelector(getAgentsInitialized);
  const history = useHistory();;
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  // Handle URL changes (including back/forward navigation and programmatic changes)
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const agentIndex = pathSegments.indexOf('a');
    if (agentIndex !== -1 && pathSegments[agentIndex + 1]) {
      setSelectedAgentId(pathSegments[agentIndex + 1]);
    } else {
      setSelectedAgentId(null);
    }
  }, [location.pathname]);

  const handleGoBack = useCallback(() => {
    setSelectedAgentId(null);
    if (altanerComponentId) {
      const currentPath = location.pathname;
      const baseUrl = currentPath.split('/a/')[0];
      history.push(baseUrl);
    } else {
      history.push('/agents');
    }
  }, [history.push, altanerComponentId, location.pathname]);

  const onCloseEditAltanerComponent = useCallback(() => setEditAltanerComponentOpen(false), []);
  const onEditAltanerComponent = useCallback(() => setEditAltanerComponentOpen(true), []);

  const filtered = useMemo(() => {
    if (!!altanerComponentId && !filterIds?.length) {
      return [];
    }
    return (agents ?? []).filter(
      (agent) => !filterIds || !filterIds.length || filterIds.includes(agent.id),
    );
  }, [agents, altanerComponentId, filterIds]);

  const { originalAgents, clonedAgents } = useMemo(() => {
    // First filter agents based on search term
    const filteredBySearch = filtered.reduce(
      (acc, agent) => {
        if (agent.name.toLowerCase().includes(searchMembers.toLowerCase())) {
          acc[!agent.cloned_template_id ? 'originalAgents' : 'clonedAgents'].push(agent);
        }
        return acc;
      },
      {
        originalAgents: [],
        clonedAgents: [],
      },
    );

    // Apply sorting to both arrays
    const sortAgents = (agents) => {
      return [...agents].sort((a, b) => {
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
    };

    return {
      originalAgents: sortAgents(filteredBySearch.originalAgents),
      clonedAgents: sortAgents(filteredBySearch.clonedAgents),
    };
  }, [filtered, searchMembers, sortOption]);

  const handleAgentClick = useCallback(
    (agentId) => {
      setSelectedAgentId(agentId);
      if (altanerComponentId) {
        // Update URL without triggering navigation
        history.push(`/altaners/${altanerId}/c/${altanerComponentId}/a/${agentId}`);
      } else {
        history.push(`/agent/${agentId}`);
      }
    },
    [history.push, altanerComponentId, altanerId],
  );

  // If we have a selected agent in altaners view, render the Agent component
  if (selectedAgentId && altanerComponentId) {
    return (
      <Box sx={{ height: '100%' }}>
        <Agent
          agentId={selectedAgentId}
          altanerComponentId={altanerComponentId}
          onGoBack={handleGoBack}
        />
      </Box>
    );
  }


  // Sample carousel cards data for agents
  const agentCarouselCards = [
    {
      backgroundPath: '/videos/agents/agents1.mp4',
      title: 'Best LLMs Available',
      description: 'Access the most advanced language models including GPT-4, Claude, Gemini, and more. Choose the perfect LLM for your specific use case and requirements.',
      buttonText: 'Explore Models',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/agents/agents1.mp4',
      title: 'Natural AI Voices',
      description: 'The most human-like AI voices on the market. Our advanced voice synthesis creates incredibly natural speech that your users will love.',
      buttonText: 'Hear Voices',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/agents/agents1.mp4',
      title: 'Custom Tools Integration',
      description: 'Add powerful tools to your agents so they can perform tasks across your entire tech stack. Connect APIs, databases, and services seamlessly.',
      buttonText: 'Add Tools',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/agents/agents1.mp4',
      title: 'Realtime Speech-to-Speech',
      description: 'Experience lightning-fast speech-to-speech conversations with minimal latency. Perfect for phone calls, voice assistants, and live interactions.',
      buttonText: 'Try Voice Chat',
      navigateTo: '/auth/register',
    },
    {
      backgroundPath: '/videos/agents/agents1.mp4',
      title: 'Website Widget',
      description: 'Deploy your AI agents instantly with our easy-to-integrate website widget. Add intelligent chat to any website in just a few lines of code.',
      buttonText: 'Get Widget',
      navigateTo: '/auth/register',
    },
  ];

  // If user is not authenticated, show carousel and marketplace
  if (!isAuthenticated) {
    return (
      <Box>
        <AgentCarousel cards={agentCarouselCards} />
        <TemplateMarketplace
          type="agent"
          hideFilters
        />
      </Box>
    );
  }

  // Show skeleton loading state when not initialized
  if (!initialized) {
    return (
      <Box sx={{ width: '100%', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            mt: 1,
            px: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            alignContent="center"
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 600 }}
            >
              Agents
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Skeleton
              variant="rounded"
              width={200}
              height={40}
            />
            {isDesktop && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                />
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={40}
                />
              </>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 4,
            overflow: 'auto',
          }}
        >
          <Grid
            container
            spacing={3}
          >
            {[...Array(8)].map((_, index) => (
              <Grid
                key={`skeleton-${index}`}
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
              >
                <AgentCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          mt: 1,
          px: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          alignContent="center"
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}
          >
            Agents
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <SearchField
            size="small"
            value={searchMembers}
            onChange={onSearchMembers}
            placeholder="Search agents..."
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
                <InputLabel id="sort-agents-options-label">Sort by</InputLabel>
                <Select
                  labelId="sort-agents-options-label"
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

          <Stack
            direction="row"
            spacing={1}
          >
            {!!altanerComponentId && (
              <Tooltip title="Edit component">
                <IconButton onClick={onEditAltanerComponent}>
                  <Iconify icon="mdi:cog" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 4,
          overflow: 'auto',
        }}
      >
        {!filtered.length ? (
          <SearchNotFound query={searchMembers} />
        ) : (
          <Stack spacing={3}>
            {originalAgents.length > 0 && (
              <Box>
                <Grid
                  container
                  spacing={3}
                >
                  {originalAgents.map((agent) => (
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
                        onClick={() => handleAgentClick(agent.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {clonedAgents.length > 0 && (
              <Box>
                <Box sx={{ mb: 2, typography: 'h6' }}>Cloned Agents</Box>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 3,
                    pb: 1, // Add padding bottom for scrollbar
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: 4,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      },
                    },
                  }}
                >
                  {clonedAgents.map((agent) => (
                    <Box
                      key={agent.id}
                      sx={{
                        minWidth: 280, // Set a minimum width for each card
                        maxWidth: 280, // Prevent cards from growing too large
                        flexShrink: 0, // Prevent cards from shrinking
                      }}
                    >
                      <AgentCard
                        agent={agent}
                        onClick={() => handleAgentClick(agent.id)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      <TemplateMarketplace
        type="agent"
        hideFilters
      />

      {!!altanerComponentId && (
        <AltanerComponentDialog
          open={editAltanerComponentOpen}
          onClose={onCloseEditAltanerComponent}
          altanerId={altanerId}
          altanerComponentId={altanerComponentId}
        />
      )}
    </Box>
  );
}

export default memo(Agents);
