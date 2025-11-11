import { memo, useCallback, useMemo } from 'react';
import { uniqueId } from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import { cn } from '@lib/utils';
import { Button } from '@/components/ui/button';

import { checkNestedOfProperties } from './utils';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import Iconify from '../../iconify';

// Helper function to format option labels
const formatOptionLabel = (options, option) => {
  if (!options) {
    return null;
  }
  if (checkNestedOfProperties(option)) {
    return Object.keys(option).filter((k) => ['oneOf', 'allOf', 'anyOf'].includes(k))[0];
  }
  if (options.every((opt) => !!opt.title)) {
    return option.title;
  }
  if (options.every((opt) => !!opt.properties?.type)) {
    return option.properties.type;
  }
  return option.type ?? 'unknown option';
};

// Helper function to generate unique option keys
const getOptionKey = (option) => {
  const identifier = option.title?.toLowerCase() ?? 
    (option.oneOf || option.anyOf ? 'multiple-options' : option.type) ?? 
    'unknown option';
  return `of-option-${uniqueId()}-${identifier}`;
};

// Option renderer for Autocomplete
const renderOption = ({ key, ...props }, option) => (
  <li {...props} key={key}>
    <div className="flex flex-col gap-0.5 w-full">
      <span className="text-sm font-semibold text-foreground">
        {option.__label}
      </span>
      {option.description && (
        <Tooltip arrow followCursor title={option.description}>
          <span className="text-[10px] text-muted-foreground">
            {option.description}
          </span>
        </Tooltip>
      )}
    </div>
  </li>
);

const getOptionLabel = (o) => o?.__label;

const isOptionEqualToValue = (o, v) => {
  const { __label: labelO, ...restO } = o ?? {};
  const { __label: labelV, ...restV } = v ?? {};
  return checkObjectsEqual(restO, restV);
};

const DynamicFormFieldHeaderActions = ({
  hasOfProperties,
  ofValue,
  ofOption,
  setOfOption,
  isFreeText,
  showFreeTextOption,
  setIsFreeText,
}) => {
  const handleToggleFreeText = useCallback(
    () => setIsFreeText((prev) => !prev), 
    [setIsFreeText]
  );

  const handleOptionChange = useCallback(
    (e, value) => {
      const { __label, ...rest } = value ?? {};
      setOfOption(rest ?? null);
    },
    [setOfOption],
  );

  const memoizedOfValue = useMemo(
    () =>
      !hasOfProperties
        ? null
        : ofValue.map((option) => ({
          ...option,
          __label: formatOptionLabel(ofValue, option),
        })),
    [hasOfProperties, ofValue],
  );

  const memoizedOfOption = useMemo(
    () =>
      !hasOfProperties || !ofOption
        ? null
        : {
            ...ofOption,
            __label: formatOptionLabel(ofValue, ofOption),
          },
    [hasOfProperties, ofOption, ofValue],
  );

  return (
    <div className="flex items-center gap-2 w-full">
      {hasOfProperties && !isFreeText && (
        <Autocomplete
          options={memoizedOfValue}
          getOptionLabel={getOptionLabel}
          getOptionKey={getOptionKey}
          isOptionEqualToValue={isOptionEqualToValue}
          value={memoizedOfOption}
          onChange={handleOptionChange}
          fullWidth
          disableClearable
          className="min-w-[150px]"
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select option"
              variant="filled"
              size="small"
              fullWidth
            />
          )}
          slotProps={{
            popper: {
              className: 'min-w-[250px]',
              style: {
                zIndex: 10000,
              },
            },
          }}
          renderOption={renderOption}
        />
      )}
      {showFreeTextOption && (
        <Tooltip
          title={
            !isFreeText
              ? 'Free mode: select the value without any constraint.'
              : 'Bounded mode: select value within type constraints.'
          }
          arrow
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFreeText}
            className="h-8 w-8"
          >
            <Iconify
              icon={!isFreeText ? 'lucide:square-function' : 'ph:bounding-box-duotone'}
              width={16}
              className="transition-opacity opacity-60 hover:opacity-100"
            />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default memo(DynamicFormFieldHeaderActions);
