/**
 * Users thunks - async operations for user management
 */

import type { AppDispatch } from '../../../store';
import { getCloudService } from '../../../../services';
import { setCacheLoading, setCacheError, setUsers, removeUser } from '../slices/users.slice';
import { handleThunkError } from '../utils';

const cloudService = getCloudService();

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Fetches users for a cloud instance
 */
export const fetchUsers = (cloudId: string) => async (dispatch: AppDispatch) => {
  dispatch(setCacheLoading(true));
  try {
    const users = await cloudService.fetchUsers(cloudId);

    dispatch(setUsers({ cloudId, users }));

    return users;
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setCacheError(message));
    throw error;
  } finally {
    dispatch(setCacheLoading(false));
  }
};

/**
 * Deletes a user from a cloud instance
 */
export const deleteUser = (cloudId: string, userId: string) => async (dispatch: AppDispatch) => {
  try {
    await cloudService.deleteUser(cloudId, userId);

    // Remove from cache
    dispatch(removeUser({ cloudId, userId }));

    // Refresh users
    await dispatch(fetchUsers(cloudId));
  } catch (error) {
    const message = handleThunkError(error);
    dispatch(setCacheError(message));
    throw error;
  }
};

