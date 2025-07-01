import { Skeleton, Stack, Typography, Button } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import PanelRow from './PanelRow.jsx';
import Iconify from '../../../../components/iconify';
import useDebouncedSearch from '../../../../hooks/useDebouncedSearch';
import useFilteredConnectionEntities from '../../../../hooks/useFilteredConnectionEntities.ts';
import { setNewModuleType } from '../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../redux/store';
import { optimai_root } from '../../../../utils/axios';

const selectTypesInitialized = (state) => state.connections.initialized.types;

const fetchSemanticActionTypes = async (searchTerm) => {
  const response = await optimai_root.post('/knowledge/embeddings/search', {
    table_name: 'ActionType',
    query: searchTerm,
    top_k: 3,
  });
  return response.data.results.map((result) => ({
    ...result.element,
    score: result.score,
    isSemanticResult: true,
  }));
};

const ExternalConnectionTypes = ({
  mode = null,
  searchTerm = '',
  selected = null,
  onSelect = null,
  filterOutEmpty = false,
  delegateSelect = false,
  featured = [],
  suggestedEnabled = true,
}) => {
  const [semanticResults, isLoadingSemanticResults] = useDebouncedSearch({
    searchTerm,
    enabled: suggestedEnabled,
    queryMethod: fetchSemanticActionTypes,
    async: true,
  });
  const initialized = useSelector(selectTypesInitialized);
  const unsortedData = useFilteredConnectionEntities({
    mode,
    searchTerm,
    selected,
    filterOutEmpty,
    featured,
  });

  // Sort data alphabetically by name, respecting featured status
  const data = useMemo(() => {
    if (!unsortedData) return [];
    // Deduplicate by ID first
    const uniqueData = Array.from(new Map(unsortedData.map((item) => [item.id, item])).values());
    const stripBrackets = (name) => name.replace(/\[.*?\]\s*/g, '').trim();
    const sortedData = [...uniqueData].sort((a, b) => {
      const nameA = stripBrackets(a.name || '')
        .toLowerCase()
        .trim();
      const nameB = stripBrackets(b.name || '')
        .toLowerCase()
        .trim();
      // Check if either name starts with "altan"
      const aStartsWithAltan = nameA.startsWith('altan');
      const bStartsWithAltan = nameB.startsWith('altan');
      // If one starts with "altan" and the other doesn't, prioritize the "altan" one
      if (aStartsWithAltan && !bStartsWithAltan) return -1;
      if (!aStartsWithAltan && bStartsWithAltan) return 1;
      // If both start with "altan" or neither does, use normal alphabetical order
      return nameA.localeCompare(nameB);
    });
    return sortedData;
  }, [unsortedData]);

  // const selectedType = useMemo(() => !!selected ? types.find(c => c.id === selected.id) : null, [selected, types]);

  const selectActionOrSearch = useCallback(
    (item) => {
      dispatch(
        setNewModuleType({
          type: mode === 'custom_apps' ? 'action' : (mode ?? 'action'),
          action: {
            ...item,
            connection_type_id: selected?.id ?? item.connection_type_id,
            connection_type: {
              id: selected?.id ?? item.connection_type_id,
              icon: selected?.icon ?? item.connection_type?.icon,
            },
          },
        }),
      );
    },
    [mode, selected],
  );

  if (!initialized) {
    return (
      <Stack
        width="100%"
        height="100%"
        spacing={0.5}
      >
        {[...Array(20)].map((_, i) => (
          <Skeleton
            key={`conntype-skeleton-${i}`}
            width="100%"
            height={50}
            variant="rounded"
          />
        ))}
      </Stack>
    );
  }

  if (mode === 'custom_apps' && !data?.length) {
    return (
      <Stack
        width="100%"
        height="100%"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        px={3}
      >
        <Typography
          variant="h3"
          textAlign="center"
        >
          No Custom Apps Found
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
        >
          Create your own integration to automate your workflow with custom applications
        </Typography>
        <Button
          variant="contained"
          href="https://www.altan.ai/integration?tab=custom_apps"
          target="_blank"
          startIcon={<Iconify icon="material-symbols:add" />}
        >
          Create Custom App
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      maxWidth="100%"
      height="100%"
    >
      {/* Show semantic results or skeletons if searching */}
      <Virtuoso
        key="virtuoso-external-connection-types"
        style={{
          maxWidth: '100%',
          scrollBehavior: 'smooth',
          height: '100%',
          overflowX: 'hidden',
        }}
        data={data}
        components={{
          Footer: () => {
            return (
              <div
                style={{
                  height: '10px',
                }}
              />
            );
          },
          Header: () => {
            return (
              <div
              // style={{
              //   height: '10px'
              // }}
              >
                {!!suggestedEnabled &&
                  !selected &&
                  searchTerm &&
                  (isLoadingSemanticResults || semanticResults.length > 0) && (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      paddingX={2}
                      paddingY={1}
                    >
                      <Iconify icon="mdi:magic" />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold' }}
                      >
                        Suggested Actions
                      </Typography>
                    </Stack>
                    <Stack>
                      {isLoadingSemanticResults
                        ? // Show 3 skeletons while loading
                          [...Array(3)].map((_, index) => (
                              <Stack
                                key={`skeleton-${index}`}
                                direction="row"
                                spacing={2.5}
                                sx={{
                                  px: 2,
                                  py: 1,
                                  ...(index && { mt: 1 }),
                                  height: 60,
                                }}
                              >
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                                <Stack sx={{ flex: 1 }}>
                                  <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={24}
                                  />
                                  <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={16}
                                  />
                                </Stack>
                              </Stack>
                            ))
                        : // Show actual results when loaded
                          semanticResults.slice(0, 3).map((result, index) => (
                              <PanelRow
                                key={`semantic-${result.id}`}
                                icon={result.connection_type?.icon}
                                name={result.name}
                                description={result.description}
                                isSemanticResult
                                onClick={() =>
                                  mode === 'trigger' || delegateSelect
                                    ? onSelect(result, true)
                                    : selectActionOrSearch(result)}
                                sx={{
                                  ...(index && { mt: 1 }),
                                  backgroundColor: 'rgba(0,0,0,0.02)',
                                }}
                              />
                            ))}
                    </Stack>
                  </>
                )}

                {/* Show divider if we have semantic results or are loading them */}
                {!selected &&
                  searchTerm &&
                  (isLoadingSemanticResults || semanticResults.length > 0) && (
                  <Typography
                    variant="subtitle2"
                    sx={{ px: 2, py: 1, fontWeight: 'bold' }}
                  >
                    All Connections
                  </Typography>
                )}
              </div>
            );
          },
        }}
        overscan={2}
        increaseViewportBy={{
          bottom: 0,
          top: 0,
        }}
        itemContent={(index, item) => {
          const isMyWebhooks = selected?.id === 'my_webhooks';
          const isInitialView = !selected;
          return (
            <PanelRow
              key={item.id}
              icon={
                isInitialView
                  ? item.icon
                  : isMyWebhooks
                    ? 'material-symbols:webhook'
                    : selected.icon
              }
              name={isMyWebhooks && !isInitialView ? item.name : (item.name || '').slice(0, 50)}
              description={
                isMyWebhooks && !isInitialView
                  ? `URL: https://api.altan.ai/galaxia/hook/${item.url}`
                  : item.description
              }
              disabled={
                isInitialView
                  ? mode === 'trigger'
                    ? !item?.webhooks?.items?.length
                    : !item?.actions?.items?.length
                  : false
              }
              options={
                isInitialView
                  ? mode === 'trigger'
                    ? item.webhooks?.items
                    : item.actions?.items
                  : null
              }
              onClick={() =>
                isInitialView
                  ? onSelect(data.find((t) => t.id === item.id))
                  : mode === 'trigger' || delegateSelect
                    ? onSelect(item)
                    : selectActionOrSearch(item)}
              sx={{ ...(index && { mt: 1 }) }}
            />
          );
        }}
      />
    </Stack>
  );
};

export default memo(ExternalConnectionTypes);
