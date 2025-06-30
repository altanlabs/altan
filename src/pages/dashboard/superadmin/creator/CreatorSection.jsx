import { Grid, Paper, Typography, TextField, Divider, Button, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo, useState, useCallback } from 'react';

import AceWrapper from '@components/json/AceWrapper.jsx';

import ActionCreator from './ActionCreator';
import ResourceCreator from './ResourceCreator';
import Iconify from '../../../../components/iconify/Iconify';
import { createEntry } from '../../../../redux/slices/superadmin';
import { dispatch } from '../../../../redux/store';
import { useExternalData } from '../external/provider/SAExternalDataProvider';
import SAExternalDrawer from '../external/SAExternalDrawer';

const CreatorSection = () => {
  const [openAPISchema, setOpenAPISchema] = useState('{}');
  const [actions, setActions] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageR, setCurrentPageR] = useState(0);
  const [baseUrl, setBaseUrl] = useState('');
  const [excludedParamsList, setExcludedParameters] = useState([]);
  const { selectedConnectionTypeAtIndex } = useExternalData();
  const { enqueueSnackbar } = useSnackbar();

  const parseActions = useCallback(
    (paths) => {
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
              description: `The response is file in the format ${contentType}`,
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

      const extractRequestBody = (operation) => {
        if (operation.requestBody && operation.requestBody.content) {
          return extractSchema(operation.requestBody.content);
        }
        return {
          type: 'object',
          properties: collectParameters(operation.parameters || [], 'formData'),
        };
      };

      Object.keys(paths).forEach((path) => {
        const methods = paths[path];
        Object.keys(methods).forEach((method) => {
          if (validMethods.includes(method.toLowerCase())) {
            const operation = methods[method];
            actions.push({
              name:
                operation.summary || formatTitle(operation?.operationId || '') || path || 'Action',
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
    },
    [excludedParamsList],
  );

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

  const parseSchema = useCallback(
    (schema) => {
      const parsedActions = parseActions(schema.paths || {});
      const parsedResources = parseResources(
        schema.components?.schemas || schema.definitions || {},
      );
      setActions(parsedActions);
      setResources(parsedResources);
    },
    [parseActions],
  );

  const handleSchemaChange = useCallback(
    (newSchema) => {
      setOpenAPISchema(newSchema);
      try {
        const parsedSchema = JSON.parse(newSchema);
        parseSchema(parsedSchema);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    },
    [parseSchema],
  );

  const handleExcludedParams = useCallback(
    (a) => {
      setExcludedParameters(a);
      if (!!openAPISchema) {
        try {
          const parsedSchema = JSON.parse(openAPISchema);
          parseSchema(parsedSchema);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    },
    [openAPISchema, parseSchema],
  );

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
    [actions, currentPage, setActions],
  );

  const handleResourceChange = useCallback(
    (updatedAction) => {
      const updatedActions = resources.map((action, index) =>
        index === currentPageR ? updatedAction : action,
      );
      setActions(updatedActions);
    },
    [resources, currentPageR],
  );

  const handleUploadAction = async () => {
    const action = actions[currentPage];
    action['url'] = baseUrl + actions[currentPage]['url'];
    action['connection_type_id'] = selectedConnectionTypeAtIndex()['id'];
    console.log('Saving action:', action);
    if (!action) return;
    try {
      dispatch(createEntry('ActionType', action)).then((res) => {
        console.log('Entry created:', res);
        enqueueSnackbar('Resource created successfully.', { variant: 'success' });
      });
    } catch {
      enqueueSnackbar('There was an error creating the entry.', { variant: 'error' });
    }
  };

  const handleUploadResource = async () => {
    const resource = resources[currentPageR];
    resource['connection_type_id'] = selectedConnectionTypeAtIndex()['id'];
    console.log('Saving resource:', resource);
    if (!resource) return;
    try {
      dispatch(createEntry('ResourceType', resource)).then((res) => {
        console.log('Entry created:', res);
        enqueueSnackbar('Resource created successfully.', { variant: 'success' });
      });
    } catch {
      enqueueSnackbar('There was an error creating the entry.', { variant: 'error' });
    }
  };

  const handleUploadAllActions = async () => {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      action['url'] = baseUrl + action['url'];
      action['connection_type_id'] = selectedConnectionTypeAtIndex()['id'];
      try {
        const res = await dispatch(createEntry('ActionType', action));
        console.log('Entry created:', res);
        enqueueSnackbar('Action created successfully.', { variant: 'success' });
      } catch {
        enqueueSnackbar('There was an error creating the action.', { variant: 'error' });
      }
    }
  };

  const handleUploadAllResources = async () => {
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      resource['connection_type_id'] = selectedConnectionTypeAtIndex()['id'];
      try {
        const res = await dispatch(createEntry('ResourceType', resource));
        console.log('Entry created:', res);
        enqueueSnackbar('Resource created successfully.', { variant: 'success' });
      } catch {
        enqueueSnackbar('There was an error creating the resource.', { variant: 'error' });
      }
    }
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{ height: '100%', position: 'relative' }}
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
          <div style={{ paddingBottom: 10 }}>
            <SAExternalDrawer />
          </div>
          <TextField
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            fullWidth
            size="small"
            name="baseUrl"
            label="Base url"
            sx={{ pb: 1 }}
          />

          <Typography>OpenApi Schema</Typography>

          <AceWrapper
            value={openAPISchema}
            onChange={handleSchemaChange}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
            useWorker={true}
            style={{
              maxHeight: '70vh',
              width: '100%',
            }}
          />
          <Typography>Excluded params</Typography>
          <AceWrapper
            value={excludedParamsList}
            onChange={handleExcludedParams}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
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
          sx={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ flex: 1 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              spacing={2}
            >
              <Typography variant="subtitle1">
                Actions ({currentPage}/{actions.length})
              </Typography>
              <Button
                variant="soft"
                onClick={handleUploadAllActions}
              >
                Upload all
              </Button>
            </Stack>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              spacing={2}
            >
              <Button
                onClick={handlePrevious}
                disabled={actions.length <= 1}
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
                disabled={actions.length <= 1}
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
              />
            ) : (
              <Typography>No actions available</Typography>
            )}
          </div>
          <Divider sx={{ py: 2 }} />
          <div style={{ flex: 1 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2 }}
              spacing={2}
            >
              <Typography variant="subtitle1">Resources ({resources.length})</Typography>
              <Button
                variant="soft"
                onClick={handleUploadAllResources}
              >
                Upload all
              </Button>
            </Stack>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              spacing={2}
            >
              <Button
                onClick={handlePreviousR}
                disabled={resources.length <= 1}
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
                disabled={resources.length <= 1}
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
              />
            ) : (
              <Typography>No actions available</Typography>
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default memo(CreatorSection);
