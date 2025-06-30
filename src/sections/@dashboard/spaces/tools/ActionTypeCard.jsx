//  USED TO CREATE AGENT TOOLS
import {
  Stack,
  Typography,
  TextField,
  Tooltip,
  Skeleton,
  Autocomplete,
  Box,
  Button,
} from '@mui/material';
// import { truncate } from 'lodash';
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import GlobalVarsMenu from '../../../../components/flows/menuvars/GlobalVarsMenu.jsx';
import Iconify from '../../../../components/iconify/index.js';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';
import CreateConnection from '../../../../components/tools/CreateConnection.jsx';
// import DynamicFormField from './DynamicFormField.jsx';
import { getNested } from '../../../../components/tools/dynamic/utils.js';
import ExecutionResult from '../../../../components/tools/execution/ExecutionResult.jsx';
import FormParameter from '../../../../components/tools/form/FormParameter.jsx';
import FormParameters from '../../../../components/tools/form/FormParameters.jsx';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch.js';
import {
  createTool,
  editTool,
  selectAccountConnections,
} from '../../../../redux/slices/connections';
import { optimai_integration, getAltanAxiosInstance } from '../../../../utils/axios.js';

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

const formatData = (data) =>
  Object.keys(data).reduce((acc, key) => {
    if (key.endsWith('_option')) {
      const actualKey = key.replace('_option', '');
      acc[actualKey] = {
        type: data[key],
        value: data[key] === 'ai' ? null : data[actualKey],
      };
    } else if (!data.hasOwnProperty(`${key}_option`)) {
      acc[key] = {
        type: 'fill',
        value: data[key],
      };
    }
    return acc;
  }, {});

// function importDefaultData(data) {
//   const transformedParameters = {};

//   if (!data) {
//     return transformedParameters;
//   }

//   for (const [key, value] of Object.entries(data.parameters)) {
//     if (value.type === 'fill' || value.type === 'ai') {
//       if (value.value && typeof value.value === 'object') {
//         for (const [subKey, subValue] of Object.entries(value.value)) {
//           transformedParameters[subKey] = subValue.value;
//           transformedParameters[`${subKey}_option`] = subValue.type;
//         }
//       } else {
//         transformedParameters[key] = value.value;
//         transformedParameters[`${key}_option`] = value.type;
//       }
//     }
//   }

//   return {
//     ...data,
//     parameters: transformedParameters,
//   };
// }

function transformValue(key, value, schema) {
  if (Array.isArray(value)) {
    return value.reduce((acc, item, index) => {
      const nestedKey = `${key}.[${index}]`;
      const transformed = transformValue(nestedKey, item, schema?.items || {});
      return { ...acc, ...transformed };
    }, {});
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [subKey, subValue]) => {
      const nestedSchema = schema?.properties?.[subKey] || {};
      const transformed = transformValue(`${key}.${subKey}`, subValue, nestedSchema);
      return { ...acc, ...transformed };
    }, {});
  }

  return { [key]: value };
}

function processParameter(acc, key, value, schema) {
  if (!value || typeof value !== 'object') {
    acc[key] = value;
    return;
  }

  if (typeof value.value !== 'object') {
    acc[key] = value.value;
    return;
  }

  if (
    (schema.type === 'object' && !Object.keys(schema.properties ?? {}).length) ||
    (schema.type === 'array' &&
      (!schema.items ||
        !['object', 'array'].includes(schema.items.type) ||
        !Object.keys(schema.items.properties ?? schema.items.items ?? {}).length))
  ) {
    acc[key] = value.value;
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((subValue, index) => {
      const nestedKey = `${key}.${index}.`;
      const nestedSchema = schema?.items || {};

      if (typeof subValue === 'object' && 'value' in subValue) {
        acc[nestedKey] = transformValue(nestedKey, subValue.value, nestedSchema);
        acc[`${nestedKey}_option`] = subValue.type;
      } else {
        acc[nestedKey] = transformValue(nestedKey, subValue, nestedSchema);
      }
    });
  } else {
    Object.entries(value).forEach(([subKey, subValue]) => {
      const nestedKey = `${key}.${subKey}`;
      const nestedSchema = schema?.properties?.[subKey] || {};

      if (typeof subValue === 'object' && 'value' in subValue) {
        acc[nestedKey] = transformValue(nestedKey, subValue.value, nestedSchema);
        acc[`${nestedKey}_option`] = subValue.type;
      } else {
        acc[nestedKey] = transformValue(nestedKey, subValue, nestedSchema);
      }
    });
  }
}

function importDefaultData(tool, schema) {
  if (!tool || typeof tool !== 'object' || !tool.parameters) return {};

  return {
    ...tool,
    parameters: Object.entries(tool.parameters).reduce((acc, [key, value]) => {
      const paramSchema = schema?.properties?.[key] || {};

      if (value.type === 'ai') {
        acc[key] = undefined;
      } else if (value.type === 'fill') {
        processParameter(acc, key, value, paramSchema);
      }
      // else {
      //   acc[key] = value.value;
      // }

      acc[`${key}_option`] = value.type;
      return acc;
    }, {}),
  };
}

// const importDefaultData = (data) => {
//   console.log("importDefaultData", data);
//   const initialFormValues = {};

//   const initializeField = (key, schema, path = '', parameters) => {
//     const fullPath = path ? `${path}.${key}` : key;
//     const parameterValue = parameters ? parameters[key] : undefined;

//     switch (typeof schema?.value) {
//       case 'object':
//         initialFormValues[fullPath] = {};
//         Object.entries(schema).forEach(([nestedKey, nestedSchema]) => {
//           initializeField(nestedKey, nestedSchema, fullPath, parameterValue?.value);
//         });
//         break;
//       case 'array':
//         initialFormValues[fullPath] = parameterValue?.value || [];
//         break;
//       default:
//         initialFormValues[fullPath] = parameterValue?.value !== undefined ? parameterValue?.value?.toString() : '';
//     }
//     initialFormValues[`${fullPath}_option`] = schema?.type || 'fill';
//   };

//   if (data?.parameters) {
//     Object.entries(data.parameters ?? {}).forEach(([key, value]) => {
//       if (!!value && typeof value.value === 'object') {
//         initializeField(key, value, 'parameters');
//       } else {
//         console.log("val", key, value);
//         initialFormValues.parameters[key] = value?.value !== null ? value?.value?.toString() : '';
//         initialFormValues.parameters[`${key}_option`] = value?.type || 'fill';
//       }
//     });
//   }

//   initialFormValues['name'] = data?.name || '';
//   initialFormValues['description'] = data?.description || '';
//   return initialFormValues;
// }

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers */
/* ────────────────────────────────────────────────────────────────────────── */

/** Merge headers, path_params & query_params into a single JSON-schema object */
const aggregateLocationsSchema = (schemaMeta = {}) => {
  const groups = ['path_params', 'query_params', 'headers', 'body'];
  const aggregated = { type: 'object', properties: {}, required: [] };

  groups.forEach((g) => {
    const snippet = schemaMeta[g];
    if (!snippet) return;
    Object.assign(aggregated.properties, snippet.properties || {});
    if (Array.isArray(snippet.required)) {
      aggregated.required.push(...snippet.required);
    }
  });

  return aggregated;
};

/** Replace path-placeholders in /foo/{bar}/baz */
const interpolatePath = (url, pathParams = {}) => {
  return url.replace(/\{([^}]+)}/g, (_, key) => encodeURIComponent(pathParams[key] ?? `{${key}}`));
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Component */
/* ────────────────────────────────────────────────────────────────────────── */

const ActionTypeCard = ({ action = {}, tool = null, onSave = null }) => {
  /* ─── Redux & RHF ─────────────────────────────────────────────────────── */
  const connections = useSelector(selectAccountConnections);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const methods = useForm();
  const isUpdate = !!tool?.id;

  /* ─── Local state ─────────────────────────────────────────────────────── */
  const [internalConn, setInternalConn] = useState(null);
  const [actionDetails, setActionDetails] = useState(null); // what drives the UI right now
  const [actionOverrides, setActionOverrides] = useState(null); // what drives the UI right now
  const [initialDynamicDetails, setInitialDynamicDetails] = useState(null); // original /action/{id} payload for “Back”
  const [step, setStep] = useState(1); // 1 = runtime param form, 2 = real action form
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
  const [response, setResponse] = useState({ loading: false, result: null, error: null });
  const [responseType, setResponseType] = useState(null);

  const values = methods.watch();

  const currentConnectionId = tool?.connection_id || null;

  const firstStepRequiredCompleted = useMemo(() => {
    if (step !== 1 || !actionDetails?.locations) {
      return false;
    }
    return (actionDetails.locations.required ?? []).every(
      (k) => !['', null, undefined].includes(values[k]),
    );
  }, [actionDetails, step, values]);

  /* ─── Existing connections of the same type ──────────────────────────── */
  const existingConnections = useMemo(() => {
    return (connections || []).filter(
      (c) => c?.connection_type?.id === actionDetails?.connection_type?.id,
    );
  }, [connections, actionDetails]);

  /* ─── Fetch the base action details on mount / id-change ─────────────── */
  useEffect(() => {
    if (!action?.id) return;

    const fetchActionDetails = async () => {
      try {
        const { data } = await optimai_integration.get(`/action/${action.id}`);
        const type = data.action_type;

        /* ── Branch: dynamic vs static ─────────────────────────────────── */
        if (type?.meta_data?.type === 'dynamic' && !tool?.meta_data?.override_action) {
          // Build an aggregate schema so the user can input runtime params
          const locationsSchema = aggregateLocationsSchema(type.meta_data.schema);
          const fakeDynamic = {
            ...type,
            // we temporarily expose the runtime params under locations
            locations: locationsSchema,
          };

          setInitialDynamicDetails(type); // stash original for “Back”
          setActionDetails(fakeDynamic); // drives RHF form
          setStep(1); // show runtime param step
          methods.reset(
            importDefaultData(tool, fakeDynamic.locations), // prime RHF with defaults
          );
        } else {
          /* static action – business as usual */
          let selectedActionDetails = type;
          if (tool?.meta_data?.override_action) {
            selectedActionDetails = {
              ...type,
              // we temporarily expose the runtime params under locations
              locations: aggregateLocationsSchema(tool.meta_data.override_action.schema),
            };
          }
          setActionDetails(selectedActionDetails);
          setStep(2); // static actions skip the runtime param step
          methods.reset(importDefaultData(tool, selectedActionDetails?.locations));
        }
      } catch (e) {
        console.warn('Failed to fetch action details:', e);
      }
    };

    fetchActionDetails();
  }, [action?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Keep connection selector in sync ───────────────────────────────── */
  useEffect(() => {
    if (!existingConnections?.length) return;
    setInternalConn(
      existingConnections.find((c) => c.id === currentConnectionId) || existingConnections[0],
    );
  }, [existingConnections, currentConnectionId]);

  /* ─── Event handlers ─────────────────────────────────────────────────── */
  const handleConnectionChange = useCallback((_, newValue) => {
    if (newValue?.name === '+ Create connection') {
      setIsCreatingNewConnection(true);
    } else {
      setInternalConn(newValue);
      setIsCreatingNewConnection(false);
    }
  }, []);

  /** User clicks “Load schema” (Step 1 → Step 2 for dynamic actions) */
  const handleLoadDynamicSchema = useCallback(async () => {
    if (!initialDynamicDetails) return;

    const runtimeValues = methods.getValues(); // { foo: '123', bar: 'xyz' }
    const { schema: metaSchema, overrides: metaOverrides } = initialDynamicDetails.meta_data;

    // Split the runtime values back into their respective buckets
    const pathParams = {};
    const queryParams = {};
    const headerParams = {};

    Object.keys(runtimeValues).forEach((key) => {
      if (metaSchema.path_params?.properties?.[key]) pathParams[key] = runtimeValues[key];
      else if (metaSchema.query_params?.properties?.[key]) queryParams[key] = runtimeValues[key];
      else if (metaSchema.headers?.properties?.[key]) headerParams[key] = runtimeValues[key];
    });

    // Build URL and axios config
    const url = interpolatePath(metaSchema.url, pathParams);

    try {
      const { data: fetched } = await getAltanAxiosInstance(metaSchema.custom_axios).get(url, {
        params: queryParams,
        headers: headerParams,
      });

      const locationsSchema = getNested(fetched, metaSchema.locations?.path ?? 'input_schema');
      const aggregatedSchema = aggregateLocationsSchema(locationsSchema);
      // if (metaSchema.locations?.must_aggregate ?? false) {
      //   locationsSchema = aggregateLocationsSchema(locationsSchema);
      // }
      setActionOverrides({
        url: getNested(fetched, metaOverrides.url?.path ?? 'url'),
        name: getNested(fetched, metaOverrides.name?.path ?? 'name'),
        schema: locationsSchema,
      });
      const details = getNested(fetched, metaSchema.details?.path ?? 'details');
      const fakeDynamic = {
        ...details,
        // we temporarily expose the runtime params under locations
        locations: aggregatedSchema,
      };
      /* fetched is the REAL actionDetails object */
      setActionDetails(fakeDynamic);
      setStep(2);
      methods.reset(importDefaultData(tool, aggregatedSchema));
    } catch (e) {
      console.error('Failed to load dynamic schema:', e);
    }
  }, [initialDynamicDetails, methods, tool]);

  /** Back → Step 1 */
  const handleBack = useCallback(() => {
    if (!initialDynamicDetails) return;
    const locationsSchema = aggregateLocationsSchema(initialDynamicDetails.meta_data.schema);
    const fakeDynamic = { ...initialDynamicDetails, locations: locationsSchema };
    setActionDetails(fakeDynamic);
    setStep(1);
    methods.reset(importDefaultData(tool, fakeDynamic.locations));
  }, [initialDynamicDetails, methods, tool]);

  /** Final save (only available in Step 2) */
  const handleSubmit = methods.handleSubmit(async (data) => {
    const { parameters, ...rest } = data;
    const formatted = {
      ...rest,
      parameters: parameters ? formatData(parameters) : {},
      ...(isUpdate ? {} : { action_type_id: action.id, override_action: actionOverrides }),
    };

    const dispatchFn = isUpdate
      ? editTool({ toolId: tool.id, formData: formatted })
      : createTool({ connectionId: internalConn?.id, formData: formatted });

    const result = await dispatchWithFeedback(dispatchFn, {
      successMessage: `Tool ${isUpdate ? 'updated' : 'created'} successfully`,
      errorMessage: `Error ${isUpdate ? 'updating' : 'creating'} the tool`,
      useSnackbar: true,
    });

    if (onSave) onSave(result);
  });

  useEffect(() => {
    if (step !== 1 || !actionDetails?.locations || !firstStepRequiredCompleted) {
      return;
    }
    const allParamsCompleted =
      Object.keys(actionDetails.locations.properties).length ===
      (actionDetails.locations.required?.length ?? 0);
    if (allParamsCompleted) {
      handleLoadDynamicSchema();
    }
  }, [firstStepRequiredCompleted]);

  /* ─── Small renderer helpers ─────────────────────────────────────────── */
  const renderConnectionInput = () => {
    if (tool?.connection_id) return null;
    return isCreatingNewConnection ? (
      <CreateConnection
        id={actionDetails?.connection_type?.id}
        setIsCreatingNewConnection={setIsCreatingNewConnection}
      />
    ) : (
      <Autocomplete
        options={[...existingConnections, { name: '+ Create connection' }]}
        getOptionLabel={(opt) => opt.name}
        renderOption={({ key, ...props }, option) => (
          <Stack
            key={key}
            {...props}
            direction="row"
            spacing={1}
            alignItems="center"
            padding={1}
          >
            <Tooltip
              title={JSON.stringify(option.details || {}, null, 2)}
              arrow
              followCursor
            >
              <span>
                <IconRenderer
                  icon={option.connection_type?.icon}
                  color={option.connection_type?.meta_data?.color || 'inherit'}
                />
              </span>
            </Tooltip>
            <Typography variant="caption">{option.name}</Typography>
          </Stack>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Connection"
            variant="filled"
          />
        )}
        value={internalConn}
        onChange={handleConnectionChange}
        size="small"
      />
    );
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="relative w-full">
        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 bg-white/40 py-2 px-4 shadow-md dark:bg-gray-800/40 backdrop-blur-md">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
              <IconRenderer
                icon={
                  actionDetails?.connection_type?.icon ||
                  actionDetails?.connection_type?.external_app?.icon ||
                  'ri:hammer-fill'
                }
              />
              <h5 className="text-lg font-semibold dark:text-gray-200">
                {action?.name || 'Unnamed Action'}
              </h5>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {action?.description?.length > 80 ? (
                <span title={action.description}>{action.description.slice(0, 80)}...</span>
              ) : (
                action?.description || 'No description available'
              )}
            </div>
          </div>

          {/* Save button only active in Step 2 */}
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={!methods.formState.isDirty}
              className={cn(
                'flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md',
                methods.formState.isDirty
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400',
              )}
            >
              <Iconify icon="dashicons:saved" />
              Save
            </button>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="p-4">
          <FormProvider {...methods}>
            {!actionDetails ? (
              <FormSkeleton />
            ) : (
              <>
                <Stack spacing={1}>
                  {renderConnectionInput()}

                  {/* name & description only in Step 2 */}
                  {step === 2 &&
                    ['name', 'description'].map((field) => (
                      <FormParameter
                        key={field}
                        fieldKey={field}
                        schema={{
                          type: 'string',
                          description: `The ${field} of the tool.`,
                        }}
                        required
                        isInMappings={false}
                        relationship={null}
                        enableLexical={false}
                        enableAIFill={false}
                      />
                    ))}
                </Stack>

                {/* Step-specific parameter forms */}
                {step === 1 && actionDetails?.locations && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 2 }}
                    >
                      Runtime parameters
                    </Typography>
                    <FormParameters
                      formSchema={actionDetails.locations}
                      path="" /* store at root */
                    />
                    {!!firstStepRequiredCompleted && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="soft"
                          color="inherit"
                          onClick={handleLoadDynamicSchema}
                        >
                          Load schema
                        </Button>
                      </Box>
                    )}
                  </>
                )}

                {step === 2 && actionDetails?.locations && (
                  <FormParameters
                    formSchema={actionDetails.locations}
                    enableLexical
                    enableAIFill
                    path="parameters."
                  />
                )}

                {step === 2 && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: `${responseType}.dark`,
                      borderRadius: '12px',
                    }}
                  >
                    <ExecutionResult actionExecution={response} />
                  </Box>
                )}

                {/* Back button only visible in Step 2 for dynamic actions */}
                {step === 2 && initialDynamicDetails && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      onClick={handleBack}
                      startIcon={<Iconify icon="mdi:arrow-left" />}
                    >
                      Back
                    </Button>
                  </Box>
                )}
              </>
            )}
          </FormProvider>
        </div>
      </div>
      <GlobalVarsMenu mode="agent" />
    </>
  );
};

export default memo(ActionTypeCard);

// const ActionTypeCard = ({ action = {}, tool = null, onSave = null }) => {
//   const connections = useSelector(selectAccountConnections);
//   const [dispatchWithFeedback] = useFeedbackDispatch();
//   const methods = useForm();

//   const [internalConn, setInternalConn] = useState(null);
//   const [actionDetails, setActionDetails] = useState(null);
//   const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
//   const [response, setResponse] = useState({ loading: false, result: null, error: null });
//   const [responseType, setResponseType] = useState(null);

//   const currentConnectionId = tool?.connection_id || null;

//   const existingConnections = useMemo(() => {
//     return (connections || []).filter(
//       (c) => c?.connection_type?.id === actionDetails?.connection_type?.id,
//     );
//   }, [connections, actionDetails]);

//   useEffect(() => {
//     if (!action?.id) return;

//     const fetchActionDetails = async () => {
//       try {
//         const { data } = await optimai_integration.get(`/action/${action.id}`);
//         const type = data.action_type;
//         setActionDetails(type);
//         methods.reset(importDefaultData(tool, type?.locations));
//       } catch (error) {
//         console.warn('Failed to fetch action details:', error);
//       }
//     };

//     fetchActionDetails();
//   }, [action?.id, methods, tool]);

//   useEffect(() => {
//     if (!existingConnections?.length) return;
//     setInternalConn(
//       existingConnections.find(c => c.id === currentConnectionId) || existingConnections[0],
//     );
//   }, [existingConnections, currentConnectionId]);

//   const handleConnectionChange = useCallback((_, newValue) => {
//     if (newValue?.name === '+ Create connection') {
//       setIsCreatingNewConnection(true);
//     } else {
//       setInternalConn(newValue);
//       setIsCreatingNewConnection(false);
//     }
//   }, []);

//   const handleSubmit = methods.handleSubmit(async (data) => {
//     const { parameters, ...rest } = data;
//     const formatted = {
//       ...rest,
//       parameters: parameters ? formatData(parameters) : {},
//       ...(tool?.id ? {} : { action_type_id: action.id }),
//     };

//     const dispatchFn = tool?.id
//       ? editTool({ toolId: tool.id, formData: formatted })
//       : createTool({ connectionId: internalConn?.id, formData: formatted });

//     const result = await dispatchWithFeedback(dispatchFn, {
//       successMessage: `Tool ${tool?.id ? 'updated' : 'created'} successfully`,
//       errorMessage: `Error ${tool?.id ? 'updating' : 'creating'} the tool`,
//       useSnackbar: true,
//     });

//     if (onSave) onSave(result);
//   });

//   const renderConnectionInput = () => {
//     if (tool?.connection_id) return null;
//     return isCreatingNewConnection ? (
//       <CreateConnection
//         id={actionDetails?.connection_type?.id}
//         setIsCreatingNewConnection={setIsCreatingNewConnection}
//       />
//     ) : (
//       <Autocomplete
//         options={[...existingConnections, { name: '+ Create connection' }]}
//         getOptionLabel={(opt) => opt.name}
//         renderOption={({ key, ...props }, option) => (
//           <Stack key={key} {...props} direction="row" spacing={1} alignItems="center" padding={1}>
//             <Tooltip title={JSON.stringify(option.details || {}, null, 2)} arrow followCursor>
//               <span>
//                 <IconRenderer
//                   icon={option.connection_type?.icon}
//                   color={option.connection_type?.meta_data?.color || 'inherit'}
//                 />
//               </span>
//             </Tooltip>
//             <Typography variant="caption">{option.name}</Typography>
//           </Stack>
//         )}
//         renderInput={(params) => <TextField {...params} label="Select Connection" variant="filled" />}
//         value={internalConn}
//         onChange={handleConnectionChange}
//         size="small"
//       />
//     );
//   };

//   return (
//     <>
//       <div className="relative w-full">
//         <div className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 bg-white/40 py-2 px-4 shadow-md dark:bg-gray-800/40 backdrop-blur-md">
//           <div className="flex flex-col w-full">
//             <div className="flex items-center gap-2">
//               <IconRenderer icon={actionDetails?.connection_type?.icon || actionDetails?.connection_type?.external_app?.icon || 'ri:hammer-fill'} />
//               <h5 className="text-lg font-semibold dark:text-gray-200">
//                 {action?.name || 'Unnamed Action'}
//               </h5>
//             </div>
//             <div className="text-xs text-gray-600 dark:text-gray-400">
//               {action?.description?.length > 80
//                 ? <span title={action.description}>{action.description.slice(0, 80)}...</span>
//                 : (action?.description || 'No description available')}
//             </div>
//           </div>
//           <button
//             onClick={handleSubmit}
//             disabled={!methods.formState.isDirty}
//             className={cn(
//               'flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md',
//               methods.formState.isDirty
//                 ? 'bg-blue-600 text-white hover:bg-blue-700'
//                 : 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400',
//             )}
//           >
//             <Iconify icon="dashicons:saved" />
//             Save
//           </button>
//         </div>

//         <div className="p-4">
//           <FormProvider {...methods}>
//             {!actionDetails ? (
//               <FormSkeleton />
//             ) : (
//               <>
//                 <Stack spacing={1}>
//                   {renderConnectionInput()}
//                   {['name', 'description'].map((field) => (
//                     <FormParameter
//                       key={field}
//                       fieldKey={field}
//                       schema={{ type: 'string', description: `The ${field} of the tool.` }}
//                       required
//                       isInMappings={false}
//                       relationship={null}
//                       enableLexical={false}
//                       enableAIFill={false}
//                     />
//                   ))}
//                 </Stack>
//                 {actionDetails?.locations && (
//                   <FormParameters
//                     formSchema={actionDetails.locations}
//                     enableLexical
//                     enableAIFill
//                     path="parameters."
//                   />
//                 )}
//                 {!response.loading && (
//                   <Box sx={{ mt: 1, p: 2, bgcolor: `${responseType}.dark`, borderRadius: '12px' }}>
//                     <ExecutionResult actionExecution={response} />
//                   </Box>
//                 )}
//               </>
//             )}
//           </FormProvider>
//         </div>
//       </div>
//       <GlobalVarsMenu mode="agent" />
//     </>
//   );
// };

// export default memo(ActionTypeCard);

/*
  <span
    className={`px-2 py-1 text-sm font-semibold rounded bg-opacity-20 ${METHOD_COLORS[action.method || actionDetails?.method] || 'bg-gray-300'
      }`}
  >
    {action.method || actionDetails?.method}
  </span>
  <button
    onClick={testAction}
    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
  >
    <Iconify icon="mdi:test-tube" />
    {response.loading ? 'Testing...' : 'Test'}
  </button>

  const testAction = async () => {
    const rawParams = getValues('parameters');
    const parameters = rawParams ? formatData(rawParams) : {};
    try {
      setResponse(prev => ({ ...prev, loading: true }));
      const response = await optimai_integration.post(`/connection/${internalConn?.id}/actions/${action?.id}/execute`, parameters);
      const { data, success } = response.data;
      if (!success) {
        throw new Error(data);
      }
      setResponse(prev => ({ ...prev, result: data }));
      setResponseType('success');
    } catch (error) {
      setResponse(prev => ({ ...prev, error }));
      setResponseType('error');
    } finally {
      setResponse(prev => ({ ...prev, loading: false }));
    }
  };

*/
