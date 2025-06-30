import { Stack, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import ResourceSelector from './ResourceSelector';
import { checkObjectsEqual } from '../../redux/helpers/memoize';
import {
  selectAccountConnectionsByType,
  selectConnectionTypes,
} from '../../redux/slices/connections';
import { selectAccount, selectExtendedResources } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { optimai_integration } from '../../utils/axios';
import ConfirmationButton from '../buttons/ConfirmationButton';
import Iconify from '../iconify';
import ConnectionSelectorAutocomplete from '../tools/ConnectionSelectorAutocomplete';
import CreateConnection from '../tools/CreateConnection';
// import { useDebounce } from "../../hooks/useDebounce";

import { getNested } from '../tools/dynamic/utils';

const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
};

// Custom Hook: Groups events by resource type (UUID or name)
// Custom Hook: Groups events by resource type and adds resources dictionary
const getGroupedEventsByResourceType = (events, resourceTypes, resources) => {
  // Map resources into a dictionary for quick lookup
  const resourceDict = resources.reduce((acc, resource) => {
    const resourceTypeId = resource.resource_type_id;
    if (resourceTypeId) {
      if (!acc[resourceTypeId]) {
        acc[resourceTypeId] = {};
      }
      const { details } = resource;
      // acc[resourceTypeId][details.id] = {
      //   ...details,
      //   '__resource': rest
      // };
      acc[resourceTypeId][details.id] = details;
    }
    return acc;
  }, {});

  const groupedEvents = Object.values(events).reduce((acc, event) => {
    const entityType = event.details?.relationship?.resource_type_id;

    // Determine if entityType is a UUID or a name
    const resourceKey = isValidUUID(entityType)
      ? entityType // Use UUID as key
      : entityType || 'unknown'; // Use name if not UUID

    // Fetch resource details from resourceDict or validResourceTypes
    const resourceTypeDetails = resourceTypes?.[entityType] ?? {
      name: entityType,
    };

    // Initialize the group entry if not present
    if (!acc[resourceKey]) {
      acc[resourceKey] = {
        details: resourceTypeDetails,
        events: [],
        resources: {}, // Dictionary of related resources
      };
    }

    // Add the event to the group
    acc[resourceKey].events.push(event);

    // Add related resource to the resources dictionary
    if (resourceDict[entityType]) {
      acc[resourceKey].resources = Object.entries(resourceDict[entityType]).reduce(
        (acc, [resourceId, resource]) => {
          const externalPath = event.details.relationship.path;
          acc[getNested(resource, externalPath)] = resource;
          return acc;
        },
        {},
      );
    }

    return acc;
  }, {});

  return groupedEvents;
};

const getResourceTypesByConnectionType = async (connectionTypeId) => {
  try {
    const response = await optimai_integration.get(
      `/connection-type/${connectionTypeId}/resource-types`,
    );
    return Promise.resolve(response.data.resource_types);
  } catch (e) {
    return Promise.reject(e.response?.data?.detail ?? e.message ?? 'Server Error');
  }
};

const isAltanWebhook = (webhookId) => webhookId === 'e05685ee-de4c-4602-9e34-08d2fb23d5fc';

// Helper function to extract relevant fields
const mapToComparableObject = (subscriptions) =>
  subscriptions.map(({ external_id, event_type_id, webhook_id }) => ({
    external_id,
    event_type_id,
    webhook_id,
  }));

// Helper function to sort subscriptions
const sortSubscriptions = (subscriptions) =>
  [...subscriptions].sort(
    (a, b) =>
      a.external_id.localeCompare(b.external_id) ||
      a.event_type_id.localeCompare(b.event_type_id) ||
      a.webhook_id.localeCompare(b.webhook_id),
  );

const WebhookEventSelector = ({
  selectedConnectionType = null,
  setSelectedConnectionType,
  editable = false,
}) => {
  const account = useSelector(selectAccount);
  console.log('account', account);
  const { reset, getValues, setValue } = useFormContext();
  const initialSubscriptionsRef = useRef();
  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "subscriptions",
  //   keyName: '__key'
  // });
  const [groupedEvents, setGroupedEvents] = useState({});
  const [existingSubscriptions, setExistingSubscriptions] = useState({});
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedResources, setSelectedResources] = useState({});
  // const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [resourceTypes, setResourceTypes] = useState({});
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
  const types = useSelector(selectConnectionTypes);
  const connectionsSelector = useMemo(
    () => selectAccountConnectionsByType(selectedConnectionType?.id),
    [selectedConnectionType?.id],
  );
  const connections = useSelector(connectionsSelector);
  const extraResourcesSelector = useMemo(() => (state) => selectExtendedResources(state, true), []);
  const extraResources = useSelector(extraResourcesSelector);

  // console.log('extraResources', extraResources);
  // const throttledSearchTerm = useDebounce(searchTerm, 500);

  // Flatten all events from webhooks
  const { events, webhooks } = useMemo(
    () =>
      !selectedConnectionType?.webhooks
        ? {}
        : {
            webhooks: selectedConnectionType.webhooks.items.reduce((acc, webhook) => {
              acc[webhook.id] = webhook;
              return acc;
            }, {}),
            events: selectedConnectionType.webhooks.items
              .flatMap((webhook) => webhook.event_types?.items || [])
              .reduce((acc, event) => {
                acc[event.id] = event;
                return acc;
              }, {}),
          },
    [selectedConnectionType?.webhooks],
  );

  const validResourceTypes = useMemo(
    () => (!selectedConnectionType?.id ? null : resourceTypes[selectedConnectionType.id]),
    [resourceTypes, selectedConnectionType?.id],
  );

  // // Get safe connections
  // const safeConnections = useMemo(() => {
  //   if (!accountId || !connections[accountId]) {
  //     return [];
  //   }
  //   return Array.isArray(connections[accountId]) ? connections[accountId] : [];
  // }, [accountId, connections]);

  // Get available connections for the selected type
  // const availableConnections = useMemo(() => {
  //   if (!selectedConnectionType || !connections.length) {
  //     return [];
  //   }
  //   return connections.filter(
  //     conn => conn?.connection_type?.id === selectedConnectionType.id
  //   );
  // }, [selectedConnectionType, safeConnections]);

  // Get resources for the selected connection

  useEffect(() => {
    if (!connections?.length) {
      return;
    }
    if (!Object.keys(existingSubscriptions ?? {}).length) {
      setSelectedConnection(connections[0] ?? null);
    } else {
      const sub = Object.values(existingSubscriptions)[0];
      if (isAltanWebhook(sub?.webhook_id)) {
        setSelectedConnection(connections[0] ?? null);
      } else {
        setSelectedConnection(
          connections.find(
            (c) =>
              !!c.resources?.items.find((resource) => {
                const externalPath = sub.event_type.details.relationship.path;
                return getNested(resource.details, externalPath) === sub.external_id;
              }),
          ) ?? null,
        );
      }
    }
  }, [connections, existingSubscriptions]);

  useEffect(() => {
    const subs = getValues('subscriptions');
    if (!subs?.length) {
      return;
    }
    if (initialSubscriptionsRef.current === undefined) {
      initialSubscriptionsRef.current = subs;
    }
    setExistingSubscriptions(
      subs.reduce((acc, subs) => {
        acc[`${subs.external_id}_${subs.event_type_id}_${subs.webhook_id}`] = subs;
        return acc;
      }, {}),
    );
    setSelectedConnectionType(types.find((t) => t.id === subs[0].webhook.connection_type_id));
    setSelectedResources(
      subs.reduce((acc, subs) => {
        const resourceTypeId = subs.event_type.details?.relationship?.resource_type_id;
        if (!acc[resourceTypeId]) {
          acc[resourceTypeId] = {};
        }
        if (!acc[resourceTypeId][subs.external_id]) {
          acc[resourceTypeId][subs.external_id] = new Set();
        }
        acc[resourceTypeId][subs.external_id].add(subs.event_type_id);
        return acc;
      }, {}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReplaceWebhook = useCallback(() => {
    setExistingSubscriptions({});
    setSelectedConnectionType(null);
    setSelectedResources({});
    setSelectedConnection(null);
    setValue('subscriptions', [], {
      shouldDirty: true,
    });
  }, [setSelectedConnectionType, setValue]);

  const handleConnectionChange = useCallback((event, newSelectedConnection) => {
    if (newSelectedConnection && newSelectedConnection.name === '+ Create connection') {
      setIsCreatingNewConnection(true);
    } else {
      setSelectedConnection(newSelectedConnection);
      setIsCreatingNewConnection(false);
    }
  }, []);

  useEffect(() => {
    if (!events || !editable) {
      return;
    }
    const currentSubs = Object.entries(selectedResources).flatMap(
      ([resourceTypeId, groupedResources]) => {
        return Object.entries(groupedResources).flatMap(([resourceId, eventsIds]) => {
          return [...eventsIds]
            .filter((eventId) => !!events[eventId])
            .map((eventId) => ({
              event_type_id: eventId,
              external_id: resourceId,
              webhook_id: events[eventId].webhook_id,
              webhook: webhooks[events[eventId].webhook_id],
              event_type: events[eventId],
              ...(existingSubscriptions[`${resourceId}_${eventId}_${events[eventId].webhook_id}`] ??
                {}),
            }));
        });
      },
    );
    const isDirty = !checkObjectsEqual(
      sortSubscriptions(mapToComparableObject(initialSubscriptionsRef.current ?? [])),
      sortSubscriptions(mapToComparableObject(currentSubs)),
    );
    if (!isDirty) {
      if (!!initialSubscriptionsRef.current) {
        reset(
          {
            ...getValues(),
            subscriptions: initialSubscriptionsRef.current,
          },
          {
            keepDefaultValues: true,
            keepDirty: false,
          },
        );
      }
    } else {
      setValue('subscriptions', currentSubs, {
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResources]);

  // const handleResourcesChange = useCallback((eventTypeId, newSelectedResources) => {
  //   const eventType = selectedConnectionType.webhooks?.items
  //     ?.flatMap(webhook => webhook.event_types?.items || [])
  //     ?.find(et => et.id === eventTypeId);

  //   if (!eventType?.details?.relationship?.path) return;

  //   const externalPath = eventType.details.relationship.path;
  //   const updatedSubscriptions = fields.filter(sub => sub.event_type_id !== eventTypeId);

  //   newSelectedResources.forEach(resource => {
  //     updatedSubscriptions.push({
  //       event_type_id: eventTypeId,
  //       webhook_id: selectedConnectionType.id,
  //       external_id: resource.details[externalPath],
  //     });
  //   });

  //   setValue("subscriptions", updatedSubscriptions, { shouldDirty: true });
  // }, [selectedConnectionType, fields, setValue]);

  // const handleEventChange = useCallback((event_type_id, checked) => {
  //   if (checked) {
  //     append({ event_type_id, webhook_id: selectedConnectionType.id });
  //   } else {
  //     const indexToRemove = fields.findIndex(sub => sub.event_type_id !== event_type_id);
  //     remove(indexToRemove);
  //   }
  // }, [append, selectedConnectionType?.id, fields, remove]);

  useEffect(() => {
    if (!!selectedConnectionType?.id && !resourceTypes[selectedConnectionType.id]) {
      getResourceTypesByConnectionType(selectedConnectionType.id).then((response) => {
        setResourceTypes((prev) => ({ ...prev, [selectedConnectionType.id]: response }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConnectionType?.id]);

  useEffect(() => {
    if (!(selectedConnection && !!Object.keys(events ?? {})?.length)) {
      return;
    }
    setGroupedEvents(
      getGroupedEventsByResourceType(events, validResourceTypes, [
        ...(selectedConnection?.resources?.items || []),
        ...extraResources,
      ]),
    );
  }, [validResourceTypes, selectedConnection]);

  // console.log("grouped", groupedEvents);

  const renderResources = !!groupedEvents && selectedConnection && (
    <ResourceSelector
      data={groupedEvents}
      value={selectedResources}
      onChange={setSelectedResources}
      editable={editable}
    />
  );

  if (!editable) {
    return renderResources;
  }

  return (
    <Stack
      spacing={1}
      padding={1}
      width="100%"
      className="rounded-lg backdrop-blur-lg"
    >
      {/* Search bar - always visible */}
      <Stack
        width="100%"
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {selectedConnectionType && (
          // <IconButton onClick={handleBack} size="small">
          //   <Iconify icon="eva:arrow-back-fill" />
          // </IconButton>
          <ConfirmationButton
            containerClassName="group rounded-full bg-transparent border-transparent"
            className="transition-all duration-200 w-[36px] h-[40px] group-hover:w-[155px] text-sm bg-slate-300 dark:bg-slate-700 text-black dark:text-white flex items-center space-x-2 px-2 py-1"
            onClick={handleReplaceWebhook}
            confirmationMessage="Are you sure you want to replace the webhook?"
            confirmButtonText="Yes"
            cancelButtonText="No"
            danger
          >
            <Iconify
              className="text-black dark:text-white"
              icon="ic:outline-change-circle"
            />
            <Typography
              noWrap
              variant="body"
              className="w-full flex-no-wrap hidden group-hover:flex text-black dark:text-white"
            >
              Replace webhook
            </Typography>
          </ConfirmationButton>
        )}
        {!isCreatingNewConnection ? (
          <ConnectionSelectorAutocomplete
            connection={selectedConnection}
            connections={connections}
            onChange={handleConnectionChange}
          />
        ) : (
          <CreateConnection
            id={selectedConnectionType.id}
            setIsCreatingNewConnection={setIsCreatingNewConnection}
          />
        )}
      </Stack>

      <Stack spacing={1}>{renderResources}</Stack>
    </Stack>
  );
};

export default memo(WebhookEventSelector);
