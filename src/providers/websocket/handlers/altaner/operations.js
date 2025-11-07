/**
 * Altaner Operations
 * Contains all altaner event handlers
 */

import {
  addAltaner,
  updateAltaner,
  deleteAltaner,
} from '../../../../redux/slices/altaners';
import {
  addAccountAltaner,
  updateAccountAltaner,
  deleteAccountAltaner,
} from '../../../../redux/slices/general';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate altaner event data
 */
export const extractAltanerEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid altaner event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle altaner.created event (from AltanerNew)
 */
export const handleAltanerCreated = (eventData) => {
  dispatch(addAccountAltaner(eventData));
  dispatch(addAltaner(eventData));
};

/**
 * Handle altaner.updated event (from AltanerUpdate)
 */
export const handleAltanerUpdated = (eventData) => {
  const updateData = {
    ids: eventData.ids || [eventData.id],
    changes: eventData.changes || eventData,
  };

  dispatch(updateAccountAltaner(updateData));
  dispatch(
    updateAltaner({
      id: updateData.ids[0],
      ...updateData.changes,
    }),
  );
};

/**
 * Handle altaner.deleted event (from AltanerDelete)
 */
export const handleAltanerDeleted = (eventData) => {
  const altanerId = eventData.id || (eventData.ids && eventData.ids[0]);
  dispatch(deleteAccountAltaner(altanerId));
  dispatch(deleteAltaner(altanerId));
};

/**
 * Operation registry for altaner events
 */
export const ALTANER_OPERATIONS = {
  'altaner.created': handleAltanerCreated,
  'altaner.updated': handleAltanerUpdated,
  'altaner.deleted': handleAltanerDeleted,
};
