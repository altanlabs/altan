/**
 * Template Service - Business logic layer for template operations
 */
import { BaseService } from './BaseService';
import type {
  TemplatesListResponse,
  FetchTemplatesOptions,
  Account,
  TemplateVersion,
} from './types';
import { optimai } from '../utils/axios';

export interface FetchCategoryTemplatesOptions extends FetchTemplatesOptions {
  category?: string;
}

export interface FetchTemplateVersionResponse {
  template_version: TemplateVersion & Record<string, unknown>;
}

/**
 * Template Service - Handles all template-related operations
 */
export class TemplateService extends BaseService {
  /**
   * Fetch templates with pagination and filters
   * @param options - Fetch options including limit, offset, search, account_id, template_type
   * @returns Templates list response
   */
  async fetchTemplates(options: FetchTemplatesOptions = {}): Promise<TemplatesListResponse> {
    return this.execute(async () => {
      const {
        limit = 100,
        offset = 0,
        template_type,
        account_id,
        name,
      } = options;

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (template_type) {
        params.append('template_type', template_type);
      }

      if (account_id) {
        params.append('account_id', account_id);
      }

      if (name) {
        params.append('name', name);
      }

      const response = await optimai.get<TemplatesListResponse>(
        `/templates/list?${params}`
      );
      return {
        templates: response.data.templates || [],
        total_count: response.data.total_count || 0,
      };
    }, 'Error fetching templates');
  }

  /**
   * Fetch templates by category
   * @param options - Fetch options including category, limit, offset, template_type
   * @returns Templates list response
   */
  async fetchCategoryTemplates(
    options: FetchCategoryTemplatesOptions = {}
  ): Promise<TemplatesListResponse> {
    return this.execute(async () => {
      const {
        limit = 50,
        offset = 0,
        template_type = 'altaner',
        category,
      } = options;

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        template_type,
      });

      // Add category filter for specific categories
      if (category && category !== 'uncategorized') {
        params.append('category', category);
      }

      const response = await optimai.get<TemplatesListResponse>(
        `/templates/list?${params}`
      );
      return {
        templates: response.data.templates || [],
        total_count: response.data.total_count || 0,
      };
    }, 'Error fetching category templates');
  }

  /**
   * Fetch template version by ID
   * @param id - Template version ID
   * @returns Template version data
   */
  async fetchTemplateVersion(
    id: string
  ): Promise<TemplateVersion & Record<string, unknown>> {
    return this.execute(async () => {
      const response = await optimai.get<FetchTemplateVersionResponse>(
        `/templates/versions/${id}`
      );
      return response.data.template_version;
    }, 'Error fetching template version');
  }

  /**
   * Create a new template version
   * @param templateId - ID of the template
   * @param data - Version data including version type, name, description
   * @returns Created template version
   */
  async createTemplateVersion(templateId: string, data: any): Promise<TemplateVersion> {
    return this.execute(async () => {
      const response = await optimai.post<{ template_version: TemplateVersion }>(
        `/templates/${templateId}/version`,
        data
      );
      return response.data.template_version;
    }, 'Error creating template version');
  }

  /**
   * Fetch public account details
   * @param accountId - Account ID
   * @returns Account data
   */
  async fetchAccountPublic(accountId: string): Promise<Account> {
    return this.execute(async () => {
      const response = await optimai.get<{ account: Account }>(
        `/account/${accountId}/public`
      );
      return response.data.account;
    }, 'Error fetching account data');
  }
}

// Singleton instance
let templateServiceInstance: TemplateService | null = null;

/**
 * Get TemplateService singleton instance
 * @returns TemplateService instance
 */
export const getTemplateService = (): TemplateService => {
  if (!templateServiceInstance) {
    templateServiceInstance = new TemplateService();
  }
  return templateServiceInstance;
};

