/**
 * Altaner Operations
 * Contains all altaner event handlers
 */

import type {
  AltanerEventData,
  ExtractedAltanerEvent,
  AltanerUpdateData,
  AltanerOperationsRegistry,
} from './types';
import {
  addAltaner,
  updateAltaner,
  deleteAltaner,
} from '../../../../redux/slices/altaners';
import {
  addAccountAltaner,
  updateAccountAltaner,
  deleteAccountAltaner,
} from '../../../../redux/slices/general/index';
import { dispatch } from '../../../../redux/store';
import type { Altaner } from '../../../../services/types';

/**
 * Extract and validate altaner event data
 */
export const extractAltanerEventData = (
  data: AltanerEventData
): ExtractedAltanerEvent | null => {
  if (!data || !data.type || !data.data) {
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle altaner.created event (from AltanerNew)
 */
export const handleAltanerCreated = (eventData: unknown): void => {
  const altanerData = eventData as Altaner;
  dispatch(addAccountAltaner(altanerData));
  dispatch(addAltaner(altanerData));
};

/**
 * Handle altaner.updated event (from AltanerUpdate)
 */
export const handleAltanerUpdated = (eventData: unknown): void => {
  const updateData = eventData as AltanerUpdateData;
  const ids = updateData.ids || (updateData.id ? [updateData.id] : []);
  
  if (ids.length === 0) return;

  const changes = updateData.changes || updateData;

  dispatch(updateAccountAltaner({ ids, changes }));
  dispatch(
    updateAltaner({
      id: ids[0],
      ...changes,
    })
  );
};

/**
 * Handle altaner.deleted event (from AltanerDelete)
 */
export const handleAltanerDeleted = (eventData: unknown): void => {
  const deleteData = eventData as AltanerUpdateData;
  const altanerId = deleteData.id || (deleteData.ids && deleteData.ids[0]);
  
  if (!altanerId) return;

  dispatch(deleteAccountAltaner(altanerId));
  dispatch(deleteAltaner(altanerId));
};

/**
 * Operation registry for altaner events
 */
export const ALTANER_OPERATIONS: AltanerOperationsRegistry = {
  'altaner.created': handleAltanerCreated,
  'altaner.updated': handleAltanerUpdated,
  'altaner.deleted': handleAltanerDeleted,
};
