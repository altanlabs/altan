import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Button, Container, Typography } from '@mui/material';
// utils
import React, { memo, useState } from 'react';

import AddressAutocomplete from '../../../../components/autocomplete/AddressAutocomplete';
import { DynamicIsland } from '../../../../components/dynamic-island/DynamicIsland';
import Iconify from '../../../../components/iconify';
import { selectAccount } from '../../../../redux/slices/general/index.ts';
import { useSelector } from '../../../../redux/store.ts';
import Each from '../../../../utils/each';

// ----------------------------------------------------------------------

function AccountLocations() {
  const account = useSelector(selectAccount);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Container>
      <Box sx={{ pb: 35 }}>
        <Stack spacing={2}>
          {!!account?.company?.addresses?.items && (
            <Each
              of={account.company.addresses.items}
              render={(address, index) => (
                <Card sx={{ p: 2 }}>
                  <Typography variant="h5">{address.name}</Typography>
                  <Typography variant="body2">
                    {address?.street} - {address?.city} , {address?.state} {address?.country}
                  </Typography>
                </Card>
              )}
            />
          )}
        </Stack>

        {isCreating ? (
          <Card sx={{ p: 2, mt: 2 }}>
            <AddressAutocomplete onClose={() => setIsCreating(false)} />
          </Card>
        ) : (
          <Button
            sx={{ mt: 2 }}
            startIcon={<Iconify icon="mdi:add-location" />}
            variant="soft"
            fullWidth
            onClick={() => setIsCreating(true)}
          >
            Add location
          </Button>
        )}
      </Box>

      <DynamicIsland>
        <Stack>
          <LoadingButton
            type="submit"
            sx={{ mt: 0.5 }}
            fullWidth
            size="large"
            startIcon={
              <Iconify
                icon="line-md:confirm-circle"
                width={24}
              />
            }
            variant="contained"
            color="secondary"
          >
            Save
          </LoadingButton>
        </Stack>
      </DynamicIsland>
    </Container>
  );
}

export default memo(AccountLocations);
