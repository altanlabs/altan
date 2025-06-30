import {
  IconButton,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  Popover,
} from '@mui/material';
import React, { memo, useCallback, useMemo, useState } from 'react';

import Iconify from '@components/iconify';
import AceWrapper from '@components/json/AceWrapper.jsx';

import { useExternalSettings } from '../../external/provider/SAExternalSettingsProvider';

function categorizeActionResults(actionResult, actionResourceMappings) {
  const resources = [];
  const standardAttributes = {};

  // Function to recursively search and categorize elements based on the mapping
  function searchAndCategorize(source, mapping, resource_id, path = '') {
    Object.keys(mapping).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;
      const value = mapping[key];
      // If it's marked as a resource, add it to the resources array
      if (value.resource && value.is_collection) {
        const resourcePath = fullPath
          .replace(/\[\$\]/g, '')
          .split('.')
          .slice(1); // Remove '[$]' and split
        let resourceData = source;
        for (const part of resourcePath) {
          resourceData = resourceData[part];
        }
        resources.push({
          resource_id,
          path: fullPath,
          data: resourceData,
          is_collection: value.is_collection,
        });
      } else if (typeof value === 'object') {
        // If it's an object, dive deeper
        searchAndCategorize(source[key], value, resource_id, fullPath);
      } else {
        // Otherwise, treat it as a standard attribute
        standardAttributes[fullPath] = source[key];
      }
    });
  }

  // Iterate over each action resource mapping and apply the categorization process
  actionResourceMappings.forEach((mapping) => {
    searchAndCategorize(actionResult, mapping.mapping, mapping.resource_id);
  });

  return { resources, standardAttributes };
}
const ExecutionResult = () => {
  const {
    selectedAction: action,
    actionExecution,
    onResetActionExecution: onClose,
    setTableData: onOpenTable,
    setSelectedResource: onSelectResource,
  } = useExternalSettings();
  const [resourcePopover, setResourcePopover] = useState({
    anchorEl: null,
    data: null,
  });
  const showResource = useCallback(
    (e, data) => setResourcePopover({ anchorEl: e.currentTarget, data }),
    [setResourcePopover],
  );
  const clearResource = useCallback(
    () => setResourcePopover({ anchorEl: null, data: null }),
    [setResourcePopover],
  );
  const output = action.output?.properties;
  const parsedResult = useMemo(() => {
    if (!output || !action.output_resources?.length) {
      return actionExecution.result;
    }
    return categorizeActionResults(actionExecution.result, action.output_resources);
  }, [output, actionExecution.result, action.output_resources]);

  // console.log("actionExecution", actionExecution);
  // console.log("output", output);
  // console.log("parsedResult", parsedResult);
  // console.log("action.output_resources", action.output_resources);

  return (
    <Card
      sx={{
        width: '100%',
        maxHeight: '500px',
        overflowY: 'auto',
      }}
    >
      <CardHeader
        title={
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
          >
            <Typography variant="h6">{`Result Action: ${action.name}`}</Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={onClose}
            >
              <Iconify
                icon="mdi:close-circle-outline"
                // color="red"
              />
            </IconButton>
          </Stack>
        }
        // subheader="Response from action"
      />
      <CardContent
        className=" "
        sx={{
          padding: 2,
        }}
      >
        <Popover
          open={Boolean(resourcePopover.anchorEl)}
          anchorEl={resourcePopover.anchorEl}
          onClose={clearResource}
        >
          <AceWrapper
            name="show-resource"
            value={resourcePopover.data}
            readOnly
            style={{ width: '100%', minHeight: '100px', maxHeight: '250px', borderRadius: '8px' }}
          />
        </Popover>
        {!!action.output_resources?.length && !!output ? (
          <Stack spacing={0.5}>
            {!!parsedResult.standardAttributes &&
              Object.entries(parsedResult.standardAttributes).map(([key, attr]) => (
                <Typography
                  key={`standard-attribute-${key}`}
                  variant="caption"
                >
                  {key}: {attr}
                </Typography>
              ))}
            {!!parsedResult.resources &&
              parsedResult.resources.map((mapped_resource, i) => (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  key={`resource-${i}`}
                >
                  <Typography variant="caption">
                    {mapped_resource.path}
                    {mapped_resource.data?.length ? ` (${mapped_resource.data.length})` : ''}
                  </Typography>
                  {!mapped_resource.is_collection && (
                    <Button
                      size="small"
                      color="inherit"
                      variant="soft"
                      onClick={(e) => showResource(e, mapped_resource.data)}
                    >
                      Show Resource
                    </Button>
                  )}
                  {!mapped_resource.is_collection ? (
                    <Button
                      size="small"
                      color="inherit"
                      variant="soft"
                      onClick={() => onSelectResource(mapped_resource)}
                    >
                      Select Resource
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="inherit"
                      variant="soft"
                      onClick={() =>
                        onOpenTable({
                          ...mapped_resource,
                          connection_type_id: action.connection_type_id,
                        })}
                    >
                      Open in table
                    </Button>
                  )}
                </Stack>
              ))}
          </Stack>
        ) : (
          <AceWrapper
            name="action-result"
            value={parsedResult}
            readOnly
            style={{ width: '100%', minHeight: '100px', maxHeight: '250px', borderRadius: '8px' }}
          />
        )}
        {/* <AceWrapper
          name="action-output-schema"
          value={action.output}
          readOnly
          style={{ width: '100%', minHeight: '100px', maxHeight: '250px', borderRadius: '8px' }}
        /> */}
      </CardContent>
    </Card>
  );
};

export default memo(ExecutionResult);
