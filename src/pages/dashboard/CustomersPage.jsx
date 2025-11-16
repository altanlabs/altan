import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { memo, useEffect } from 'react';

import EmptyContent from '../../components/empty-content/EmptyContent';
import { CompactLayout } from '../../layouts/dashboard';
// import { Button, Stack, IconButton } from '@mui/material';
// import { PATH_DASHBOARD } from '../../routes/paths';
// import Iconify from '../../components/iconify/Iconify';
import {
  fetchClients,
  selectClientsLength,
  selectClientsLoading,
} from '../../redux/slices/clients';
import { dispatch, useSelector } from '../../redux/store.ts';
import CustomersTable from '../../sections/@dashboard/clients/table/CustomersTable';

function CustomersPage() {
  const clientsLength = useSelector(selectClientsLength);
  const isLoading = useSelector(selectClientsLoading);

  useEffect(() => {
    dispatch(fetchClients());
  }, []);

  return (
    <CompactLayout
      title={'Customers · Altan'}
      // toolbarChildren={
      //   <Stack direction="row">

      //     <Button
      //       variant='soft'
      //       disabled
      //       startIcon={<Iconify icon="mingcute:add-line" />}
      //     >
      //       Add customer
      //     </Button>
      //   </Stack>

      // }
      // breadcrumb={{
      //   title: "Customers",
      //   links: [
      //     {
      //       name: 'Assets',
      //       href: PATH_DASHBOARD.assets.root,
      //     },
      //     {
      //       name: 'Customers',
      //     },
      //   ]
      // }}
    >
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            p: 0,
            left: 20,
            bottom: 20,
            borderRadius: '10px',
            maxWidth: { xs: '95vw', md: 300 },
            overflow: 'hidden',
            height: 100,
            zIndex: 99,
            alignItems: 'center',
            alignContent: 'center',
            textAlign: 'center',
            position: 'fixed',
          }}
        >
          <Stack
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Typography variant="h6">Fetching... {clientsLength} customers</Typography>
            <LinearProgress sx={{ width: '90%' }} />
          </Stack>
        </Box>
      )}
      {clientsLength > 0 ? (
        <CustomersTable />
      ) : (
        <EmptyContent
          title="No customers :("
          description="Please create one <3"
        />
      )}
    </CompactLayout>
  );
}

export default memo(CustomersPage);
