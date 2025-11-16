/**
 * Hook for managing component configuration
 * Single Responsibility: Component props and configuration logic
 */

import { useMemo } from 'react';
import type {
  Altaner,
  AltanerComponent,
  ComponentRenderConfig,
  AltanerComponentProps,
  ComponentTypeMap,
} from '../types';

const COMPONENTS_PROPS_MAP: Record<string, Record<string, string>> = {
  agents: { ids: 'filterIds' },
  flows: { ids: 'filterIds' },
};

const COMPONENT_TYPE_MAP: ComponentTypeMap = {
  interface: 'interface',
  base: 'base',
  cloud: 'cloud',
  flows: 'flows',
  agents: 'agents',
};

function transformProps(type: string, props: Record<string, any>): Record<string, any> {
  const transformedProps: Record<string, any> = {};
  const transformations = COMPONENTS_PROPS_MAP[type];
  
  if (!transformations) return props;

  for (const [key, prop] of Object.entries(props)) {
    transformedProps[key in transformations ? transformations[key] : key] = prop;
  }
  
  return transformedProps;
}

export function useComponentConfig(
  altaner: Altaner | null,
  currentComponent: AltanerComponent | null,
  operateMode: boolean,
): ComponentRenderConfig {
  return useMemo(() => {
    if (!altaner || !currentComponent) {
      return { acType: null, acProps: null };
    }

    const type = COMPONENT_TYPE_MAP[currentComponent.type] || currentComponent.type;
    const typeSpecificProps: Partial<AltanerComponentProps> = {};

    // Handle cloud/base component props
    if (type === 'cloud' || type === 'base') {
      if (currentComponent.cloud_id) {
        typeSpecificProps.cloud_id = currentComponent.cloud_id;
        typeSpecificProps.altanerComponentType = type;
      } else if (currentComponent.params?.ids) {
        typeSpecificProps.ids = currentComponent.params.ids;
        typeSpecificProps.altanerComponentType = type;
        typeSpecificProps.filterIds = currentComponent.params.ids;
      }
    }

    // Handle interface component props
    if (type === 'interface' && altaner) {
      typeSpecificProps.altanerPreviewUrl = altaner.frontend_preview_url || null;
      typeSpecificProps.altanerLiveUrl = altaner.frontend_live_url || null;
    }

    const acProps: AltanerComponentProps = {
      ...transformProps(type, currentComponent.params || {}),
      ...typeSpecificProps,
      altanerComponentId: currentComponent.id,
      operateMode,
    };

    return { acType: type, acProps };
  }, [altaner, currentComponent, operateMode]);
}
