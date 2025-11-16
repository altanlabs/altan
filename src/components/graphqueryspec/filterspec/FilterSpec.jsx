// FilterSpec.js
import { IconButton, Stack } from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';

import BasicOpGroup from './BasicOpGroup';
import ConditionSelector from './ConditionSelector';
import LogicalGroup from './LogicalGroup';
import { checkObjectsEqual } from '../../../redux/helpers/memoize.ts';
import Iconify from '../../iconify';

const exportQuerySpec = (inSpec) => {
  const outSpec = {};
  if (!!inSpec?.logicop) {
    // @and, @or, @not
    outSpec[inSpec.logicop] =
      inSpec.logicop === '@not' ? exportQuerySpec(inSpec.value) : inSpec.value.map(exportQuerySpec);
  } else if (!!(inSpec?.param && inSpec.operation)) {
    // basicop
    outSpec[inSpec.param] = {
      [inSpec.operation.operator]: inSpec.operation.value,
    };
  }
  return outSpec;
};

const importQuerySpec = (inSpec) => {
  // const uid = uniqueId();
  // console.log("importQuerySpec", uid, inSpec);
  if (typeof inSpec !== 'object') {
    return null;
  }
  return Object.entries(inSpec).reduce((outSpec, [key, value]) => {
    if (['@and', '@or', '@not'].includes(key)) {
      // @and, @or, @not
      outSpec.logicop = key;
      if (key === '@not') {
        outSpec.value = importQuerySpec(value);
      } else {
        const standardSetOfConditions = Array.isArray(value)
          ? value
          : Object.entries(value).map(([k, v]) => ({ [k]: v }));
        // console.log("importQuerySpec.foundlogic. standardSetOfConditions", uid, standardSetOfConditions);
        outSpec.value = standardSetOfConditions.map(importQuerySpec);
      }
    } else {
      // basicop
      outSpec.param = key;
      if (value) {
        const [k, v] = Object.entries(value)[0];
        outSpec.operation = {
          operator: k,
          value: v,
        };
      }
      // console.log("importQuerySpec.foundCondition. outSpec", uid, outSpec);
    }
    return outSpec;
  }, {});
};

const FilterSpec = ({ value, onChange, depth = 0, onDelete = null, disabled = false }) => {
  const [spec, setSpec] = useState(null);

  const handleSelect = useCallback((type) => {
    if (type === 'basic') {
      setSpec({ param: '', operation: { operator: '', value: '' } });
    } else {
      setSpec({ logicop: type, value: [] });
    }
  }, []);

  // console.log("@FilterSpec value", value);

  useEffect(() => {
    if (!!Object.keys(value ?? {}).length) {
      const importedSpec = importQuerySpec(value);
      setSpec((prev) => {
        if (!!depth) {
          return value;
        }
        // console.log("@IN USE EFFECT: filterspec.value", depth, value, importedSpec);
        return importedSpec;
      });
    }
  }, [depth]);

  useEffect(() => {
    const newValue = !!depth ? spec : exportQuerySpec(spec);
    if (!checkObjectsEqual(value, newValue)) {
      onChange(newValue);
    }
  }, [spec]);

  return (
    <Stack
      width="100%"
      paddingLeft={depth * 2}
      sx={{
        ...(!!disabled && {
          opacity: 0.5,
        }),
      }}
    >
      <Stack
        width="100%"
        spacing={0.25}
        sx={{
          borderRadius: 2,
          ...(!!spec?.logicop && {
            backgroundColor: '#88888811',
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
        >
          <ConditionSelector
            selected={spec}
            onSelect={handleSelect}
            disabled={disabled}
          />
          {!!onDelete && (
            <IconButton
              size="small"
              onClick={onDelete}
            >
              <Iconify
                icon="ic:round-remove-circle-outline"
                width={17}
              />
            </IconButton>
          )}
        </Stack>
        {spec && spec.param !== undefined && (
          <BasicOpGroup
            param={spec.param}
            operation={spec.operation}
            onChange={setSpec}
            disabled={disabled}
          />
        )}
        {spec && spec.logicop !== undefined && (
          <LogicalGroup
            logicop={spec.logicop}
            value={spec.value}
            onChange={setSpec}
            depth={depth}
            disabled={disabled}
          />
        )}
      </Stack>
      {/* <pre>{JSON.stringify(spec, null, 2)}</pre> */}
    </Stack>
  );
};

export default memo(FilterSpec);
