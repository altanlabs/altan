/**
 * Role Service - Business logic layer for role operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface Role {
  id: string;
  name: string;
  [key: string]: any;
}

export interface RolesStructure {
  byName: Record<string, string>;
  byId: Record<string, Role>;
}

/**
 * Role Service - Handles all role-related operations
 */
export class RoleService extends BaseService {
  /**
   * Fetch roles information
   * @returns Roles array
   */
  async fetchRoles(): Promise<Role[]> {
    return this.execute(async () => {
      const response = await optimai.get('/org/roles/info');
      return response.data.roles;
    }, 'Error fetching roles');
  }

  /**
   * Transform roles array to structured object
   * @param roles - Roles array
   * @returns Structured roles with byName and byId lookups
   */
  transformRoles(roles: Role[]): RolesStructure {
    return roles.reduce(
      (acc, r) => {
        acc.byName[r.name] = r.id;
        acc.byId[r.id] = r;
        return acc;
      },
      {
        byName: {} as Record<string, string>,
        byId: {} as Record<string, Role>,
      }
    );
  }
}

// Singleton instance
let roleServiceInstance: RoleService | null = null;

/**
 * Get RoleService singleton instance
 * @returns RoleService instance
 */
export const getRoleService = (): RoleService => {
  if (!roleServiceInstance) {
    roleServiceInstance = new RoleService();
  }
  return roleServiceInstance;
};

