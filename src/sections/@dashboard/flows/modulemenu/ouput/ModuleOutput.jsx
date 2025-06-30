import { Stack } from '@mui/material';
import { memo } from 'react';

const ModuleOutput = () => {
  // const moduleInMenu = useSelector((state) => state.flows.menuModule);

  return (
    <Stack
      spacing={1}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      OUTPUT
    </Stack>
  );
};

export default memo(ModuleOutput);
