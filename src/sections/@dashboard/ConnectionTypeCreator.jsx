import { LoadingButton } from '@mui/lab';
import { Grid, Paper, Typography, TextField, Divider, Stack, Box, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';

import ActionCreator from './ActionCreator.jsx';
import ResourceCreator from './ResourceCreator.jsx';
import ConnectionTypesAutocomplete from '../../components/ConnectionTypesAutocomplete';
import Iconify from '../../components/iconify/Iconify';
import AceWrapper from '../../components/json/AceWrapper';
import { createActionType, createResourceType } from '../../redux/slices/general/index.ts';
import { dispatch } from '../../redux/store.ts';

const parseResources = (schemas) => {
  const adjustRef = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    Object.keys(obj).forEach((key) => {
      if (key === '$ref' && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/#\/components\/schemas\//, '');
        obj[key] = obj[key].replace(/#\/definitions\//, '');
      } else if (typeof obj[key] === 'object') {
        adjustRef(obj[key]);
      }
    });
  };

  return Object.keys(schemas).map((key) => {
    const schema = schemas[key];
    adjustRef(schema);
    return {
      name: key,
      details: schema,
    };
  });
};

const parseActions = (paths, excludedParamsList) => {
  const actions = [];
  const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

  const extractRef = (schema) => {
    if (!schema || typeof schema !== 'object') return schema;
    if (schema.$ref) {
      return { $ref: schema.$ref.split('/').pop() };
    }
    if (Array.isArray(schema)) {
      return schema.map((item) => extractRef(item));
    }
    Object.keys(schema).forEach((key) => {
      schema[key] = extractRef(schema[key]);
    });
    return schema;
  };

  const formatTitle = (operationId) =>
    operationId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const collectParameters = (parameters, inType) => {
    return parameters
      ?.filter((param) => param.in === inType && !excludedParamsList.includes(param?.name))
      .reduce((acc, param) => {
        const extractedSchema = param.schema
          ? extractRef(param.schema)
          : { type: param.type, description: param.description };
        acc[param?.name] = extractedSchema;
        return acc;
      }, {});
  };

  const extractRequestBody = (operation) => {
    if (operation.requestBody && operation.requestBody.content) {
      return extractSchema(operation.requestBody.content);
    }
    return {
      type: 'object',
      properties: collectParameters(operation.parameters || [], 'formData'),
    };
  };

  const extractSchema = (content) => {
    if (!content || typeof content !== 'object') {
      return null;
    }

    for (const contentType of Object.keys(content)) {
      if (content[contentType] && content[contentType].schema) {
        return extractRef(content[contentType].schema);
      } else if (content[contentType] && !content[contentType].schema) {
        return {
          type: contentType,
          description: `The response is a file in the format ${contentType}`,
        };
      }
    }

    return null;
  };

  const extractSchemaFromResponses = (responses) => {
    if (responses && responses['200'] && responses['200'].content) {
      return extractSchema(responses['200'].content);
    }

    return {};
  };

  Object.keys(paths).forEach((path) => {
    const methods = paths[path];
    Object.keys(methods).forEach((method) => {
      if (validMethods.includes(method.toLowerCase())) {
        const operation = methods[method];
        actions.push({
          name: operation.summary || formatTitle(operation?.operationId || '') || path || 'Action',
          description: operation.description || 'No description',
          url: path,
          method: method.toUpperCase(),
          headers: {
            type: 'object',
            properties: collectParameters(operation.parameters || [], 'header'),
          },
          query_params: {
            type: 'object',
            properties: collectParameters(operation.parameters || [], 'query'),
          },
          path_params: {
            type: 'object',
            properties: collectParameters(operation.parameters || [], 'path'),
          },
          body: extractRequestBody(operation),
          output: extractSchemaFromResponses(operation.responses),
          meta_data: {
            docs: operation.externalDocs || null,
          },
        });
      }
    });
  });
  return actions;
};

const ConnectionTypeCreator = () => {
  const [actions, setActions] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageR, setCurrentPageR] = useState(0);
  const [baseUrl, setBaseUrl] = useState('');
  const [connectionTypeId, setConnectionTypeId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const [isUploadingAction, setIsUploadingAction] = useState(false);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [isUploadingAllActions, setIsUploadingAllActions] = useState(false);
  const [isUploadingAllResources, setIsUploadingAllResources] = useState(false);

  const [openAPISchema, setOpenAPISchema] = useState('{}');
  const [excludedParamsList, setExcludedParameters] = useState([]);

  // Memoize the parsed schema to avoid redundant parsing
  const parsedSchema = useMemo(() => {
    try {
      return JSON.parse(openAPISchema);
    } catch (error) {
      console.error('Error parsing OpenAPI schema JSON:', error);
      return {};
    }
  }, [openAPISchema]);

  // Memoize the parsed excluded parameters
  const parsedExcludedParams = useMemo(() => {
    try {
      return Array.isArray(excludedParamsList)
        ? excludedParamsList
        : JSON.parse(excludedParamsList);
    } catch (error) {
      console.error('Error parsing excluded parameters JSON:', error);
      return [];
    }
  }, [excludedParamsList]);

  // Function to parse and update actions/resources
  const parseSchema = useCallback(() => {
    const parsedActions = parseActions(parsedSchema.paths || {}, parsedExcludedParams);
    const parsedResources = parseResources(
      parsedSchema.components?.schemas || parsedSchema.definitions || {},
    );

    setActions(parsedActions);
    setResources(parsedResources);
  }, [parsedSchema, parsedExcludedParams]);

  // Update parsed schema when excluded parameters change
  useEffect(() => {
    if (parsedSchema) {
      parseSchema();
    }
  }, [parsedSchema, parseSchema]);

  // Handle schema updates
  const handleSchemaChange = useCallback((newSchema) => {
    setOpenAPISchema(
      typeof newSchema === 'string' ? newSchema : JSON.stringify(newSchema, null, 2),
    );
  }, []);

  // Handle excluded parameters updates
  const handleExcludedParams = useCallback((newValue) => {
    setExcludedParameters(
      typeof newValue === 'string' ? newValue : JSON.stringify(newValue, null, 2),
    );
  }, []);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % actions.length);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev - 1 + actions.length) % actions.length);
  };

  const handleNextR = () => {
    setCurrentPageR((prev) => (prev + 1) % resources.length);
  };

  const handlePreviousR = () => {
    setCurrentPageR((prev) => (prev - 1 + resources.length) % resources.length);
  };

  const handleActionChange = useCallback(
    (updatedAction) => {
      const updatedActions = actions.map((action, index) =>
        index === currentPage ? updatedAction : action,
      );
      setActions(updatedActions);
    },
    [actions, currentPage],
  );

  const handleResourceChange = useCallback(
    (updatedResource) => {
      const updatedResources = resources.map((resource, index) =>
        index === currentPageR ? updatedResource : resource,
      );
      setResources(updatedResources);
    },
    [resources, currentPageR],
  );

  const handleConnectionTypeChange = (event, newValue) => {
    setConnectionTypeId(newValue?.id || null);
  };

  const handleUploadAction = async () => {
    const action = actions[currentPage];
    if (!action || !connectionTypeId || !baseUrl) return;
    setIsUploadingAction(true);
    const updatedAction = {
      ...action,
      url: baseUrl + action.url,
      connection_type_id: connectionTypeId,
    };
    try {
      await dispatch(createActionType(updatedAction));
      enqueueSnackbar('Action created successfully.', { variant: 'success' });
      setActions((prevActions) => prevActions.filter((_, index) => index !== currentPage));
      setCurrentPage((prev) => (prev >= actions.length - 1 ? Math.max(prev - 1, 0) : prev));
    } catch {
      enqueueSnackbar('There was an error creating the action.', {
        variant: 'error',
      });
    } finally {
      setIsUploadingAction(false);
    }
  };

  const handleUploadResource = async () => {
    const resource = resources[currentPageR];
    if (!resource || !connectionTypeId) return;
    setIsUploadingResource(true);
    const updatedResource = {
      ...resource,
      connection_type_id: connectionTypeId,
    };
    try {
      await dispatch(createResourceType(updatedResource));
      enqueueSnackbar('Resource created successfully.', { variant: 'success' });
      setResources((prevResources) => prevResources.filter((_, index) => index !== currentPageR));
      setCurrentPageR((prev) => (prev >= resources.length - 1 ? Math.max(prev - 1, 0) : prev));
    } catch {
      enqueueSnackbar('There was an error creating the resource.', {
        variant: 'error',
      });
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleUploadAllActions = async () => {
    if (!actions.length || !connectionTypeId || !baseUrl) return;
    setIsUploadingAllActions(true);
    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const updatedAction = {
          ...action,
          url: baseUrl + action.url,
          connection_type_id: connectionTypeId,
        };
        await dispatch(createActionType(updatedAction));
        enqueueSnackbar(`Action ${i + 1} created successfully.`, {
          variant: 'success',
        });
      }
      setActions([]);
      setCurrentPage(0);
    } catch {
      enqueueSnackbar('There was an error creating the actions.', {
        variant: 'error',
      });
    } finally {
      setIsUploadingAllActions(false);
    }
  };

  const handleUploadAllResources = async () => {
    if (!resources.length || !connectionTypeId) return;
    setIsUploadingAllResources(true);
    try {
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const updatedResource = {
          ...resource,
          connection_type_id: connectionTypeId,
        };
        await dispatch(createResourceType(updatedResource));
        enqueueSnackbar(`Resource ${i + 1} created successfully.`, {
          variant: 'success',
        });
      }
      setResources([]);
      setCurrentPageR(0);
    } catch {
      enqueueSnackbar('There was an error creating the resources.', {
        variant: 'error',
      });
    } finally {
      setIsUploadingAllResources(false);
    }
  };

  const MAX_SCHEMA_LENGTH = 1000; // Adjust this value based on testing

  const truncateSchema = (schema) => {
    if (schema.length > MAX_SCHEMA_LENGTH) {
      return schema.substring(0, MAX_SCHEMA_LENGTH) + '...[truncated]';
    }
    return schema;
  };

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{ position: 'sticky', top: 0 }}
        >
          <Paper
            elevation={3}
            sx={{ height: '100%', padding: '16px', width: '100%' }}
          >
            <ConnectionTypesAutocomplete
              value={connectionTypeId}
              onChange={handleConnectionTypeChange}
              internal={true}
              helperText={!connectionTypeId ? 'Please select a connection type' : ''}
              error={!connectionTypeId}
            />
            <TextField
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              fullWidth
              size="small"
              name="baseUrl"
              label="Base URL"
              sx={{ my: 1 }}
              helperText={!baseUrl ? 'Base URL is required' : ''}
              error={!baseUrl}
            />

            <Typography>OpenAPI Schema</Typography>
            <Box sx={{ flex: 1, minHeight: '40vh' }}>
              <AceWrapper
                value={truncateSchema(openAPISchema)}
                onChange={handleSchemaChange}
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
            </Box>
            <Typography>Excluded Parameters</Typography>
            <AceWrapper
              value={JSON.stringify(excludedParamsList, null, 2)}
              onChange={handleExcludedParams}
              style={{
                maxHeight: '10vh',
                width: '100%',
              }}
            />
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ flex: 1 }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                spacing={2}
              >
                <Typography variant="subtitle1">
                  Actions ({actions.length > 0 ? currentPage + 1 : 0}/{actions.length})
                </Typography>
                <LoadingButton
                  variant="soft"
                  onClick={handleUploadAllActions}
                  loading={isUploadingAllActions}
                  disabled={
                    !baseUrl || !connectionTypeId || isUploadingAllActions || actions.length === 0
                  }
                >
                  Upload all
                </LoadingButton>
              </Stack>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                spacing={2}
              >
                <Button
                  onClick={handlePrevious}
                  disabled={actions.length <= 1 || isUploadingAction}
                  startIcon={
                    <Iconify
                      icon="material-symbols-light:history.push-next"
                      rotate={2}
                    />
                  }
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={actions.length <= 1 || isUploadingAction}
                  endIcon={<Iconify icon="material-symbols-light:history.push-next" />}
                >
                  Next
                </Button>
              </Stack>

              {actions.length > 0 ? (
                <ActionCreator
                  action={actions[currentPage]}
                  onActionChange={handleActionChange}
                  onSave={handleUploadAction}
                  loading={isUploadingAction}
                  disabled={!baseUrl || !connectionTypeId || isUploadingAction}
                />
              ) : (
                <Typography>No actions available</Typography>
              )}
            </div>
            <Divider sx={{ py: 2 }} />
            <div style={{ flex: 1 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 2,
                }}
                spacing={2}
              >
                <Typography variant="subtitle1">
                  Resources ({resources.length > 0 ? currentPageR + 1 : 0}/{resources.length})
                </Typography>
                <LoadingButton
                  variant="soft"
                  onClick={handleUploadAllResources}
                  loading={isUploadingAllResources}
                  disabled={
                    !baseUrl ||
                    !connectionTypeId ||
                    isUploadingAllResources ||
                    resources.length === 0
                  }
                >
                  Upload all
                </LoadingButton>
              </Stack>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                spacing={2}
              >
                <Button
                  onClick={handlePreviousR}
                  disabled={resources.length <= 1 || isUploadingResource}
                  startIcon={
                    <Iconify
                      icon="material-symbols-light:history.push-next"
                      rotate={2}
                    />
                  }
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextR}
                  disabled={resources.length <= 1 || isUploadingResource}
                  endIcon={<Iconify icon="material-symbols-light:history.push-next" />}
                >
                  Next
                </Button>
              </Stack>
              {resources.length > 0 ? (
                <ResourceCreator
                  resource={resources[currentPageR]}
                  onActionChange={handleResourceChange}
                  onSave={handleUploadResource}
                  loading={isUploadingResource}
                  disabled={!connectionTypeId || isUploadingResource}
                />
              ) : (
                <Typography>No resources available</Typography>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(ConnectionTypeCreator);
