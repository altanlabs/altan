import { Outlet } from 'react-router-dom';

// hooks
import Header from './Header';
import { HEADER } from '../../config-global';
import useOffSetTop from '../../hooks/useOffSetTop';
// config
// components

// ----------------------------------------------------------------------

export default function SimpleLayout() {
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <>
      <Header isOffset={isOffset} />

      <Outlet />
    </>
  );
}
