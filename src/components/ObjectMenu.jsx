import { CircularProgress, Dialog, Stack } from '@mui/material';
import { memo } from 'react';

import AceWrapper from '@components/json/AceWrapper.jsx';
import useResponsive from '@hooks/useResponsive';

const checkIsObject = (value) => typeof value === 'object' && !!value && !Array.isArray(value);

const ObjectMenu = ({ selectedObject: { name, value, isLoading, error }, open, onClose }) => {
  const isSmallScreen = useResponsive('down', 'sm');
  const valueOrError = value || error;
  const formattedValue = checkIsObject(valueOrError)
    ? JSON.stringify(valueOrError, null, 2)
    : valueOrError;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          // position: 'relative',
          height: '100%',
          maxWidth: '80%',
          ...(isSmallScreen && {
            maxWidth: '95%',
          }),
        },
      }}
    >
      {!!isLoading ? (
        <Stack
          height="100%"
          width="100%"
        >
          <CircularProgress variant="indeterminate" />
        </Stack>
      ) : (
        <AceWrapper
          themeMode="dark"
          name={name}
          value={formattedValue}
          fullHeight
          readOnly={true}
        />
      )}
    </Dialog>
  );
};

export default memo(ObjectMenu);
