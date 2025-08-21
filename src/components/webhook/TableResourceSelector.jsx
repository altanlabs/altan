import { InputAdornment, TextField, Tooltip } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import {
  selectBases,
  selectTablesByBaseId,
  getBasesByAccountID,
  fetchBaseById,
} from '../../redux/slices/bases';
import Iconify from '../iconify';

/**
 * Custom Checkbox component matching the original ResourceSelector style
 */
const Checkbox = ({
  checked,
  onChange,
  size = '5',
  editable = false,
  checkedColor = 'text-black dark:text-white',
  hoverBorderColor = 'group-hover:border-primary dark:group-hover:border-primary-dark',
}) => {
  const numericSize = parseInt(size, 10);

  return (
    <Tooltip
      arrow
      title={!editable ? 'Click on edit subscriptions to enable editing' : null}
    >
      <label
        className={cn(
          'relative inline-flex items-center cursor-pointer group',
          !editable && 'cursor-not-allowed opacity-50',
        )}
        role="checkbox"
        aria-checked={checked}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={!editable}
          className="appearance-none w-0 h-0 absolute opacity-0"
        />
        <div
          className={`
            flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 
            w-${size} h-${size} rounded-md transition-colors duration-200 ease-in-out 
            ${hoverBorderColor} ${checked ? 'border-primary dark:border-primary-dark' : ''}
          `}
        >
          {checked && (
            <svg
              className={`w-${numericSize - 1} h-${numericSize - 1} ${checkedColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 01.0 1.414l-8.0 8.0a1 1 0 01-1.414 0l-4.0-4.0a1 1 0 011.414-1.414L8.0 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </label>
    </Tooltip>
  );
};

/**
 * EventList component for table events
 */
const EventList = ({ events, selectedEventIds, onToggleEvent, filterQuery, editable = false }) => {
  const filteredEvents = useMemo(() => {
    if (!filterQuery.trim()) return events;
    const q = filterQuery.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, filterQuery]);

  return (
    <div className="ml-6 mt-2 space-y-1" role="list">
      {filteredEvents
        .filter((event) => !!editable || selectedEventIds.has(event.id))
        .map((event) => (
          <div key={event.id} className="flex items-center space-x-2" role="listitem">
            <Checkbox
              checked={selectedEventIds.has(event.id)}
              onChange={() => onToggleEvent(event.id)}
              size="4"
              hoverBorderColor="group-hover:border-secondary dark:group-hover:border-secondary-dark"
              editable={editable}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-secondary dark:group-hover:text-secondary-dark transition-colors duration-200">
              {event.name}
            </span>
          </div>
        ))}
    </div>
  );
};

/**
 * TableItem component for individual tables within a base
 */
const TableItem = ({
  table,
  events,
  selectedEvents,
  onToggleTable,
  onToggleEvent,
  filterQuery,
  editable = false,
}) => {
  const isTableSelected = !!selectedEvents;
  const selectedCount = selectedEvents ? selectedEvents.size : 0;

  const tableMatchesQuery =
    table.name?.toLowerCase().includes(filterQuery.toLowerCase()) || filterQuery.trim() === '';
  const filteredEvents = useMemo(() => {
    const q = filterQuery.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, filterQuery]);

  // If neither the table nor its events match the query, skip rendering
  if (!tableMatchesQuery && filteredEvents.length === 0) return null;

  // Always show events when table is selected in editable mode, or when there are selected events in non-editable mode
  const showEvents = (editable && isTableSelected) || (!editable && selectedCount > 0) || (filterQuery.trim() !== '' && filteredEvents.length > 0);

  // Production-ready component without debug logs

  if (!editable && !selectedCount) {
    return null;
  }

  return (
    <div className="mb-3 last:mb-0">
      <div 
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={() => {
          if (editable) {
            onToggleTable(table.id);
          }
        }}
      >
        {!!editable && (
          <Checkbox
            checked={isTableSelected}
            onChange={(e) => {
              e.stopPropagation(); // Prevent double-click from row
              onToggleTable(table.id);
            }}
            size="5"
            editable={editable}
          />
        )}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Iconify icon="mdi:table" className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors duration-200 text-sm">
              {table.name || table.id}
            </span>
          </div>
          {!isTableSelected && selectedCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              ({selectedCount} events)
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEvents && (
          <m.div
            key="eventList"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <EventList
              events={events}
              selectedEventIds={selectedEvents || new Set()}
              onToggleEvent={(eventId) => onToggleEvent(table.id, eventId)}
              filterQuery={filterQuery}
              editable={editable}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * BaseCard component for displaying a base and its tables
 */
const BaseCard = ({
  base,
  events,
  expanded,
  onToggleExpand,
  selectedTables,
  onToggleTable,
  onToggleEvent,
  filterQuery,
  editable = false,
}) => {
  const dispatch = useDispatch();
  const tables = useSelector(state => selectTablesByBaseId(state, base.id)) || [];
  const [loadingTables, setLoadingTables] = useState(false);

  // Calculate selection summary
  const { totalTables, selectedTableCount, totalEventCount, selectedEventCount } = useMemo(() => {
    let stCount = 0;
    let seCount = 0;
    const teCount = tables.length * (events?.length || 0);
    
    tables.forEach((table) => {
      const selEv = selectedTables[table.id];
      if (selEv) {
        stCount++;
        seCount += selEv.size;
      }
    });
    
    return {
      totalTables: tables.length,
      selectedTableCount: stCount,
      totalEventCount: teCount,
      selectedEventCount: seCount,
    };
  }, [selectedTables, tables, events]);

  // Filter tables based on query
  const filteredTables = useMemo(() => {
    const q = filterQuery.toLowerCase();
    return tables.filter((table) => {
      const tableMatches = table.name?.toLowerCase().includes(q);
      const eventMatches = events?.some((e) => e.name.toLowerCase().includes(q));
      return q.trim() === '' || tableMatches || eventMatches;
    });
  }, [tables, events, filterQuery]);

  const realExpanded = useMemo(
    () => !!expanded || (!!filterQuery?.length && !!filteredTables?.length),
    [expanded, filterQuery?.length, filteredTables?.length],
  );

  // Handle base expansion and fetch tables if needed
  const handleToggleExpand = useCallback(async () => {
    if (!expanded && tables.length === 0) {
      setLoadingTables(true);
      try {
        await dispatch(fetchBaseById(base.id));
      } catch (error) {
        console.error('Error fetching base:', error);
      } finally {
        setLoadingTables(false);
      }
    }
    onToggleExpand(base.id);
  }, [dispatch, base.id, expanded, tables.length, onToggleExpand]);

  // If no matches and we have a query, don't show the base
  if (
    (filteredTables.length === 0 && filterQuery.trim() !== '') ||
    (!editable && !(selectedTableCount + selectedEventCount))
  ) {
    return null;
  }

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-4 rounded-xl overflow-hidden shadow-lg bg-transparent backdrop-blur-md border border-gray-200 dark:border-gray-700"
    >
      <button
        onClick={handleToggleExpand}
        disabled={loadingTables}
        className="w-full py-3 px-4 flex justify-between items-center bg-gray-50/40 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left focus:outline-none focus-visible:ring focus-visible:ring-primary disabled:opacity-50"
        aria-expanded={realExpanded}
        aria-controls={`base-panel-${base.id}`}
      >
        <div className="flex items-center space-x-3">
          <Iconify icon="mdi:database" className="w-5 h-5 text-primary" />
          <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {base.name || base.id}
          </h2>
          {loadingTables && <Iconify icon="svg-spinners:pulse-rings-2" className="w-4 h-4" />}
        </div>
        <div className="flex items-center space-x-2">
          {!realExpanded && (selectedTableCount > 0 || selectedEventCount > 0) && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {selectedTableCount}/{totalTables} tables, {selectedEventCount}/{totalEventCount} events
            </span>
          )}
          <Iconify icon={realExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
        </div>
      </button>

      <AnimatePresence>
        {realExpanded && (
          <m.div
            id={`base-panel-${base.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
            layout
          >
            {tables.length === 0 && !loadingTables ? (
              <div className="text-center text-gray-500 py-4">
                <Iconify icon="mdi:table-off" className="w-8 h-8 mx-auto mb-2" />
                <p>No tables found in this base</p>
              </div>
            ) : (
              filteredTables
                .sort((a, b) => {
                  const aSelected = Boolean(selectedTables[a.id]);
                  const bSelected = Boolean(selectedTables[b.id]);
                  
                  // Sort selected ones first
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  
                  // Sort alphabetically by table name as secondary criteria
                  const aName = a.name?.toLowerCase() || '';
                  const bName = b.name?.toLowerCase() || '';
                  return aName.localeCompare(bName);
                })
                .map((table) => (
                  <TableItem
                    key={table.id}
                    table={table}
                    events={events || []}
                    selectedEvents={selectedTables[table.id]}
                    onToggleTable={onToggleTable}
                    onToggleEvent={onToggleEvent}
                    filterQuery={filterQuery}
                    editable={editable}
                  />
                ))
            )}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

/**
 * Main TableResourceSelector component
 */
const TableResourceSelector = ({
  events,
  value: selectedResources,
  onChange: setSelectedResources,
  editable = false,
}) => {
  const dispatch = useDispatch();
  const bases = useSelector(selectBases);
  const account = useSelector(state => state.general.account);
  
  const [expandedBases, setExpandedBases] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBases, setLoadingBases] = useState(false);
  const [databaseSectionExpanded, setDatabaseSectionExpanded] = useState(false);

  // Load bases on mount if not already loaded
  useEffect(() => {
    // Simple condition - just check if we have account and no bases
    if (account?.id && Object.keys(bases).length === 0 && !loadingBases) {
      setLoadingBases(true);
      dispatch(getBasesByAccountID(account.id))
        .catch(error => {
          console.error('Error loading bases:', error);
        })
        .finally(() => {
          setLoadingBases(false);
        });
    }
  }, [dispatch, account?.id, bases, loadingBases]);

  const toggleTableSelection = useCallback(
    (tableId) => {
      if (!editable || !setSelectedResources) return;
      
      // We need to call setSelectedResources with the new state directly, not with a callback
      // because we're inside a child component that needs to notify parent
      const currentState = selectedResources || {};
      let newState;
      
      if (currentState[tableId]) {
        // Table selected, so deselect it
        newState = { ...currentState };
        delete newState[tableId];
      } else {
        // Table not selected, initialize with all events
        const eventIds = events?.map((event) => event.id) || [];
        newState = {
          ...currentState,
          [tableId]: new Set(eventIds)
        };
      }
      
      setSelectedResources(newState);
    },
    [events, editable, setSelectedResources, selectedResources],
  );

  const toggleEventSelection = useCallback(
    (tableId, eventId) => {
      if (!editable || !setSelectedResources) return;
      
      const currentState = selectedResources || {};
      const updated = { ...currentState };
      updated[tableId] = updated[tableId] || new Set();
      const eventSet = new Set(updated[tableId]); // Create new Set to avoid mutation
      
      if (eventSet.has(eventId)) {
        eventSet.delete(eventId);
      } else {
        eventSet.add(eventId);
      }
      
      if (!eventSet.size) {
        delete updated[tableId];
      } else {
        updated[tableId] = eventSet;
      }
      
      setSelectedResources(updated);
    },
    [editable, setSelectedResources, selectedResources],
  );

  const toggleBaseExpansion = useCallback((baseId) => {
    setExpandedBases((prev) => ({ ...prev, [baseId]: !prev[baseId] }));
  }, []);

  // Auto-expand all bases if not in editable mode
  useEffect(() => {
    if (!editable) {
      setExpandedBases(
        Object.keys(bases).reduce((acc, baseId) => {
          acc[baseId] = true;
          return acc;
        }, {})
      );
    }
  }, [editable, bases]);

  const totalSubscriptions = useMemo(() => {
    return Object.values(selectedResources).reduce((acc, eventSet) => {
      return acc + (eventSet?.size || 0);
    }, 0);
  }, [selectedResources]);

  const basesArray = Object.values(bases);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-4 rounded-xl overflow-hidden shadow-lg bg-transparent backdrop-blur-md border border-gray-200 dark:border-gray-700"
    >
      {/* Database Events Header */}
      <button
        onClick={() => setDatabaseSectionExpanded(!databaseSectionExpanded)}
        className="w-full py-3 px-4 flex justify-between items-center bg-gray-50/40 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left focus:outline-none focus-visible:ring focus-visible:ring-primary"
        aria-expanded={databaseSectionExpanded}
        aria-controls="database-events-panel"
      >
        <div className="flex items-center space-x-3">
          <Iconify icon="mdi:database" className="w-5 h-5 text-primary" />
          <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200">
            Database Events
          </h2>
          {loadingBases && <Iconify icon="svg-spinners:pulse-rings-2" className="w-4 h-4" />}
        </div>
        <div className="flex items-center space-x-2">
          {!databaseSectionExpanded && totalSubscriptions > 0 && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {totalSubscriptions} events selected
            </span>
          )}
          <Iconify icon={databaseSectionExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {databaseSectionExpanded && (
          <m.div
            id="database-events-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
            layout
          >
            {/* Search field - only show if we have bases */}
            {basesArray.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-row items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {totalSubscriptions} table events selected
                  </span>
                </div>
                <TextField
                  placeholder="Search bases and tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:search" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            )}

            {/* Content */}
            {loadingBases ? (
              <div className="flex items-center justify-center py-8">
                <Iconify icon="svg-spinners:pulse-rings-2" className="w-8 h-8 text-primary" />
                <span className="ml-2 text-gray-600">Loading bases...</span>
              </div>
            ) : basesArray.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Iconify icon="mdi:database-off" className="w-12 h-12 mx-auto mb-4" />
                <p>No bases found in your account</p>
              </div>
            ) : (
              <div className="space-y-3">
                {basesArray.map((base) => (
                  <BaseCard
                    key={base.id}
                    base={base}
                    events={events}
                    expanded={expandedBases[base.id]}
                    onToggleExpand={toggleBaseExpansion}
                    selectedTables={selectedResources}
                    onToggleTable={toggleTableSelection}
                    onToggleEvent={toggleEventSelection}
                    filterQuery={searchQuery}
                    editable={editable}
                  />
                ))}
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default memo(TableResourceSelector);
