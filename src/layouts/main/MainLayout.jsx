import { Box } from '@mui/material';
import { useLocation, Outlet } from 'react-router-dom';

// @mui
//
import Footer from './Footer';
import Header from './Header';

// ----------------------------------------------------------------------

export default function MainLayout() {
  const { pathname } = useLocation();

  const isHome = pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        overflowy="auto"
        sx={{
          flexGrow: 1,
          ...(!isHome && {
            pt: { xs: 8, md: 11 },
          }),
        }}
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}
