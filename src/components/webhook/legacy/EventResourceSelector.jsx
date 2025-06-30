// import React, { useMemo, useCallback, memo } from 'react';
// import { Autocomplete, TextField, Checkbox, FormControlLabel } from '@mui/material';

// function EventResourceSelector({ event, resources, subscriptions, onEventChange, onResourcesChange }) {
//   const handleEventChange = useCallback((e) => {
//     const { value, checked } = e.target;
//     onEventChange(value, checked);
//   }, [onEventChange]);

//   const filteredResources = useMemo(() => {
//     return resources.filter(resource => resource.resource_type_id === event.details.relationship.resource_type_id);
//   }, [resources, event.details.relationship.resource_type_id]);

//   console.log("filteredResources", resources, filteredResources);

//   const selectedResources = useMemo(() => {
//     const externalPath = event.details.relationship.path;
//     return subscriptions
//       .filter(sub => sub.event_type_id === event.id)
//       .map(sub => resources.find(resource => resource.details[externalPath] === sub.external_id))
//       .filter(resource => resource !== undefined);
//   }, [event.details.relationship.path, event.id, subscriptions, resources]);

//   const handleResourcesChange = useCallback((_, newSelectedResources) => {
//     onResourcesChange(event.id, newSelectedResources);
//   }, [onResourcesChange, event.id]);

//   return (
//     <div style={{ marginBottom: 10 }}>
//       <FormControlLabel
//         control={
//           <Checkbox
//             checked={subscriptions.some(sub => sub.event_type_id === event.id)}
//             onChange={handleEventChange}
//             value={event.id}
//           />
//         }
//         label={event.name}
//       />
//       {subscriptions.some(sub => sub.event_type_id === event.id) && (
//         <Autocomplete
//           fullWidth
//           multiple
//           options={filteredResources}
//           getOptionLabel={(option) => option.name || option.details?.name || 'Unnamed'}
//           getOptionKey={(option) => option?.id ?? option.details?.id}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               variant="filled"
//               label="Select Items"
//             />
//           )}
//           value={selectedResources}
//           onChange={handleResourcesChange}
//           size="small"
//         />
//       )}
//     </div>
//   );
// }

// export default memo(EventResourceSelector);
