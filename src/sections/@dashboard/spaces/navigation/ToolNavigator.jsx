import {
  Drawer,
} from '@mui/material';
import { memo, useState, useEffect } from 'react';

import { getConnections } from '../../../../redux/slices/connections';
import { selectAccount } from '../../../../redux/slices/general';
import { dispatch, useSelector } from '../../../../redux/store';
import { bgBlur } from '../../../../utils/cssStyles';
import CreateTool from '../tools/CreateTool';
import SelectExistingTool from '../tools/SelectExistingTool';

const ToolNavigator = ({ toolDrawer, setToolDrawer }) => {
  const [mode, setMode] = useState('create');
  const account = useSelector(selectAccount);
  const isLoadingAccount = useSelector((state) => state.general.isLoadingAccount);

  useEffect(() => {
    if (!isLoadingAccount && !!account) {
      dispatch(getConnections(account.id));
    }
  }, [account, isLoadingAccount]);

  // const isMobile = useResponsive('down', 'sm');

  // const renderHead = (
  //   <Stack
  //     direction="row"
  //     alignItems="center"
  //     sx={{
  //       minHeight: 68,
  //       position: 'sticky',
  //       top: 0,
  //       zIndex: 101,
  //     }}
  //   >
  //     <ToggleButtonGroup
  //       exclusive
  //       value={mode}
  //       onChange={(e, v) => setMode(v)}
  //       fullWidth
  //     >
  //       <Tooltip
  //         arrow
  //         title="Create tool"
  //       >
  //         <ToggleButton value="create">
  //           <Stack
  //             direction="row"
  //             alignItems="center"
  //             spacing={0.5}
  //           >
  //             <Iconify icon="mdi:plus" />
  //             <Typography>Create</Typography>
  //           </Stack>
  //         </ToggleButton>
  //       </Tooltip>
  //       <Tooltip
  //         arrow
  //         title="Search existing"
  //       >
  //         <ToggleButton value="existing">
  //           <Stack
  //             direction="row"
  //             alignItems="center"
  //             spacing={0.5}
  //           >
  //             <Iconify icon="icon-park-solid:search" />
  //             <Typography>Search</Typography>
  //           </Stack>
  //         </ToggleButton>
  //       </Tooltip>
  //     </ToggleButtonGroup>
  //     {!!isMobile && (
  //       <IconButton onClick={() => setToolDrawer(false)}>
  //         <Iconify icon="mingcute:close-line" />
  //       </IconButton>
  //     )}
  //   </Stack>
  // );

  return (
    <>
      <Drawer
        open={toolDrawer}
        onClose={() => setToolDrawer(false)}
        anchor="right"
        PaperProps={{
          sx: {
            width: 1,
            maxWidth: 550,
            backgroundColor: 'transparent',
            padding: 1,
            pb: 2,
            ...bgBlur({ opacity: 0.1 }),
          },
        }}
        slotProps={{
          backdrop: { invisible: true },
        }}
      >
        <CreateTool onClose={() => setToolDrawer(false)} />
      </Drawer>
    </>
  );
};

export default memo(ToolNavigator);
