import { Stack, Container } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
// hooks
import Header from './Header';
import { HEADER } from '../../config-global';
import useOffSetTop from '../../hooks/useOffSetTop';
// config
//

// ----------------------------------------------------------------------

export default function CompactLayout({ children }) {
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
          {children}
        </Stack>
      </Container>
    </>
  );
}

CompactLayout.propTypes = {
  children: PropTypes.node,
};
