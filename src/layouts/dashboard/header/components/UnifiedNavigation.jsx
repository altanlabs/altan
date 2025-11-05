import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import { memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../../components/iconify';
import Logo from '../../../../components/logo/Logo';
import HybridTabs from '../../../../components/ui/hybrid-tabs';
import { cn } from '../../../../lib/utils';

const UnifiedNavigation = memo(({
  altaner,
  components,
  activeComponent,
  onComponentSelect,
  onBackToDashboard,
  onEditAltaner,
}) => {
  const history = useHistory();

  const handleBackClick = useCallback((event) => {
    event.stopPropagation();
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      history.push('/');
    }
  }, [onBackToDashboard, history]);

  const handleAltanerClick = useCallback((event) => {
    event.stopPropagation();
    if (onEditAltaner) {
      onEditAltaner();
    }
  }, [onEditAltaner]);

  const handleComponentChange = useCallback((componentId) => {
    onComponentSelect(componentId);
  }, [onComponentSelect]);

  // Transform components for HybridTabs
  const tabItems = components?.map((component) => ({
    value: component.id,
    icon: component.icon ? (
      <Iconify icon={component.icon} className="w-[15px] h-[15px]" />
    ) : null,
    label: component.name === 'Database' ? 'Cloud' : component.name,
  })) || [];

  return (
    <div className="flex items-center gap-2">
      {/* Back to Dashboard Button */}
      <button
        onClick={handleBackClick}
        className={cn(
          'group relative flex items-center justify-center',
          'w-9 h-8 rounded-lg border-none bg-transparent',
          'text-muted-foreground cursor-pointer overflow-hidden',
          'transition-all duration-200 ease-in-out',
          'hover:text-foreground hover:bg-primary/10',
        )}
      >
        <div className="absolute flex items-center justify-center w-full h-full opacity-100 scale-100 transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
          <Logo minimal />
        </div>
        <div className="absolute flex items-center justify-center w-full h-full opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100">
          <ArrowLeft className="w-4 h-4" />
        </div>
      </button>

      {/* Altaner Name */}
      {altaner?.name && (
        <button
          onClick={handleAltanerClick}
          className={cn(
            'flex items-center justify-center h-7 px-2 rounded-lg',
            'border-none bg-transparent text-foreground cursor-pointer',
            'text-[0.8125rem] font-medium whitespace-nowrap',
            'transition-all duration-200',
            'hover:bg-primary/10',
          )}
        >
          {altaner.name}
        </button>
      )}

      {/* Component Switcher using HybridTabs */}
      {tabItems.length > 0 && (
        <div data-tour="component-switcher">
          <HybridTabs
            items={tabItems}
            value={activeComponent?.id || tabItems[0]?.value}
            onValueChange={handleComponentChange}
          />
        </div>
      )}
    </div>
  );
});

UnifiedNavigation.propTypes = {
  altaner: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  activeComponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
  }),
  onComponentSelect: PropTypes.func.isRequired,
  onBackToDashboard: PropTypes.func,
  onEditAltaner: PropTypes.func,
};

UnifiedNavigation.displayName = 'UnifiedNavigation';

export default UnifiedNavigation;
