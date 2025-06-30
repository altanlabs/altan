import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router';

import RootBoundary from './RootBoundary';

const ErrorBoundaryLayout = () => {
  return (
    <ErrorBoundary FallbackComponent={RootBoundary}>
      <Outlet />
    </ErrorBoundary>
  );
};

export default memo(ErrorBoundaryLayout);
