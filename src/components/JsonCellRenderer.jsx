import { LoadingButton } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { memo, useState } from 'react';

import Iconify from './iconify';

const checkIsObject = (value) => typeof value === 'object' && !!value && !Array.isArray(value);
const checkIsArray = (value) => typeof value === 'object' && !!value && Array.isArray(value);
const endsWithId = (name) => typeof name === 'string' && name.endsWith('_id');

const JsonCellRenderer = ({ params, onRelationshipSelect, onOpenObject }) => {
  const [isLoading, setIsLoading] = useState(false);

  const value = params.value;
  const isValueObject = checkIsObject(value);
  const isValueArray = checkIsArray(value);

  return (
    <Stack
      height="100%"
      width="100%"
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      {endsWithId(params.colDef.field) && params.value ? (
        <LoadingButton
          color="inherit"
          variant="soft"
          size="small"
          disabled={isLoading}
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            onRelationshipSelect(params.colDef.field, params.value);
            setIsLoading(false);
          }}
        >
          Fetch relationship
        </LoadingButton>
      ) : !isValueObject && !isValueArray ? (
        params.value
      ) : (
        <Button
          variant="soft"
          color="secondary"
          size="small"
          onClick={() => {
            onOpenObject(params.colDef.field, params.value);
          }}
          startIcon={<Iconify icon="mdi:show" />}
        >
          Show
        </Button>
      )}
    </Stack>
  );
};

export default memo(JsonCellRenderer);
