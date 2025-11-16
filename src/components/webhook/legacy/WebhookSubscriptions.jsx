// import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
// import { Autocomplete, Typography, TextField, Stack, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
// import { useSelector } from 'react-redux';
// import IconRenderer from '../icons/IconRenderer';
// import CreateConnection from '../tools/CreateConnection';
// import { createSelector } from '@reduxjs/toolkit';
// import EventResourceSelector from './EventResourceSelector';
// import { useFieldArray, useFormContext } from 'react-hook-form';
// import { selectAccount, selectExtendedResources } from '../../redux/slices/general/index.ts';
// import { selectConnections, selectConnectionTypes } from '../../redux/slices/connections';
// import ConnectionSelectorAutocomplete from '../tools/ConnectionSelectorAutocomplete';
// import Iconify from '../iconify';

// const selectConnectionType = createSelector(
//   [selectConnectionTypes, (state, connectionTypeId) => connectionTypeId],
//   (connTypes, connectionTypeId) => !!connectionTypeId && !!connTypes?.length && connTypes.find(t => t.id === connectionTypeId),
//   {
//     memoizeOptions: {
//       resultEqualityCheck: (prev, next) => {
//         const cleanPrev = (prev || {});
//         const cleanNext = (next || {});
//         const prevKeysLength = Object.keys(cleanPrev).length;
//         const nextKeysLength = Object.keys(cleanNext).length;
//         if (prevKeysLength !== nextKeysLength) {
//           return false;
//         }
//         if (!prevKeysLength) {
//           return true;
//         }
//         return Object.entries(cleanPrev).every(([key, value]) => cleanNext[key] === value);
//       }
//     }
//   }

// );

// function WebhookSubscriptions({ webhook }) {
//   const { control, setValue } = useFormContext();
//   const { fields, append, update, remove, swap, move, insert } = useFieldArray({
//     control,
//     name: "subscriptions",
//     keyName: '__key'
//   });
//   const [selectedConnection, setSelectedConnection] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
//   const connections = useSelector(selectConnections);
//   const account = useSelector(selectAccount);
//   const connectionType = useSelector((state) => selectConnectionType(state, webhook?.connection_type_id));

//   const handleEventChange = useCallback((event_type_id, checked) => {
//     if (checked) {
//       append({ event_type_id, webhook_id: webhook.id });
//     } else {
//       const indexToRemove = fields.findIndex(sub => sub.event_type_id !== event_type_id);
//       remove(indexToRemove)
//     }
//   }, [append, webhook.id, fields, remove]);

//   const handleResourcesChange = useCallback((eventTypeId, newSelectedResources) => {
//     const eventType = webhook?.event_types?.items.find(we => we.id === eventTypeId);
//     const updatedSubscriptions = fields.filter(sub => sub.event_type_id !== eventTypeId);
//     const externalPath = eventType.details.relationship.path;
//     newSelectedResources.forEach(resource => {
//       updatedSubscriptions.push({
//         event_type_id: eventTypeId,
//         webhook_id: webhook.id,
//         external_id: resource.details[externalPath],
//       });
//     });
//     setValue("subscriptions", updatedSubscriptions, { shouldDirty: true });
//   }, [webhook.id, webhook?.event_types?.items, fields]);

//   const handleConnectionChange = useCallback((event, newSelectedConnection) => {
//     if (newSelectedConnection && newSelectedConnection.name === '+ Create connection') {
//       setIsCreatingNewConnection(true);
//     } else {
//       setSelectedConnection(newSelectedConnection);
//       setIsCreatingNewConnection(false);
//     }
//   }, []);

//   const safeConnections = useMemo(() => {
//     if (!account?.id || !connections[account.id]) {
//       return [];
//     }
//     return Array.isArray(connections[account.id]) ? connections[account.id] : [];
//   }, [account?.id, connections]);

//   const existingConnections = useMemo(() => {
//     if (!webhook?.connection_type_id || !safeConnections.length) {
//       return [];
//     }
//     return safeConnections.filter(
//       connection => connection?.connection_type?.id === webhook?.connection_type_id
//     );
//   }, [webhook?.connection_type_id, safeConnections]);

//   const extraResourcesSelector = useMemo(() => (state) => selectExtendedResources(state, webhook?.is_internal), [webhook?.is_internal])
//   const extraResources = useSelector(extraResourcesSelector);
//   const resources = useMemo(() => ([...(selectedConnection?.resources?.items || []), ...extraResources, ...[{ details: {id: account.id, name: "This Account"}, resource_type_id: "account" }]]), [extraResources, selectedConnection?.resources?.items]);

//   const filteredEventTypes = useMemo(() => {
//     if (!webhook?.event_types?.items) return [];
//     return webhook.event_types.items.filter(event =>
//       event.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [webhook?.event_types?.items, searchTerm]);

//   useEffect(() => {
//     if (!webhook.connection_type_id) {
//       append({ webhook_id: webhook.id });
//     }
//   }, [webhook.connection_type_id]);

//   return (
//     <div>
//       <Stack direction='row' spacing={1} alignItems="center" justifyContent="space-between">
//         <Stack direction='row' spacing={1} alignItems="center">
//           {!!connectionType?.icon && <IconRenderer icon={connectionType.icon} size={32} />}
//           <Typography variant="h6">
//             {webhook.name}
//           </Typography>
//         </Stack>

//       </Stack>
//       <Typography>
//         https://api.altan.ai/galaxia/hook/{webhook.url}
//       </Typography>

//       {connectionType && (
//         <div style={{ marginTop: 10 }}>
//           {!isCreatingNewConnection ? (
//             <ConnectionSelectorAutocomplete
//               connection={selectedConnection}
//               connections={existingConnections}
//               onChange={handleConnectionChange}
//             />
//           ) : (
//             <CreateConnection
//               id={connectionType.id}
//               setIsCreatingNewConnection={setIsCreatingNewConnection}
//             />
//           )}
//         </div>
//       )}

//       {(selectedConnection || !webhook.connection_type_id) && (
//         <>
//           {webhook.is_internal === false && (
//             <Typography variant="h6" sx={{ my: 2 }}>
//               Select the events you want to subscribe this Workflow
//             </Typography>
//           )}
//           {webhook?.event_types?.items?.length > 1 && (
//             <TextField
//               autoFocus
//               fullWidth
//               placeholder="Search Events..."
//               variant="outlined"
//               size="small"
//               // value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               sx={{ my: 2 }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Iconify icon="mdi:search" />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           )}
//           {
//             (filteredEventTypes.length > 0)
//               ? filteredEventTypes.map((event) => (
//                 <EventResourceSelector
//                   key={event.id}
//                   event={event}
//                   resources={resources}
//                   subscriptions={fields}
//                   onEventChange={handleEventChange}
//                   onResourcesChange={handleResourcesChange}
//                 />
//               )) : (
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={true}
//                       name="all"
//                       disabled={true}
//                     />
//                   }
//                   label="Subscribed to all events"
//                 />
//               )
//           }
//         </>
//       )}

//     </div>
//   );
// }

// export default memo(WebhookSubscriptions);
