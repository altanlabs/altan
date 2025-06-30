import { AnimatePresence, m } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// components
import Iconify from '../../../components/iconify';
import { getFlows } from '../../../redux/slices/flows';
import { selectAccountId } from '../../../redux/slices/general';

// A separate, memoized component for tab buttons to avoid re-creating functions on every render.
const TabButton = memo(function TabButton({
  componentId,
  component,
  isActive,
  altanerId,
  onTabChange,
  onContextMenu,
  historyPush,
  handleTabClick,
}) {
  // Handlers are wrapped via useCallback in parent, so no inline function recreations here:
  const onClick = useCallback(
    (e) => {
      handleTabClick(e, componentId, component);
    },
    [handleTabClick, componentId, component],
  );

  const onContext = useCallback(
    (e) => {
      onContextMenu(e, component.id);
    },
    [onContextMenu, component.id],
  );

  return (
    <button
      key={componentId}
      className={`
        relative cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
        flex items-center gap-1
        ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-foreground/70 hover:text-primary dark:text-foreground/70 dark:hover:text-primary-dark'}
      `}
      onClick={onClick}
      onContextMenu={onContext}
    >
      <Iconify
        icon={component.icon || 'mdi:cube-outline'}
        width={14}
      />
      <span className="hidden sm:inline">{component.name}</span>

      <AnimatePresence>
        {isActive && (
          <m.div
            key="activeTab" // key to help Framer Motion correctly identify and cleanup the animated element
            layoutId="activeTab"
            className="absolute inset-0 w-full rounded-full bg-primary/5 dark:bg-primary/10 -z-10"
            initial={false}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-t-full">
              <div className="absolute w-6 h-3 bg-primary/20 rounded-full blur-md -top-1 -left-0.5" />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </button>
  );
});

TabButton.propTypes = {
  componentId: PropTypes.string.isRequired,
  component: PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  altanerId: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  historyPush: PropTypes.func.isRequired,
  handleTabClick: PropTypes.func.isRequired,
};

const AltanerNav = ({
  components,
  activeTab,
  altanerId,
  onTabChange,
  onContextMenu,
  onAddClick,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const accountId = useSelector(selectAccountId);

  // When the accountId is available, fetch flows.
  // If getFlows sets up any subscriptions, consider having it return a cleanup function.
  useEffect(() => {
    if (accountId) {
      // If getFlows involves asynchronous operations or subscriptions,
      // then ensure cleanup logic is added to avoid memory leaks.
      dispatch(getFlows(accountId));
    }
  }, [accountId, dispatch]);

  // Unified handler for tab click that performs navigation and calls the tab change callback.
  const handleTabClick = useCallback(
    (event, componentId, component) => {
      onTabChange(componentId);

      if (component?.type === 'external_link') {
        window.open(component.params.url, '_blank');
      } else if (component?.type === 'base' && component?.params?.ids?.[0]) {
        history.push(`/altaners/${altanerId}/c/${componentId}/b/${component.params.ids[0]}`);
      } else {
        history.push(`/altaners/${altanerId}/c/${componentId}`);
      }
    },
    [altanerId, history, onTabChange],
  );

  // useMemo to prevent re-computing the entries on every render.
  const componentEntries = useMemo(() => Object.entries(components || {}), [components]);

  if (!components || componentEntries.length === 0) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 sm:top-1 bottom-6 pointer-events-none">
      <div className="flex items-center gap-2 bg-background/80 dark:bg-background-dark/80 backdrop-blur-md py-1 px-1.5 rounded-full shadow-lg border border-border dark:border-border-dark pointer-events-auto">
        {componentEntries.map(([componentId, component]) => (
          <TabButton
            key={componentId}
            componentId={componentId}
            component={component}
            isActive={activeTab === componentId}
            altanerId={altanerId}
            onTabChange={onTabChange}
            onContextMenu={onContextMenu}
            historyPush={history.push}
            handleTabClick={handleTabClick}
          />
        ))}

        <button
          onClick={onAddClick}
          className="relative cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
            text-foreground/60 hover:text-primary dark:text-foreground-dark/60 dark:hover:text-primary-dark
            flex items-center gap-1"
        >
          <Iconify
            icon="eva:plus-fill"
            width={14}
          />
        </button>
      </div>
    </div>
  );
};

AltanerNav.propTypes = {
  components: PropTypes.object.isRequired,
  activeTab: PropTypes.string.isRequired,
  altanerId: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
};

export default memo(AltanerNav);
