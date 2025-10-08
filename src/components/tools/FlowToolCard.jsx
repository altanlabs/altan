import { Stack, Skeleton, IconButton } from '@mui/material';
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
// import { LoadingButton } from '@mui/lab';
import { useFormContext, useWatch } from 'react-hook-form';

// import { truncate } from 'lodash';
import ConnectionSelectorAutocomplete from './ConnectionSelectorAutocomplete';
import CreateConnection from './CreateConnection';
// import ExecutionResult from './execution/ExecutionResult';
// import { useSnackbar } from 'notistack';
// import IconRenderer from '../icons/IconRenderer';
import Iconify from '../iconify';
import FormParameter from './form/FormParameter';
import FormParameters from './form/FormParameters';
import ActionTypeDetails from './ActionTypeDetails';
import {
  // currentToolSchemaSelector,
  selectAvailableFlowConnections,
} from '../../redux/slices/flows';
import { useSelector } from '../../redux/store';
// import formatData from '../../utils/formatData';
import { optimai_integration } from '../../utils/axios';

// const METHOD_COLORS = {
//   GET: 'success',
//   POST: 'info',
//   PUT: 'warning',
//   PATCH: 'warning',
//   DELETE: 'error',
// };

const FormSkeleton = () => {
  return (
    <>
      <Stack spacing={2}>
        <Skeleton
          variant="text"
          width="100%"
          height={56}
        />
        <Skeleton
          variant="text"
          width="100%"
          height={56}
        />
        <Skeleton
          variant="text"
          width="100%"
          height={56}
        />
        <Skeleton
          variant="rectangular"
          width="100px"
          height="40px"
        />
      </Stack>
    </>
  );
};

// const executeAction = async (connectionId, actionId, parameters = {}) => {
//   try {
//     const response = await optimai_integration.post(
//       `/connection/${connectionId}/actions/${actionId}/execute`,
//       parameters
//     );
//     const { success, data } = response.data;
//     return data;
//   } catch (e) {
//     return Promise.reject(e);
//   }
// }

const FlowToolCard = ({ moduleSchema }) => {
  // const currentToolSchema = useSelector(currentToolSchemaSelector);
  const connections = useSelector(selectAvailableFlowConnections);
  const toolActionTypeId = useWatch({ name: 'tool.action_type_id' });
  const toolActionType = useWatch({ name: 'tool.action_type' });
  const toolConnectionId = useWatch({ name: 'tool.connection_id' });
  const showOverrideConnection = useWatch({ name: 'tool.show_override_connection' });
  const toolName = useWatch({ name: 'tool.name' });
  const [fullFetch, setFullFetch] = useState(false);
  const [metaData, setMetadata] = useState(null);
  const [relationships, setRelationships] = useState(null);
  const actionTypeId = toolActionType?.id ?? toolActionTypeId;
  const {
    setValue,
    // getValues
  } = useFormContext();
  // const { enqueueSnackbar } = useSnackbar();
  // const [actionExecution, setActionExecution] = useState({
  //   loading: false,
  //   result: null,
  //   error: null
  // });

  const [actionTypeLoading, setActionTypeLoading] = useState(false);

  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);

  const existingConnections = useMemo(
    () =>
      !connections?.length
        ? []
        : connections.filter(
            (connection) => connection?.connection_type?.id === toolActionType?.connection_type?.id,
          ),
    [toolActionType, connections],
  );

  // console.log("account", account)

  // const testAction = async () => {
  //   const toolParameters = getValues('tool.parameters') || {};
  //   if (!toolConnectionId || !actionTypeId) {
  //     enqueueSnackbar("You must select a valid action and connection to execute!", { variant: 'error' });
  //     return;
  //   }
  //   const cleanedParameters = Object.fromEntries(Object.entries(toolParameters).filter(([key, value]) => !["", undefined, null].includes(value)));
  //   setActionExecution(prev => ({ ...prev, loading: true }));
  //   executeAction(toolConnectionId, actionTypeId, formatData(cleanedParameters, currentToolSchema.properties))
  //     .then((response) => setActionExecution(prev => ({ ...prev, result: response })))
  //     .catch((error) => setActionExecution(prev => ({ ...prev, error: error })))
  //     .finally(() => setActionExecution(prev => ({ ...prev, loading: false })))
  // };

  useEffect(() => {
    const fetchActionDetails = async () => {
      if (actionTypeLoading || fullFetch) {
        return;
      }
      setActionTypeLoading(true);
      try {
        const response = await optimai_integration.get(`/action/${actionTypeId}`);
        setFullFetch(true);
        const actionTypeResponse = response.data.action_type;
        setMetadata(response.data.action_type?.meta_data);
        setRelationships(response.data.action_type?.input_resources);

        setValue('tool.action_type', { ...(toolActionType ?? {}), ...actionTypeResponse });
        if (!toolName?.length) {
          setValue('tool.name', `Tool from ${actionTypeResponse.name}`);
        }
      } catch (error) {
        console.error('Error fetching action details:', error);
      } finally {
        setActionTypeLoading(false);
      }
    };
    if (!toolActionType?.fullSchema && !!actionTypeId) {
      fetchActionDetails();
    }
  }, [actionTypeId, toolActionType]);

  useEffect(() => {
    async function updateRelationships() {
      if (existingConnections.length > 0) {
        const connectionId = existingConnections[0].id;
        if (!toolConnectionId) {
          setValue('tool.connection_id', connectionId, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
          });
        }
        if (relationships.length > 0 && !relationships[0].resources) {
          const resourceId = relationships[0].resource_id;
          try {
            const response = await optimai_integration.get(
              `/connection/${connectionId}/resource/${resourceId}`,
            );
            const newRelationships = relationships.map((rel, index) =>
              index === 0 ? { ...rel, resources: response.data.resources || [] } : rel,
            );
            setRelationships(newRelationships);
          } catch (error) {
            console.error(`Error fetching resource for ID ${resourceId}:`, error);
          }
        }
      }
    }
    updateRelationships();
  }, [existingConnections, toolConnectionId, relationships]);

  const handleConnectionChange = useCallback(
    (event, selectedConnection) => {
      if (selectedConnection && selectedConnection.name === '+ Create connection') {
        setIsCreatingNewConnection(true);
      } else {
        setValue('tool.connection_id', selectedConnection.id, {
          shouldValidate: true,
          shouldTouch: true,
          shouldDirty: true,
        });
        setIsCreatingNewConnection(false);
      }
    },
    [setValue, setIsCreatingNewConnection],
  );

  const connection = useMemo(
    () =>
      (!!toolConnectionId && existingConnections.find((c) => c.id === toolConnectionId)) || null,
    [existingConnections, toolConnectionId],
  );

  return (
    <div
      className="p-1 w-full overflow-hidden min-h-[60px] overflow-y-auto"
      // sx={{
      //   p: 1,
      //   cursor: 'pointer',
      //   width: '100%',
      //   overflow: 'hidden',
      //   minHeight: '60px'
      // }}
    >
      {!toolActionType ? (
        <FormSkeleton />
      ) : (
        <>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              {!isCreatingNewConnection ? (
                <ConnectionSelectorAutocomplete
                  connection={connection}
                  connections={existingConnections}
                  onChange={handleConnectionChange}
                />
              ) : (
                <CreateConnection
                  id={toolActionType?.connection_type?.id}
                  setIsCreatingNewConnection={setIsCreatingNewConnection}
                />
              )}
              <IconButton
                onClick={() => setValue('tool.show_override_connection', !showOverrideConnection)}
              >
                <Iconify icon="codicon:json" />
              </IconButton>
            </Stack>
            {Object.entries(moduleSchema?.properties?.tool?.properties ?? {})
              .filter(([_, schema]) => !schema['x-ignore-ui'])
              .map(([key, fieldSchema]) => (
                <FormParameter
                  key={key}
                  fieldKey={key}
                  schema={fieldSchema}
                  required={false}
                  enableLexical={true}
                />
              ))}
            {/* <FormParameter
                fieldKey="tool.name"
                schema={{
                  title: 'Name',
                  description: 'Name the tool.',
                  type: 'string'
                }}
                required={true}
              /> */}

            {!!toolConnectionId && !!toolActionType?.locations && (
              <FormParameters
                formSchema={toolActionType.locations}
                relationships={relationships}
                path="tool.parameters."
              />
            )}
          </Stack>
          {/* <ExecutionResult actionExecution={actionExecution} /> */}
          
          {/* Developer Action Type Details - Very Bottom */}
          {toolActionType && (
            <ActionTypeDetails 
              actionType={toolActionType}
              metaData={metaData}
              isVisible={false}
            />
          )}
        </>
      )}
    </div>
  );
};

export default memo(FlowToolCard);
