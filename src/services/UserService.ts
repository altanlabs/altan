/**
 * User Service - Business logic layer for user operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface UserUpdateData {
  [key: string]: any;
}

/**
 * User Service - Handles all user-related operations
 */
export class UserService extends BaseService {
  /**
   * Update user information
   * @param userId - User ID
   * @param data - User update data
   * @returns Updated user data
   */
  async updateUserInfo(userId: string, data: UserUpdateData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.patch(`/user/${userId}/update`, data);
      return response.data;
    }, 'Error updating user info');
  }

  /**
   * Delete organisation user
   * @param orgId - Organisation ID
   * @param userId - User ID
   * @returns Response
   */
  async deleteOrganisationUser(orgId: string, userId: string): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.delete(`/org/${orgId}/remove/${userId}`);
      return response.data;
    }, 'Error deleting organisation user');
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null;

/**
 * Get UserService singleton instance
 * @returns UserService instance
 */
export const getUserService = (): UserService => {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
  }
  return userServiceInstance;
};

