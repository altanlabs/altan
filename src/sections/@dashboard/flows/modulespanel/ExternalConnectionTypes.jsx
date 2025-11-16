import { m } from 'framer-motion';
import { memo, useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/skeleton';

import PanelRow from './PanelRow.jsx';
import Iconify from '../../../../components/iconify';
import useDebouncedSearch from '../../../../hooks/useDebouncedSearch';
import useFilteredConnectionEntities from '../../../../hooks/useFilteredConnectionEntities.ts';
import { setNewModuleType } from '../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../redux/store.ts';
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
      <div className="w-full h-full flex flex-col gap-1">
        {[...Array(20)].map((_, i) => (
          <Skeleton key={`conntype-skeleton-${i}`} className="w-full h-12 rounded-md" />
        ))}
      </div>
    );
  }

  if (mode === 'custom_apps' && !data?.length) {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex flex-col items-center justify-center gap-3 px-3"
      >
        <h3 className="text-base font-semibold text-center">No Connectors Found</h3>
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Create your own integration to automate your workflow with custom applications
        </p>
        <Button
          variant="default"
          size="sm"
          asChild
          className="h-8 gap-1.5"
        >
          <a href="https://www.altan.ai/integration?tab=custom_apps" target="_blank" rel="noopener noreferrer">
            <Iconify icon="material-symbols:add" width={14} />
            Create Custom App
          </a>
        </Button>
      </m.div>
    );
  }

  return (
    <div className="w-full h-full">
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
          Footer: () => <div className="h-2" />,
          Header: () => (
            <div>
              {suggestedEnabled && !selected && searchTerm && (isLoadingSemanticResults || semanticResults.length > 0) && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-2">
                    <Iconify icon="mdi:magic" width={14} className="text-muted-foreground" />
                    <h4 className="text-xs font-semibold">Suggested Actions</h4>
                  </div>
                  <div className="flex flex-col">
                    {isLoadingSemanticResults
                      ? [...Array(3)].map((_, index) => (
                          <div key={`skeleton-${index}`} className="flex items-center gap-2.5 px-2 py-2 h-14">
                            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3 w-3/5" />
                              <Skeleton className="h-2.5 w-4/5" />
                            </div>
                          </div>
                        ))
                      : semanticResults.slice(0, 3).map((result, index) => (
                          <PanelRow
                            key={`semantic-${result.id}`}
                            icon={result.connection_type?.icon}
                            name={result.name}
                            description={result.description}
                            isSemanticResult
                            onClick={() => {
                              if (mode === 'trigger' || delegateSelect) {
                                onSelect(result, true);
                              } else {
                                selectActionOrSearch(result);
                              }
                            }}
                            sx={{ backgroundColor: index === 0 ? undefined : 'rgba(0,0,0,0.02)' }}
                          />
                        ))}
                  </div>
                </>
              )}

              {!selected && searchTerm && (isLoadingSemanticResults || semanticResults.length > 0) && (
                <div className="px-2 py-2">
                  <h4 className="text-xs font-semibold">All Connections</h4>
                </div>
              )}
            </div>
          ),
        }}
        overscan={2}
        increaseViewportBy={{ bottom: 0, top: 0 }}
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
              onClick={() => {
                if (isInitialView) {
                  onSelect(data.find((t) => t.id === item.id));
                } else if (mode === 'trigger' || delegateSelect) {
                  onSelect(item);
                } else {
                  selectActionOrSearch(item);
                }
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default memo(ExternalConnectionTypes);
