import { Stack, Autocomplete, Typography, TextField, Chip, Tooltip, Button } from '@mui/material';
import React, { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import FormParameter from './FormParameter';
import { FormPathProvider } from './FormPathContext';
import { setCurrentToolSchema } from '../../../redux/slices/flows';
import { dispatch } from '../../../redux/store';

const sortParameters = ([aKey, aSchema], [bKey, bSchema], allRequired = []) => {
  let aWeight = 0,
    bWeight = 0;
  if (!aSchema['x-extra']) {
    aWeight += 3;
  }
  if (!bSchema['x-extra']) {
    bWeight += 3;
  }
  if (allRequired.includes(aKey)) {
    aWeight += 2;
  }
  if (allRequired.includes(bKey)) {
    bWeight += 2;
  }
  if (aKey < bKey) {
    aWeight += 1;
  }
  if (bKey < aKey) {
    bWeight += 1;
  }
  return bWeight - aWeight;
};

const getMappingKeys = (relationships) => {
  return relationships
    ?.map((relationship) => {
      const keys = [];
      for (const key in relationship.mapping) {
        if (Object.prototype.hasOwnProperty.call(relationship.mapping, key)) {
          keys.push(Object.keys(relationship.mapping[key]));
        }
      }
      return keys.flat();
    })
    ?.flat();
};

const findRelationshipForResourceField = (fieldKey, relationships) => {
  return relationships?.find((relationship) => {
    for (const key in relationship.mapping) {
      if (Object.prototype.hasOwnProperty.call(relationship.mapping, key)) {
        if (Object.keys(relationship.mapping[key]).includes(fieldKey)) {
          return true;
        }
      }
    }
    return false;
  });
};

const renderOption = ({ key, ...props }, option) => {
  return (
    <Stack
      key={key}
      width="100%"
      {...props}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="left"
        spacing={1}
        width="100%"
      >
        <Typography
          variant="caption"
          // sx={{
          //   fontWeight: 'bold'
          // }}
        >
          {option.label || option.key}
        </Typography>
        <Chip
          label={option.type}
          size="small"
          sx={{ height: 15 }}
        />
        {!!option.extra && (
          <Chip
            label="system"
            size="small"
            sx={{ height: 15 }}
            color="success"
          />
        )}
      </Stack>
      {!!option.description?.length && (
        <Stack
          width="100%"
          direction="row"
          alignItems="center"
          justifyContent="left"
        >
          <Tooltip
            arrow
            followCursor
            enterDelay={1500}
            enterNextDelay={1500}
            title={option.description}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{
                opacity: 0.7,
                fontSize: '0.7rem',
              }}
            >
              {option.description}
            </Typography>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
};

const renderInput = (total, totalSystem, onAddAll) => (params) => {
  const totalNormalHidden = total - totalSystem;
  return (
    <TextField
      {...params}
      placeholder={
        totalNormalHidden
          ? `Add parameters (${totalNormalHidden} available${totalSystem ? ', plus system' : ''})`
          : `Add system parameters (${total} available)`
      }
      size="small"
      hiddenLabel
      sx={{
        mt: 1.5,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : theme.palette.primary.main + '08', // Using primary color with 3% opacity
        borderRadius: 2,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : theme.palette.primary.main + '12', // Using primary color with 7% opacity
          transform: 'translateY(-1px)',
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
        },
        '.MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderStyle: 'dashed',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderStyle: 'dashed',
            borderColor: 'divider',
          },
        },
        '.MuiInputBase-input': {
          '&::placeholder': {
            fontStyle: 'italic',
            fontSize: '0.85rem',
            opacity: 0.75,
            letterSpacing: '0.01em',
          },
        },
      }}
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <>
            {!!totalNormalHidden && (
              <Tooltip
                arrow
                enterDelay={100}
                enterNextDelay={200}
                title="Add all parameters"
              >
                <Button
                  size="small"
                  variant="soft"
                  color="primary"
                  sx={{
                    minWidth: 0,
                    mr: 1,
                    px: 1,
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                  onClick={onAddAll}
                >
                  <Typography variant="caption">+{total - totalSystem}</Typography>
                </Button>
              </Tooltip>
            )}
            {params.InputProps.startAdornment}
          </>
        ),
      }}
    />
  );
};

const hasOf = (schema) => !!(schema.oneOf || schema.allOf || schema.anyOf);

const FormParameters = ({
  formSchema,
  relationships,
  // title = 'Parameters',
  path = '',
  enableLexical = true,
  enableAIFill = false,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [additionalVisibleParams, setAdditionalVisibleParams] = useState([]);
  const parameterValues = useWatch({ name: path });
  const mappings = getMappingKeys(relationships);

  useEffect(() => {
    dispatch(setCurrentToolSchema(formSchema));
    return () => dispatch(setCurrentToolSchema(null));
  }, [formSchema]);

  const shouldRenderParameter = useCallback(
    (key, schema) => {
      const isRequired = (formSchema?.required ?? []).includes(key);
      const safeParameterValues = parameterValues ?? {};
      const value =
        safeParameterValues[key] ??
        (!!enableAIFill ? safeParameterValues[`${key}_option`] : undefined);
      const hasValue = !['', undefined, null].includes(value);
      const isVisible =
        isRequired || hasValue || hasOf(schema) || additionalVisibleParams.includes(key);

      // Handle dependencies
      if (schema.dependsOn) {
        const parentValue = safeParameterValues[schema.dependsOn];
        if (!parentValue) {
          return false;
        }
      }

      return isVisible;
    },
    [formSchema?.required, parameterValues, enableAIFill, additionalVisibleParams],
  );

  const renderToolParameters = useMemo(
    () =>
      formSchema?.properties &&
      Object.entries(formSchema.properties)
        .filter(([key, schema]) => shouldRenderParameter(key, schema))
        .sort((a, b) => sortParameters(a, b, formSchema.required))
        .map(([key, schema]) => {
          const required = (formSchema.required ?? []).includes(key);
          const fieldKey = schema['x-ignore-key'] ? path : `${path}${key}`;
          const isInMappings = mappings?.includes(key);
          const relationship = findRelationshipForResourceField(key, relationships);
          const onRemove =
            !required && additionalVisibleParams.includes(key)
              ? () => {
                  setAdditionalVisibleParams((prev) => prev.filter((paramKey) => paramKey !== key));
                }
              : null;

          return (
            <FormParameter
              key={fieldKey}
              fieldKey={fieldKey}
              schema={schema}
              required={required}
              isInMappings={isInMappings}
              relationship={relationship}
              enableLexical={enableLexical}
              enableAIFill={enableAIFill}
              onRemove={onRemove}
            />
          );
        }),
    [
      formSchema,
      shouldRenderParameter,
      mappings,
      path,
      relationships,
      enableAIFill,
      enableLexical,
      additionalVisibleParams,
    ],
  );

  const hiddenParameters = useMemo(() => {
    return Object.entries(formSchema.properties ?? {})
      .filter(([key, schema]) => !shouldRenderParameter(key, schema) && !schema['x-ignore-ui'])
      .sort(sortParameters)
      .map(([key, schema]) => ({
        key,
        label: schema.title,
        description: schema.description,
        type: schema.type,
        extra: !!schema['x-extra'],
      }));
  }, [formSchema, shouldRenderParameter]);

  const systemParameters = useMemo(
    () => hiddenParameters.filter((p) => !!p.extra),
    [hiddenParameters],
  );

  const onAddAll = useCallback(
    () =>
      setAdditionalVisibleParams((prev) => [
        ...prev,
        ...hiddenParameters.filter((p) => !p.extra).map((p) => p.key),
      ]),
    [hiddenParameters],
  );

  const memoizedRenderInput = useMemo(
    () => renderInput(hiddenParameters?.length, systemParameters?.length, onAddAll),
    [hiddenParameters?.length, onAddAll, systemParameters?.length],
  );

  const onAddParam = useCallback(
    (event, newValue) => {
      if (newValue && !additionalVisibleParams.includes(newValue.key)) {
        setAdditionalVisibleParams((prev) => [...prev, newValue.key]);
        setSearchValue('');
      }
    },
    [additionalVisibleParams],
  );

  const onInputChange = useCallback((event, newValue) => setSearchValue(newValue), []);

  if (!formSchema?.properties || !Object.keys(formSchema.properties).length) {
    return null;
  }

  return (
    <FormPathProvider path={path}>
      {renderToolParameters}
      {hiddenParameters.length > 0 && (
        <Autocomplete
          size="small"
          key={hiddenParameters?.length}
          inputValue={searchValue}
          options={hiddenParameters}
          renderOption={renderOption}
          getOptionLabel={(option) => option.key}
          getOptionKey={(option) => option.key}
          onChange={onAddParam}
          onInputChange={onInputChange}
          renderInput={memoizedRenderInput}
        />
      )}
    </FormPathProvider>
  );
};

export default memo(FormParameters);
