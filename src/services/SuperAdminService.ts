/**
 * SuperAdmin Service - Business logic layer for superadmin operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface SearchAccountsParams {
  name?: string;
  id?: string;
  owner_email?: string;
  limit?: number;
  offset?: number;
}

export interface AccountPerson {
  first_name?: string;
  last_name?: string;
  nickname?: string;
}

export interface AccountUser {
  id?: string;
  email?: string;
  user_name?: string;
  person?: AccountPerson;
}

export interface AccountOrganisation {
  id?: string;
  name?: string;
  date_creation?: string;
}

export interface AccountApiResponse {
  id: string;
  name?: string;
  logo_url?: string;
  date_creation?: string;
  currency?: string;
  stripe_id?: string;
  room_id?: string;
  organisation_id?: string;
  user_id?: string;
  meta_data?: {
    displayName?: string;
    [key: string]: unknown;
  };
  organisation?: AccountOrganisation;
  user?: AccountUser;
}

export interface TransformedAccount {
  id: string;
  name: string;
  logo_url?: string;
  date_creation?: string;
  currency?: string;
  stripe_id?: string;
  room_id?: string;
  organisation_id?: string;
  user_id?: string;
  meta_data?: Record<string, unknown>;
  organisation?: {
    id: string;
    name: string;
    date_creation?: string;
  } | null;
  user?: {
    id: string;
    email: string;
    user_name: string;
    person?: {
      first_name: string;
      last_name: string;
      nickname: string;
    };
  };
}

/**
 * SuperAdmin Service - Handles all superadmin-related operations
 */
export class SuperAdminService extends BaseService {
  /**
   * Search accounts with filters
   * @param params - Search parameters
   * @returns Array of transformed accounts
   */
  async searchAccounts(params: SearchAccountsParams): Promise<TransformedAccount[]> {
    return this.execute(async () => {
      const { name, id, owner_email, limit = 50, offset = 0 } = params;

      // Only search if at least one filter is provided
      if (!name && !id && !owner_email) {
        return [];
      }

      const urlParams = new URLSearchParams();
      if (name) urlParams.append('name', name);
      if (id) urlParams.append('id', id);
      if (owner_email) urlParams.append('owner_email', owner_email);
      urlParams.append('limit', limit.toString());
      urlParams.append('offset', offset.toString());

      const response = await optimai.get<{ accounts: AccountApiResponse[] }>(`/account/list?${urlParams.toString()}`);

      const accounts = response.data.accounts;

      // Transform the flat API response to match the expected nested structure
      const transformedAccounts = accounts.map((account: AccountApiResponse) => {
        const transformed: TransformedAccount = {
          id: account.id,
          name: account.name || account.meta_data?.displayName || 'Unnamed Account',
          ...(account.logo_url && { logo_url: account.logo_url }),
          ...(account.date_creation && { date_creation: account.date_creation }),
          ...(account.currency && { currency: account.currency }),
          ...(account.stripe_id && { stripe_id: account.stripe_id }),
          ...(account.room_id && { room_id: account.room_id }),
          // Create nested organisation object
          organisation: account.organisation_id
            ? {
                id: account.organisation_id,
                name: account.organisation?.name || 'Unknown Organization',
                ...(account.organisation?.date_creation || account.date_creation
                  ? { date_creation: account.organisation?.date_creation || account.date_creation }
                  : {}),
              }
            : null,
          // Create nested user object structure that AccountDetailRow expects
          // Handle case where API only returns user_id without nested user object
          user: {
            id: account.user_id || '',
            email: account.user?.email || 'Unknown Email',
            user_name: account.user?.user_name || account.user?.person?.nickname || '',
            person: {
              first_name: account.user?.person?.first_name || '',
              last_name: account.user?.person?.last_name || '',
              nickname: account.user?.person?.nickname || account.user?.user_name || '',
            },
          },
          // Keep original flat data for compatibility
          ...(account.user_id && { user_id: account.user_id }),
          ...(account.organisation_id && { organisation_id: account.organisation_id }),
          ...(account.meta_data && { meta_data: account.meta_data }),
        };

        return transformed;
      });

      return transformedAccounts;
    }, 'Error searching accounts');
  }

  /**
   * Update an entry in any table (generic update method for superadmin)
   * @param table - Table name (e.g., 'Subscription', 'Account')
   * @param entityId - Entity ID
   * @param entry - Data to update
   * @returns Updated entity data
   */
  async updateEntry(table: string, entityId: string, entry: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.execute(async () => {
      const response = await optimai.patch<Record<string, unknown>>(`/utils/${table}/${entityId}`, entry);
      return response.data;
    }, `Error updating ${table} entry`);
  }
}

// Singleton instance
let superAdminServiceInstance: SuperAdminService | null = null;

/**
 * Get SuperAdminService singleton instance
 * @returns SuperAdminService instance
 */
export const getSuperAdminService = (): SuperAdminService => {
  if (!superAdminServiceInstance) {
    superAdminServiceInstance = new SuperAdminService();
  }
  return superAdminServiceInstance;
};

