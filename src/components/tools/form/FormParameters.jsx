import { m } from 'framer-motion';
import React, { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { cn } from '@lib/utils';

import { setCurrentToolSchema } from '../../../redux/slices/flows';
import { dispatch } from '../../../redux/store';
import FormParameter from './FormParameter';
import { FormPathProvider } from './FormPathContext';

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

/* ────────────────────────────────────────────────────────────────────────── */
/* Helper: Parameter Option Component */
/* ────────────────────────────────────────────────────────────────────────── */

const ParameterOption = memo(({ option }) => (
  <div className="flex flex-col gap-0.5 w-full">
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium">{option.label || option.key}</span>
      <Badge variant="secondary" className="h-3.5 text-[9px] px-1">
        {option.type}
      </Badge>
      {option.extra && (
        <Badge variant="default" className="h-3.5 text-[9px] px-1 bg-muted-foreground/20">
          system
        </Badge>
      )}
    </div>
    {option.description && (
      <p className="text-[10px] text-muted-foreground truncate" title={option.description}>
        {option.description}
      </p>
    )}
  </div>
));

const hasOf = (schema) => !!(schema.oneOf || schema.allOf || schema.anyOf);

const FormParameters = ({
  formSchema,
  relationships,
  path = '',
  enableLexical = true,
  enableAIFill = false,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [additionalVisibleParams, setAdditionalVisibleParams] = useState([]);
  const [open, setOpen] = useState(false);
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

  const handleAddAll = useCallback(() => {
    setAdditionalVisibleParams((prev) => [
      ...prev,
      ...hiddenParameters.filter((p) => !p.extra).map((p) => p.key),
    ]);
    setOpen(false);
  }, [hiddenParameters]);

  const handleAddParam = useCallback(
    (paramKey) => {
      if (paramKey && !additionalVisibleParams.includes(paramKey)) {
        setAdditionalVisibleParams((prev) => [...prev, paramKey]);
        setSearchValue('');
        setOpen(false);
      }
    },
    [additionalVisibleParams],
  );

  if (!formSchema?.properties || !Object.keys(formSchema.properties).length) {
    return null;
  }

  const totalNormalHidden = hiddenParameters.length - systemParameters.length;

  return (
    <TooltipProvider delayDuration={300}>
      <FormPathProvider path={path}>
        <div className="space-y-2">
          {renderToolParameters}
          {hiddenParameters.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-1"
            >
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      'w-full h-9 justify-start text-xs gap-2 border-dashed',
                      'hover:bg-muted/50 hover:border-foreground/20',
                    )}
                  >
                  {totalNormalHidden > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Badge
                            variant="secondary"
                            className="h-4 text-[9px] px-1.5 cursor-pointer hover:bg-secondary/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddAll();
                            }}
                          >
                            +{totalNormalHidden}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Add all {totalNormalHidden} parameters</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <span className="text-muted-foreground italic flex-1 text-left">
                    {totalNormalHidden
                      ? `Add parameters (${totalNormalHidden} available${systemParameters.length ? ', plus system' : ''})`
                      : `Add system parameters (${hiddenParameters.length} available)`}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search parameters..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                    className="h-8 text-xs"
                  />
                  <CommandList>
                    <CommandEmpty className="py-3 text-xs text-center text-muted-foreground">
                      No parameters found.
                    </CommandEmpty>
                    <CommandGroup>
                      {hiddenParameters.map((param) => (
                        <CommandItem
                          key={param.key}
                          onSelect={() => handleAddParam(param.key)}
                          className="cursor-pointer"
                        >
                          <ParameterOption option={param} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </m.div>
        )}
        </div>
      </FormPathProvider>
    </TooltipProvider>
  );
};

export default memo(FormParameters);
