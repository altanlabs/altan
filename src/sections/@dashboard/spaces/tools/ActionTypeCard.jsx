//  USED TO CREATE AGENT TOOLS
import { m, AnimatePresence } from 'framer-motion';
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/Button';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import { Skeleton } from '@components/ui/skeleton';
import { Switch } from '@components/ui/switch';
import { cn } from '@lib/utils';

import GlobalVarsMenu from '../../../../components/flows/menuvars/GlobalVarsMenu.jsx';
import Iconify from '../../../../components/iconify/index.js';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';
import { useSnackbar } from '../../../../components/snackbar';
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
import { getSpace } from '../../../../redux/slices/spaces';
import { dispatch } from '../../../../redux/store';
import { optimai, optimai_integration, getAltanAxiosInstance } from '../../../../utils/axios.js';

// const METHOD_COLORS = {
//   GET: 'success',
//   POST: 'info',
//   PUT: 'warning',
//   PATCH: 'warning',
//   DELETE: 'error',
// };

const FormSkeleton = () => {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 p-2.5 sm:p-3">
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </m.div>
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

/** Extract intent settings from tool metadata */
const getIntentSettings = (tool) => ({
  intent_settings: {
    intent: tool?.meta_data?.intent_settings?.intent ?? false,
    ui_intent: tool?.meta_data?.intent_settings?.ui_intent ?? false,
    async: tool?.meta_data?.intent_settings?.async ?? false,
  },
});

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
  const currentAgent = useSelector((state) => state.agents.currentAgent);
  const currentSpace = useSelector((state) => state.spaces.current);
  const { enqueueSnackbar } = useSnackbar();
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

          setInitialDynamicDetails(type); // stash original for "Back"
          setActionDetails(fakeDynamic); // drives RHF form
          setStep(1); // show runtime param step
          methods.reset({
            ...importDefaultData(tool, fakeDynamic.locations), // prime RHF with defaults
            ...getIntentSettings(tool),
          });
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
          methods.reset({
            ...importDefaultData(tool, selectedActionDetails?.locations),
            ...getIntentSettings(tool),
          });
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
      methods.reset({
        ...importDefaultData(tool, aggregatedSchema),
        ...getIntentSettings(tool),
      });
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
    methods.reset({
      ...importDefaultData(tool, fakeDynamic.locations),
      ...getIntentSettings(tool),
    });
  }, [initialDynamicDetails, methods, tool]);

  /** Final save (only available in Step 2) */
  const handleSubmit = methods.handleSubmit(async (data) => {
    if (!isUpdate && !currentAgent?.id) {
      enqueueSnackbar('No agent selected. Please select an agent first.', { variant: 'error' });
      return;
    }

    const { parameters, intent_settings, ...rest } = data;

    try {
      if (isUpdate) {
        // Update existing tool using the old flow
        const formatted = {
          ...rest,
          parameters: parameters ? formatData(parameters) : {},
          meta_data: {
            ...(tool?.meta_data || {}),
            intent_settings: {
              intent: intent_settings?.intent ?? false,
              ui_intent: intent_settings?.ui_intent ?? false,
              async: intent_settings?.async ?? false,
            },
          },
        };

        const result = await dispatchWithFeedback(editTool({ toolId: tool.id, formData: formatted }), {
          successMessage: 'Tool updated successfully',
          errorMessage: 'Error updating the tool',
          useSnackbar: true,
        });

        if (onSave) onSave(result);
      } else {
        // Create new tool with single API call
        const payload = {
          tool_type: 'server',
          connection_id: internalConn?.id,
          action_type_id: action.id,
          name: data.name,
          description: data.description,
          parameters: parameters ? formatData(parameters) : {},
          meta_data: {
            intent_settings: {
              intent: intent_settings?.intent ?? false,
              ui_intent: intent_settings?.ui_intent ?? false,
              async: intent_settings?.async ?? false,
            },
            override_action: actionOverrides,
          },
        };

        await optimai.post(`/agent/${currentAgent.id}/add-tool`, payload);
        
        // Refetch space data to get updated tools list
        if (currentSpace?.id) {
          await dispatch(getSpace(currentSpace.id));
        }

        enqueueSnackbar('Tool created successfully', { variant: 'success' });

        if (onSave) onSave();
      }
    } catch (error) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} tool:`, error);
      enqueueSnackbar(`Error ${isUpdate ? 'updating' : 'creating'} the tool`, { variant: 'error' });
    }
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
      <m.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15 }}
      >
        <CreateConnection
          id={actionDetails?.connection_type?.id}
          setIsCreatingNewConnection={setIsCreatingNewConnection}
        />
      </m.div>
    ) : (
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="space-y-1.5"
      >
        <Label className="text-[10px] sm:text-xs">Connection</Label>
        <div className="grid gap-1">
          {existingConnections.map((conn, index) => (
            <m.div
              key={conn.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.998 }}
            >
              <button
                onClick={() => setInternalConn(conn)}
                className={cn(
                  'w-full flex items-center gap-2 p-2 sm:p-2.5 rounded-md border transition-all text-left',
                  internalConn?.id === conn.id
                    ? 'border-foreground/20 bg-muted/50'
                    : 'border-border hover:border-foreground/20 hover:bg-muted/30',
                )}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <IconRenderer icon={conn.connection_type?.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{conn.name}</p>
                  {conn.connection_type?.name && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {conn.connection_type.name}
                    </p>
                  )}
                </div>
                {internalConn?.id === conn.id && (
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Iconify icon="mdi:check-circle" width={14} className="text-foreground" />
                  </m.div>
                )}
              </button>
            </m.div>
          ))}
          <m.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }}>
            <Button
              variant="outline"
              onClick={() => setIsCreatingNewConnection(true)}
              className="w-full h-8 text-xs gap-1"
              size="sm"
            >
              <Iconify icon="mdi:plus" width={12} />
              Create New Connection
            </Button>
          </m.div>
        </div>
      </m.div>
    );
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 backdrop-blur-xl bg-background/95 border-b flex-shrink-0"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5">
            <div className="flex items-start gap-2 flex-1 min-w-0 w-full sm:w-auto">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex-shrink-0"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border bg-muted/50 flex items-center justify-center">
                  <IconRenderer
                    icon={
                      actionDetails?.connection_type?.icon ||
                      actionDetails?.connection_type?.external_app?.icon ||
                      'ri:hammer-fill'
                    }
                    className="w-4 h-4"
                  />
                </div>
              </m.div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-semibold truncate">
                  {action?.name || 'Unnamed Action'}
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {action?.description || 'No description available'}
                </p>

                {step === 1 && initialDynamicDetails && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 sm:gap-1.5 mt-1.5"
                  >
                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5">
                      Step 1
                    </Badge>
                    <Iconify icon="mdi:chevron-right" width={10} className="text-muted-foreground" />
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 opacity-50">
                      Step 2
                    </Badge>
                  </m.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {step === 2 && initialDynamicDetails && (
                <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleBack} variant="ghost" size="sm" className="h-7 sm:h-8 text-xs">
                    <Iconify icon="mdi:arrow-left" width={14} />
                    Back
                  </Button>
                </m.div>
              )}

              {step === 2 && (
                <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial">
                  <Button
                    onClick={handleSubmit}
                    disabled={!methods.formState.isDirty}
                    size="sm"
                    className="h-7 sm:h-8 gap-1.5 text-xs w-full sm:w-auto"
                  >
                    <Iconify icon="mdi:content-save" width={14} />
                    Save
                  </Button>
                </m.div>
              )}
            </div>
          </div>
        </m.div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <FormProvider {...methods}>
            {!actionDetails ? (
              <FormSkeleton />
            ) : (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-2.5 sm:p-3 space-y-3"
              >
                {/* Connection Input */}
                <AnimatePresence mode="wait">
                  {renderConnectionInput()}
                </AnimatePresence>

                {/* Name & Description - Step 2 only */}
                {step === 2 && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      {['name', 'description'].map((field, index) => (
                        <m.div
                          key={field}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.03 }}
                        >
                          <FormParameter
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
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                )}

                {/* Step 1: Runtime Parameters */}
                {step === 1 && actionDetails?.locations && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Separator className="my-2" />
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-semibold mb-0.5">Runtime Parameters</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                        Configure dynamic parameters to fetch the schema
                      </p>
                      <FormParameters formSchema={actionDetails.locations} path="" />
                    </div>
                    {!!firstStepRequiredCompleted && (
                      <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button onClick={handleLoadDynamicSchema} className="w-full h-9 gap-1.5" size="sm">
                          <Iconify icon="mdi:download" width={16} />
                          Load Schema
                        </Button>
                      </m.div>
                    )}
                  </m.div>
                )}

                {/* Step 2: Tool Parameters */}
                {step === 2 && actionDetails?.locations && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Separator className="my-2" />
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-semibold mb-0.5">Tool Parameters</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                        Configure tool execution parameters
                      </p>
                      <FormParameters
                        formSchema={actionDetails.locations}
                        enableLexical
                        enableAIFill
                        path="parameters."
                      />
                    </div>
                  </m.div>
                )}

                {/* Advanced Settings */}
                {step === 2 && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Separator className="my-2" />
                    <Accordion type="single" collapsible className="border rounded-md">
                      <AccordionItem value="advanced" className="border-none">
                        <AccordionTrigger className="px-2.5 py-2 hover:no-underline hover:bg-muted/50 rounded-t-md text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1.5">
                            <Iconify icon="mdi:cog" width={12} className="text-muted-foreground" />
                            <span className="font-medium">Advanced Settings</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2.5 pb-2.5">
                          <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.05 }}
                            className="space-y-2 pt-1.5"
                          >
                            {/* Intent Setting */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <Label className="text-[10px] sm:text-xs font-medium">Intent</Label>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                                  Add intent argument explaining tool usage
                                </p>
                              </div>
                              <Switch
                                {...methods.register('intent_settings.intent')}
                                defaultChecked={values.intent_settings?.intent ?? false}
                              />
                            </div>

                            <Separator />

                            {/* UI Intent Setting */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <Label className="text-[10px] sm:text-xs font-medium">UI Intent</Label>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                                  Dynamic tool display with contextual parameters
                                </p>
                              </div>
                              <Switch
                                {...methods.register('intent_settings.ui_intent')}
                                defaultChecked={values.intent_settings?.ui_intent ?? false}
                              />
                            </div>

                            <Separator />

                            {/* Async Setting */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <Label className="text-[10px] sm:text-xs font-medium">Async Execution</Label>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                                  Wait for client activation before continuing
                                </p>
                              </div>
                              <Switch
                                {...methods.register('intent_settings.async')}
                                defaultChecked={values.intent_settings?.async ?? false}
                              />
                            </div>
                          </m.div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </m.div>
                )}

                {/* Execution Result */}
                {step === 2 && response.result && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div
                      className={cn(
                        'p-2.5 rounded-md border text-xs',
                        responseType === 'success' && 'bg-muted border-border',
                        responseType === 'error' && 'bg-destructive/5 border-destructive/20',
                      )}
                    >
                      <ExecutionResult actionExecution={response} />
                    </div>
                  </m.div>
                )}
              </m.div>
            )}
          </FormProvider>
        </div>
      </div>
      <GlobalVarsMenu mode="agent" />
    </>
  );
};

export default memo(ActionTypeCard);
