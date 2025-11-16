/**
 * Altaner Component Operations
 * Contains all altaner component event handlers
 */

import type {
  AltanerComponentEventData,
  ExtractedAltanerComponentEvent,
  AltanerComponentData,
  AltanerComponentOperationsRegistry,
} from './types';
import {
  addAltanerComponent,
  patchAltanerComponent,
  deleteAltanerComponent,
} from '../../../../redux/slices/altaners';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate altaner component event data
 */
export const extractAltanerComponentEventData = (
  data: AltanerComponentEventData
): ExtractedAltanerComponentEvent | null => {
  if (!data || !data.type || !data.data) {
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle altaner_component.created event (from AltanerComponentNew)
 */
export const handleAltanerComponentCreated = (eventData: unknown): void => {
  const componentData = eventData as AltanerComponentData;
  
  dispatch(
    addAltanerComponent({
      altaner_id: componentData.altaner_id,
      // Type assertion is safe here as the WebSocket data contains all required component fields
      attributes: componentData as unknown as { 
        id: string; 
        altaner_id: string; 
        type: string; 
        position: number; 
        [key: string]: unknown;
      },
    })
  );
};

/**
 * Handle altaner_component.updated event (from AltanerComponentUpdate)
 */
export const handleAltanerComponentUpdated = (eventData: unknown): void => {
  const updateData = eventData as AltanerComponentData;
  const ids = updateData.ids || (updateData.id ? [updateData.id] : []);
  
  if (ids.length === 0) return;

  dispatch(
    patchAltanerComponent({
      altaner_id: updateData.altaner_id,
      ids,
      changes: updateData as Record<string, unknown>,
    })
  );
};

/**
 * Handle altaner_component.deleted event (from AltanerComponentDelete)
 */
export const handleAltanerComponentDeleted = (eventData: unknown): void => {
  const deleteData = eventData as AltanerComponentData;
  const ids = deleteData.ids || (deleteData.id ? [deleteData.id] : []);
  
  if (ids.length === 0) return;

  dispatch(
    deleteAltanerComponent({
      altaner_id: deleteData.altaner_id,
      ids,
    })
  );
};

/**
 * Operation registry for altaner component events
 */
export const ALTANER_COMPONENT_OPERATIONS: AltanerComponentOperationsRegistry = {
  'altaner_component.created': handleAltanerComponentCreated,
  'altaner_component.updated': handleAltanerComponentUpdated,
  'altaner_component.deleted': handleAltanerComponentDeleted,
};
