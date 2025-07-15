import { Stack, Box } from '@mui/material';
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useParams, useHistory } from 'react-router';

import { AltanerComponent, CAGIRoomsView } from './components';
// import AltanerDrawer from './room/AltanerDrawer.jsx';
import LoadingFallback from '../../../components/LoadingFallback.jsx';
import { CompactLayout } from '../../../layouts/dashboard';
import {
  selectCurrentAltaner,
  selectSortedAltanerComponents,
} from '../../../redux/slices/altaners';
import { selectAccountId } from '../../../redux/slices/general.js';
import { useSelector } from '../../../redux/store';

const COMPONENTS_PROPS_MAP = {
  agents: { ids: 'filterIds' },
  flows: { ids: 'filterIds' },
  forms: { ids: 'filterIds' },
};

const transformProps = (type, props) => {
  const transformedProps = {};
  const tranformations = COMPONENTS_PROPS_MAP[type];
  if (!tranformations) return props;

  for (const [key, prop] of Object.entries(props)) {
    transformedProps[key in tranformations ? tranformations[key] : key] = prop;
  }
  return transformedProps;
};

const selectAltanersIsLoading = (state) => state.altaners.isLoading;
const selectAltanersInitialized = (state) => state.altaners.initialized;

const formatComponentType = (type) => {
  if (!type) return '';

  // Special case for 'base' to 'Database'
  if (type === 'base') return 'Database';

  // Capitalize first letter for all other types
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const AltanerPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [isCAGIMode, setCAGIMode] = useState(false);

  const { altanerId, altanerComponentId } = useParams();
  const history = useHistory();
  const accountId = useSelector(selectAccountId);
  const isLoading = useSelector(selectAltanersIsLoading);
  const initialized = useSelector(selectAltanersInitialized);
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  // Base navigation function
  const navigateToUrl = useCallback(
    (url, replace = true) => {
      history.push(url, { replace });
    },
    [history.push],
  );

  // Component navigation logic
  const navigateToComponent = useCallback(
    (componentId, params = {}) => {
      const baseUrl = `/altaners/${altanerId}/c/${componentId}`;

      // When switching components, clear all params first
      if (componentId !== activeTab) {
        navigateToUrl(baseUrl);
        return;
      }

      // Build the target URL based on component type and params
      let targetUrl = baseUrl;
      if (params.baseId) {
        targetUrl = `${baseUrl}/b/${params.baseId}`;
        if (params.tableId && params.viewId) {
          targetUrl += `/tables/${params.tableId}/views/${params.viewId}`;
          if (params.recordId) {
            targetUrl += `/records/${params.recordId}`;
          }
        }
      } else if (params.flowId) {
        targetUrl = `${baseUrl}/w/${params.flowId}`;
      } else if (params.formId) {
        targetUrl = `${baseUrl}/f/${params.formId}`;
      }

      navigateToUrl(targetUrl);
    },
    [altanerId, activeTab, navigateToUrl],
  );

  // Handle component changes
  const handleComponentChange = useCallback(
    (newComponentId) => {
      navigateToComponent(newComponentId);
    },
    [navigateToComponent],
  );

  // Initial component selection
  useEffect(() => {
    if (!!initialized && !isLoading && altanerId === altaner?.id) {
      if (!altanerComponentId) {
        const selectedTab = !!sortedComponents ? Object.keys(sortedComponents)[0] : 'room';
        navigateToComponent(selectedTab);
      } else {
        setActiveTab(altanerComponentId);
      }
    }
  }, [
    altaner?.id,
    altanerId,
    altanerComponentId,
    initialized,
    isLoading,
    sortedComponents,
    navigateToComponent,
  ]);

  const currentTab = useMemo(
    () =>
      !!activeTab && !!sortedComponents && !['settings', 'room'].includes(activeTab)
        ? sortedComponents[activeTab]
        : null,
    [activeTab, sortedComponents],
  );

  const { acType, acProps } = useMemo(() => {
    if (!altaner || (!currentTab && !['settings', 'room'].includes(activeTab))) {
      return {};
    }

    if (activeTab === 'room') {
      return {
        acType: 'room',
        acProps: {
          roomId: altaner.room_id,
          header: true,
        },
      };
    }

    if (activeTab === 'settings') {
      return { acType: 'altaner_settings' };
    }

    // Get the agentId from the URL if it exists
    const agentIdMatch = window.location.pathname.match(/\/a\/([^/]+)/);
    const agentId = agentIdMatch?.[1];

    // If we have an agentId in the URL and the current component is of type 'agents',
    // we should show the single agent view
    if (agentId && currentTab?.type === 'agents') {
      return {
        acType: 'agent',
        acProps: {
          agentId,
          accountId,
          altanerId,
        },
      };
    }

    return {
      acType: currentTab.type,
      acProps: {
        ...transformProps(currentTab.type, currentTab.params),
        accountId,
        altanerId,
      },
    };
  }, [accountId, activeTab, altaner, altanerId, currentTab]);

  if (isCAGIMode)
    return (
      <CompactLayout noPadding>
        <CAGIRoomsView
          altanerId={altanerId}
          currentTab={currentTab}
          components={sortedComponents}
        />
      </CompactLayout>
    );

  return (
    <CompactLayout
      title={`${formatComponentType(currentTab?.type)} · ${altaner?.name || 'Loading'}`}
      noPadding
      drawerVisible={false}
    >
      <Stack
        height="100%"
        width="100%"
        direction="row"
        sx={{ overflow: 'hidden' }}
      >
        {!altaner || isLoading ? (
          <LoadingFallback />
        ) : (
          <>
            <Box className="w-full relative overflow-hidden">
              {!!acType && (
                <AltanerComponent
                  key={`${currentTab?.id}_${acType}_${altanerId}`}
                  altanerComponentType={acType}
                  altanerComponentId={currentTab?.id || acType}
                  altanerProps={{
                    altanerId: altanerId,
                    altanerComponentId: altanerComponentId,
                  }}
                  onComponentChange={handleComponentChange}
                  onNavigate={navigateToComponent}
                  {...(acProps || {})}
                />
              )}
            </Box>
            {/* {shouldRenderDrawer && (
              <AltanerDrawer
                externalRoomId={altanerComponentId}
                side="right"
              />
            )} */}
          </>
        )}
      </Stack>
    </CompactLayout>
  );
};

export default memo(AltanerPage);
