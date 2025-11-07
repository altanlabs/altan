/**
 * Altaner Component Operations
 * Contains all altaner component event handlers
 */

import {
  addAltanerComponent,
  patchAltanerComponent,
  deleteAltanerComponent,
} from '../../../../redux/slices/altaners';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate altaner component event data
 */
export const extractAltanerComponentEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid altaner component event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle altaner_component.created event (from AltanerComponentNew)
 */
export const handleAltanerComponentCreated = (eventData) => {
  dispatch(
    addAltanerComponent({
      altaner_id: eventData.altaner_id,
      attributes: eventData,
    }),
  );
};

/**
 * Handle altaner_component.updated event (from AltanerComponentUpdate)
 */
export const handleAltanerComponentUpdated = (eventData) => {
  dispatch(
    patchAltanerComponent({
      altaner_id: eventData.altaner_id,
      ids: [eventData.id],
      changes: eventData,
    }),
  );
};

/**
 * Handle altaner_component.deleted event (from AltanerComponentDelete)
 */
export const handleAltanerComponentDeleted = (eventData) => {
  dispatch(
    deleteAltanerComponent({
      altaner_id: eventData.altaner_id,
      ids: [eventData.id || (eventData.ids && eventData.ids[0])],
    }),
  );
};

/**
 * Operation registry for altaner component events
 */
export const ALTANER_COMPONENT_OPERATIONS = {
  'altaner_component.created': handleAltanerComponentCreated,
  'altaner_component.updated': handleAltanerComponentUpdated,
  'altaner_component.deleted': handleAltanerComponentDeleted,
};

