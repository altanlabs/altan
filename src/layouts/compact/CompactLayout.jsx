import { Stack, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

// @mui
// hooks
import Header from './Header';
import { HEADER } from '../../config-global';
import useOffSetTop from '../../hooks/useOffSetTop';
// config
//

// ----------------------------------------------------------------------

export default function CompactLayoutLegacy() {
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <>
      <Header isOffset={isOffset} />

      <Container component="main">
        <Stack
          sx={{
            py: 12,
            m: 'auto',
            maxWidth: 400,
            minHeight: '100vh',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          <Outlet />
        </Stack>
      </Container>
    </>
  );
}
