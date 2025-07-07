import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { uniqueId } from 'lodash';
import { memo, useCallback, useMemo } from 'react';

import { checkNestedOfProperties } from './utils';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import Iconify from '../../iconify';

const getLabel = (options, option) => {
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

const getOptionKey = (o) =>
  `of-option-${uniqueId()}-${o.title?.toLowerCase() ?? (o.oneOf || o.anyOf ? 'multiple-options' : o.type) ?? 'unknown option'}`;

const renderOption = ({ key, ...props }, option) => (
  <li
    {...props}
    key={key}
  >
    <Stack
      spacing={0.25}
      width="100%"
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
        }}
      >
        {option.__label}
      </Typography>
      {!!option.description && (
        <Tooltip
          arrow
          followCursor
          title={option.description}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: '0.6rem' }}
          >
            {option.description}
          </Typography>
        </Tooltip>
      )}
    </Stack>
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
  // expanded,
  // setExpanded,
  // hasAceWrapper,
  // enableFullScreen = false
}) => {
  // console.log("ofValue (headers)", ofValue, ofOption);
  const toggleFreeText = useCallback(() => setIsFreeText((prev) => !prev), [setIsFreeText]);
  const onChange = useCallback(
    (e, v) => {
      const { __label, ...rest } = v ?? {};
      setOfOption(rest ?? null);
    },
    [setOfOption],
  );
  const memoizedOfValue = useMemo(
    () =>
      !hasOfProperties
        ? null
        : ofValue.map((o) => ({
          ...o,
          __label: getLabel(ofValue, o),
        })),
    [hasOfProperties, ofValue],
  );
  const memoizedOfOption = useMemo(
    () =>
      !hasOfProperties || !ofOption
        ? null
        : {
            ...ofOption,
            __label: getLabel(ofValue, ofOption),
          },
    [hasOfProperties, ofOption, ofValue],
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      width="100%"
    >
      {hasOfProperties && !isFreeText && (
        <Autocomplete
          options={memoizedOfValue}
          getOptionLabel={getOptionLabel}
          getOptionKey={getOptionKey}
          isOptionEqualToValue={isOptionEqualToValue}
          value={memoizedOfOption}
          onChange={onChange}
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
          <IconButton
            size="small"
            onClick={toggleFreeText}
          >
            <Iconify
              icon={!isFreeText ? 'lucide:square-function' : 'ph:bounding-box-duotone'}
              width={17}
              className="transition transition-opacity opacity-60 hover:opacity-100"
            />
          </IconButton>
        </Tooltip>
      )}
      {/* {
        (hasAceWrapper && enableFullScreen) ? (
          <Tooltip
            title="Open in full screen"
            arrow
          >
            <IconButton
              size="small"
              onClick={() => setExpanded(prev => !prev)}
            >
              <Iconify icon={`mdi:fullscreen${expanded ? '-exit' : ''}`} />
            </IconButton>
          </Tooltip>
        ) : null
      }
       */}
    </Stack>
  );
};

export default memo(DynamicFormFieldHeaderActions);
