/**
 * Account Service - Business logic layer for account operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface AccountData {
  id: string;
  name?: string;
  credit_balance?: number;
  stripe_id?: string;
  room_id?: string;
  logo_url?: string;
  organisation_id?: string;
  organisation?: any;
  meta_data?: Record<string, any>;
  owner?: any;
  stripe_connect_id?: string;
  [key: string]: any;
}

export interface CreateAccountData {
  name: string;
  [key: string]: any;
}

export interface OnboardAccountData {
  [key: string]: any;
}

export interface UpdateAccountMetaData {
  meta_data: Record<string, any>;
}

export interface CompanyUpdateData {
  [key: string]: any;
}

export interface AddressData {
  [key: string]: any;
}

/**
 * Account Service - Handles all account-related operations
 */
export class AccountService extends BaseService {
  /**
   * Fetch account details using V2 endpoint
   * @param accountId - Account ID
   * @returns Account data
   */
  async fetchAccount(accountId: string): Promise<AccountData> {
    return this.execute(async () => {
      const response = await optimai.get(`/account/v2/${accountId}`);
      return response.data;
    }, 'Error fetching account');
  }

  /**
   * Fetch specific account attributes using GraphQL
   * @param accountId - Account ID
   * @param gqlQuery - GraphQL query object
   * @returns Account attributes
   */
  async fetchAccountAttributes(accountId: string, gqlQuery: any): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/gq`, gqlQuery);
      return response.data;
    }, 'Error fetching account attributes');
  }

  /**
   * Fetch account members/users
   * @param accountId - Account ID
   * @returns Members list
   */
  async fetchAccountMembers(accountId: string): Promise<any[]> {
    return this.execute(async () => {
      const response = await optimai.get(`/account/${accountId}/users`);
      return response.data?.members ?? [];
    }, 'Error fetching account members');
  }

  /**
   * Create a new account
   * @param data - Account creation data
   * @returns Created account
   */
  async createAccount(data: CreateAccountData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post('/account/new', data);
      return response.data;
    }, 'Error creating account');
  }

  /**
   * Onboard account
   * @param accountId - Account ID
   * @param data - Onboarding data
   * @returns Chatbot ID
   */
  async onboardAccount(accountId: string, data: OnboardAccountData): Promise<string> {
    return this.execute(async () => {
      const response = await optimai.patch(`/account/${accountId}/onboarding`, data);
      return response.data.chatbot_id;
    }, 'Error onboarding account');
  }

  /**
   * Update account metadata
   * @param accountId - Account ID
   * @param metaData - Metadata to update
   * @returns Updated account
   */
  async updateAccountMetadata(accountId: string, metaData: Record<string, any>): Promise<AccountData> {
    return this.execute(async () => {
      const response = await optimai.patch(`/account/${accountId}`, {
        patches: [{ key: 'meta_data', value: metaData }],
      });
      return response.data.account;
    }, 'Error updating account metadata');
  }

  /**
   * Update account company information
   * @param accountId - Account ID
   * @param data - Company update data
   * @returns Updated data
   */
  async updateAccountCompany(accountId: string, data: CompanyUpdateData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.patch(`/account/${accountId}/company`, data);
      return response.data;
    }, 'Error updating account company');
  }

  /**
   * Add address to account company
   * @param accountId - Account ID
   * @param data - Address data
   * @returns Created address
   */
  async addAccountAddress(accountId: string, data: AddressData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/company/address`, data);
      return response.data;
    }, 'Error adding account address');
  }

  /**
   * Create a flow for the account
   * @param accountId - Account ID
   * @param data - Flow data
   * @param prompt - Optional prompt
   * @param altanerComponentId - Optional altaner component ID
   * @returns Created flow
   */
  async createFlow(
    accountId: string,
    data: any,
    prompt?: string,
    altanerComponentId?: string
  ): Promise<any> {
    return this.execute(async () => {
      let url = `/account/${accountId}/flow`;

      // Build query parameters
      const params: string[] = [];
      if (prompt) {
        params.push(`prompt=${encodeURIComponent(prompt)}`);
      }
      if (altanerComponentId) {
        params.push(`altaner_component_id=${encodeURIComponent(altanerComponentId)}`);
      }

      // Add query parameters to URL if any exist
      if (params.length > 0) {
        url = `${url}?${params.join('&')}`;
      }

      const response = await optimai.post(url, data);
      return response.data.flow;
    }, 'Error creating flow');
  }

  /**
   * Create a room for the account
   * @param accountId - Account ID
   * @param data - Room data
   * @returns Created room
   */
  async createRoom(accountId: string, data: any): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/room`, data);
      return response.data.room;
    }, 'Error creating room');
  }

  /**
   * Create API token for account
   * @param accountId - Account ID
   * @param tokenDetails - Token configuration
   * @returns Token and API key
   */
  async createAPIToken(accountId: string, tokenDetails: any): Promise<{ token: string; api_key: any }> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/api-token`, tokenDetails);
      return { token: response.data.token, api_key: response.data.api_key };
    }, 'Error creating API token');
  }

  /**
   * Create invitation for account or organization
   * @param destinationType - 'workspace' or 'organisation'
   * @param destinationId - Account ID or Organisation ID
   * @param inviteData - Invitation data
   * @returns Invitation result
   */
  async createInvitation(
    destinationType: 'workspace' | 'organisation',
    destinationId: string,
    inviteData: {
      mode: 'link' | 'email';
      role_ids: string[];
      email?: string;
      name?: string;
      meta_data?: any;
    }
  ): Promise<any> {
    return this.execute(async () => {
      const endpoint = destinationType === 'workspace' ? `account/${destinationId}` : `org/${destinationId}`;
      const response = await optimai.post(`/${endpoint}/invite`, inviteData);
      return response.data;
    }, 'Error creating invitation');
  }

  /**
   * Create a webhook for the account
   * @param accountId - Account ID
   * @param data - Webhook data
   * @returns Created webhook
   */
  async createWebhook(accountId: string, data: any): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/hook`, data);
      return response.data.hook;
    }, 'Error creating webhook');
  }

  /**
   * Fetch webhook events
   * @param accountId - Account ID
   * @param webhookId - Webhook ID
   * @returns Webhook events
   */
  async fetchWebhookEvents(accountId: string, webhookId: string): Promise<any[]> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/gq`, {
        '@fields': ['id'],
        webhooks: {
          '@fields': ['id'],
          '@filter': { id: { _eq: webhookId } },
          events: {
            '@fields': '@all',
          },
        },
      });

      const webhook = response.data.webhooks.items[0];
      return webhook?.events?.items || [];
    }, 'Error fetching webhook events');
  }
}

// Singleton instance
let accountServiceInstance: AccountService | null = null;

/**
 * Get AccountService singleton instance
 * @returns AccountService instance
 */
export const getAccountService = (): AccountService => {
  if (!accountServiceInstance) {
    accountServiceInstance = new AccountService();
  }
  return accountServiceInstance;
};

