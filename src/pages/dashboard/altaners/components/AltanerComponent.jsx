import { Stack, Typography } from '@mui/material';
import React, { lazy, memo, Suspense, useMemo } from 'react';

import AltanLogo from '../../../../components/loaders/AltanLogo.jsx';

// Fallback component for Suspense
const fallback = <AltanLogo wrapped={true} />;

// Helper factory for creating a memoized loadable component
const createLoadableComponent = (Component) => {
  // Wrap the component inside Suspense
  const WrappedComponent = (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );

  // Set a display name for easier debugging
  WrappedComponent.displayName = `Loadable(${Component.displayName || Component.name || 'Component'})`;

  // Use React.memo to avoid unnecessary rerenders
  return memo(WrappedComponent);
};

// Map of lazy-loaded components
const COMPONENTS = {
  gate: lazy(() => import('./AltanerGateFrame.jsx')),
  iframe: lazy(() => import('./AltanerFrame.jsx')),
  flows: lazy(() => import('../../../../sections/@dashboard/flows/Workflow.jsx')),
  flow: lazy(() => import('../../../../sections/@dashboard/flows/Workflow.jsx')),
  setup_flow: lazy(() => import('../../../../sections/@dashboard/flows/Workflow.jsx')),
  agents: lazy(() => import('../../../../components/agents/v2/Agent.jsx')),
  agent: lazy(() => import('../../../../components/agents/v2/Agent.jsx')),
  base: lazy(() => import('../../../../components/databases/base/Base.jsx')),
  altaner_settings: lazy(() => import('./TemplateSettings.jsx')),
  room: lazy(() => import('../../../../components/Room.jsx')),
  interface: lazy(() => import('../../interfaces/Interface.jsx')),
};

const AltanerComponent = ({
  altanerComponentType,
  altanerComponentId,
  altanerId,
  onComponentChange,
  onNavigate,
  ...props
}) => {
  // Lookup the component based on its type
  const Component = COMPONENTS[altanerComponentType];
  // Memoize the loadable component so it is instantiated only once per unique lazy component
  const LoadableComponent = useMemo(() => {
    return Component ? createLoadableComponent(Component) : null;
  }, [Component]);

  // Prepare props for the lazy-loaded component
  const componentProps = {
    altanerComponentId,
    altanerId,
    altanerComponentType,
    onComponentChange,
    onNavigate,
    ...props,
  };

  // Fallback UI if no matching component is found
  if (!Component || !LoadableComponent) {
    return (
      <Stack
        direction="row"
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="body1">
          Unknown component for Altaner: {altanerComponentType}
        </Typography>
      </Stack>
    );
  }

  // Apply a unique key on the loadable component instance, not inside the componentProps object
  // Special containment wrapper for base components to prevent width overflow
  if (altanerComponentType === 'base') {
    return (
      <div
        data-tour="component-preview-base"
        style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LoadableComponent
          key={`altaner-component-${altanerComponentId}`}
          {...componentProps}
        />
      </div>
    );
  }

  return (
    <div
      data-tour={`component-preview-${altanerComponentType}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LoadableComponent
        key={`altaner-component-${altanerComponentId}`}
        {...componentProps}
      />
    </div>
  );
};

// Export the memoized container to prevent unnecessary renders
export default memo(AltanerComponent);
