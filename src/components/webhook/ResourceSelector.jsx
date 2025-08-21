import { InputAdornment, TextField, Tooltip } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';

import { cn } from '@lib/utils';

import Iconify from '../iconify';
import TableResourceSelector from './TableResourceSelector';
import ResourceCard from '../tools/ResourceCard';

/**
 * A custom Checkbox component with a scalable check icon and improved styling.
 * Uses tailwind classes for size and state styling.
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
 * EventList: Displays a filtered list of events with checkboxes.
 * No longer uses AnimatePresence internally; the parent handles show/hide.
 */
const EventList = ({ events, selectedEventIds, onToggleEvent, filterQuery, editable = false }) => {
  const filteredEvents = useMemo(() => {
    if (!filterQuery.trim()) return events;
    const q = filterQuery.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, filterQuery]);

  return (
    <div
      className="ml-6 mt-2 space-y-1"
      role="list"
    >
      {filteredEvents
        .filter((event) => !!editable || selectedEventIds.has(event.id))
        .map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-2"
            role="listitem"
          >
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
 * ResourceItem: Displays a single resource and its events.
 * Events are only shown if the resource is selected or if the search query matches any events.
 */
const ResourceItem = ({
  typeId,
  resourceId,
  resource,
  selectedEvents,
  onToggleResource,
  onToggleEvent,
  events,
  filterQuery,
  editable = false,
}) => {
  const isResourceSelected = !!selectedEvents;
  const handleResourceChange = useCallback(
    () => onToggleResource(typeId, resourceId),
    [onToggleResource, typeId, resourceId],
  );
  const handleEventToggle = useCallback(
    (eventId) => onToggleEvent(typeId, resourceId, eventId),
    [onToggleEvent, typeId, resourceId],
  );

  const resourceMatchesQuery =
    resource.name?.toLowerCase().includes(filterQuery.toLowerCase()) || filterQuery.trim() === '';
  const filteredEvents = useMemo(() => {
    const q = filterQuery.toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, filterQuery]);

  // If neither the resource nor its events match the query, skip rendering.
  if (!resourceMatchesQuery && filteredEvents.length === 0) return null;

  const selectedCount = selectedEvents ? selectedEvents.size : 0;

  // Determine if we should show events: either the resource is selected or the filterQuery matches events.
  const showEvents = isResourceSelected || (filterQuery.trim() !== '' && filteredEvents.length > 0);

  if (!editable && !selectedCount) {
    return null;
  }

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center space-x-3 cursor-pointer group">
        {!!editable && (
          <Checkbox
            checked={isResourceSelected}
            onChange={handleResourceChange}
            size="5"
            editable={editable}
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Tooltip
            title={<ResourceCard resource={{ details: resource }} />}
            placement="top"
            componentsProps={{
              tooltip: {
                className: 'backdrop-blur-lg rounded-lg p-0',
                sx: {
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  boxShadow: 1,
                  borderRadius: 1,
                  p: 1,
                  maxWidth: 'none',
                },
              },
            }}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors duration-200 text-sm">
              {resource.name || resource.id}
            </span>
          </Tooltip>
          {!isResourceSelected && selectedCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              ({selectedCount} events)
            </span>
          )}
        </div>
      </div>

      {/* Animate the expansion/collapse of events */}
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
              onToggleEvent={handleEventToggle}
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
 * TypeCard: Handles a type block and its internal resources.
 * Can be collapsed/expanded. Shows summary of selected resources/events when collapsed.
 */
const TypeCard = ({
  typeId,
  type,
  expanded,
  onToggleExpand,
  selectedResources,
  onToggleResource,
  onToggleEvent,
  filterQuery,
  editable = false,
}) => {
  // Debug logging removed for production
  // Calculate selection summary
  const { totalResources, selectedResourceCount, totalEventCount, selectedEventCount } =
    useMemo(() => {
      const resources = Object.entries(type.resources);
      let srCount = 0;
      let seCount = 0;
      const teCount = resources.length * (type.events?.length || 0);
      for (const [resourceId] of resources) {
        const selEv = selectedResources[typeId]?.[resourceId];
        if (selEv) {
          srCount++;
          seCount += selEv.size;
        }
      }
      return {
        totalResources: resources.length,
        selectedResourceCount: srCount,
        totalEventCount: teCount,
        selectedEventCount: seCount,
      };
    }, [selectedResources, typeId, type]);

  // Filter resources based on query
  const filteredResourceIds = useMemo(() => {
    const q = filterQuery.toLowerCase();
    return Object.entries(type.resources).filter(([, resource]) => {
      const resourceMatches = resource.name?.toLowerCase().includes(q);
      const eventMatches = type.events.some((e) => e.name.toLowerCase().includes(q));
      return q.trim() === '' || resourceMatches || eventMatches;
    });
  }, [type, filterQuery]);

  const realExpanded = useMemo(
    () => !!expanded || (!!filterQuery?.length && !!filteredResourceIds?.length),
    [expanded, filterQuery?.length, filteredResourceIds?.length],
  );

  // If no matches and we have a query, don't show the type block
  if (
    (filteredResourceIds.length === 0 && filterQuery.trim() !== '') ||
    (!editable && !(selectedResourceCount + selectedEventCount))
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
        onClick={() => onToggleExpand(typeId)}
        className="w-full py-1 px-2 flex justify-between items-center bg-gray-50/40 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left focus:outline-none focus-visible:ring focus-visible:ring-primary"
        aria-expanded={realExpanded}
        aria-controls={`type-panel-${typeId}`}
      >
        <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex-1">
          {type.details.name}
        </h2>
        {!realExpanded && (selectedResourceCount > 0 || selectedEventCount > 0) && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
            {selectedResourceCount}/{totalResources} resources, {selectedEventCount}/
            {totalEventCount} events
          </span>
        )}
        <Iconify icon={realExpanded ? 'mdi:chevron-left' : 'mdi:chevron-right'} />
      </button>

      <AnimatePresence>
        {realExpanded && (
          <m.div
            id={`type-panel-${typeId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3"
            layout
          >
            {filteredResourceIds
              .sort(([aResourceId, aResource], [bResourceId, bResource]) => {
                const aSelected = Boolean(selectedResources[typeId]?.[aResourceId]);
                const bSelected = Boolean(selectedResources[typeId]?.[bResourceId]);

                // Sort selected ones first
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;

                // Sort alphabetically by resource.name as secondary criteria
                const aName = aResource.name?.toLowerCase() || '';
                const bName = bResource.name?.toLowerCase() || '';
                return aName.localeCompare(bName);
              })
              .map(([resourceId, resource]) => (
                <ResourceItem
                  key={resourceId}
                  typeId={typeId}
                  resourceId={resourceId}
                  resource={resource}
                  events={type.events}
                  selectedEvents={selectedResources[typeId]?.[resourceId]}
                  onToggleResource={onToggleResource}
                  onToggleEvent={onToggleEvent}
                  filterQuery={filterQuery}
                  editable={editable}
                />
              ))}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

/**
 * Main ResourceSelector component.
 * Provides search capabilities, improved UI/UX, and displays selected values.
 */
const ResourceSelector = ({
  data,
  value: selectedResources,
  onChange: setSelectedResources,
  editable = false,
}) => {
  const [expandedTypes, setExpandedTypes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleResourceSelection = useCallback(
    (typeId, resourceId) => {
      if (!editable || !setSelectedResources) {
        return;
      }
      setSelectedResources((prev) => {
        const updated = { ...prev };
        updated[typeId] = updated[typeId] || {};
        if (updated[typeId][resourceId]) {
          // Resource selected, so deselect it
          delete updated[typeId][resourceId];
        } else {
          // Resource not selected, initialize empty set for events
          const events = data[typeId]?.events?.map((event) => event.id);
          updated[typeId][resourceId] = new Set(events ?? []);
        }
        return updated;
      });
    },
    [data, editable, setSelectedResources],
  );

  const toggleEventSelection = useCallback(
    (typeId, resourceId, eventId) => {
      if (!editable || !setSelectedResources) {
        return;
      }
      setSelectedResources((prev) => {
        const updated = { ...prev };
        updated[typeId] = updated[typeId] || {};
        updated[typeId][resourceId] = updated[typeId][resourceId] || new Set();
        const eventSet = updated[typeId][resourceId];
        if (eventSet.has(eventId)) {
          eventSet.delete(eventId);
        } else {
          eventSet.add(eventId);
        }
        if (!eventSet.size) {
          delete updated[typeId][resourceId];
        }
        return updated;
      });
    },
    [editable, setSelectedResources],
  );

  useEffect(() => {
    setExpandedTypes(
      !editable
        ? Object.keys(data).reduce((acc, resourceTypeId) => {
            acc[resourceTypeId] = true;
            return acc;
          }, {})
        : {},
    );
  }, [editable, data]);

  const toggleTypeExpansion = useCallback((typeId) => {
    setExpandedTypes((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  }, []);

  const totalSubscriptions = useMemo(
    () =>
      Object.entries(selectedResources).reduce((total, [, groupedResources]) => {
        const groupTotal = Object.entries(groupedResources).reduce((subTotal, [, eventsIds]) => {
          return subTotal + (eventsIds?.size ?? 0);
        }, 0);
        return total + groupTotal;
      }, 0),
    [selectedResources],
  );

  // Check if we have a table type - use custom component for tables
  const hasTableType = data && data.table;

  // If we only have table type, render ONLY the custom TableResourceSelector
  if (hasTableType && Object.keys(data).length === 1) {
    return (
      <TableResourceSelector
        events={data.table.events}
        value={selectedResources.table || {}}
        onChange={(tableSelections) => {
          setSelectedResources(prev => ({ ...prev, table: tableSelections }));
        }}
        editable={editable}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <h1 className="text-lg font-bold text-primary dark:text-primary-dark tracking-wide">
            {editable ? 'Subscriptions Selector (Events & Resources)' : 'Current Subscriptions'}
          </h1>
          <div className="flex flex-row items-center space-x-1">
            <Iconify icon="svg-spinners:pulse-rings-2" />
            <p className="text-sm text-primary dark:text-primary-dark tracking-wide">
              Your trigger{editable ? ' will listen ' : ' is listening '}to {totalSubscriptions}{' '}
              events
            </p>
          </div>
        </div>
        <TextField
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:search" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {Object.entries(data).map(([typeId, type]) => {
        // Use custom TableResourceSelector for table type
        if (typeId === 'table') {
          return (
            <div key={typeId} className="mb-4">
              <TableResourceSelector
                events={type.events}
                value={selectedResources.table || {}}
                onChange={(tableSelections) => {
                  setSelectedResources(prev => ({ ...prev, table: tableSelections }));
                }}
                editable={editable}
              />
            </div>
          );
        }

        // Use default TypeCard for other types
        return (
          <TypeCard
            key={typeId}
            typeId={typeId}
            type={type}
            expanded={expandedTypes[typeId]}
            onToggleExpand={toggleTypeExpansion}
            selectedResources={selectedResources}
            onToggleResource={toggleResourceSelection}
            onToggleEvent={toggleEventSelection}
            filterQuery={searchQuery}
            editable={editable}
          />
        );
      })}
    </div>
  );
};

export default memo(ResourceSelector);
