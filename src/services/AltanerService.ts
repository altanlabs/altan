/**
 * Altaner Service - Business logic layer for altaner/project operations
 */
import { getPlatformPort } from '../di/index.ts';
import { BaseService } from './BaseService';
import type {
  IPlatformPort,
  Altaner,
  AltanerComponent,
  AltanersListResponse,
  FetchAltanersOptions,
  CreateAltanerData,
  UpdateAltanerData,
  UpdateAltanerComponentData,
  CreateAltanerComponentData,
  UpdateAltanerPositionsData,
} from './types';

/**
 * Response type for fetching a single altaner
 */
export interface FetchAltanerResponse {
  altaner: Altaner;
  frontend_preview_url?: string;
  frontend_live_url?: string;
}

/**
 * Altaner Service - Handles all altaner-related operations
 */
export class AltanerService extends BaseService {
  private port: IPlatformPort;

  constructor() {
    super();
    this.port = getPlatformPort<IPlatformPort>();
  }

  /**
   * Fetch altaner by ID
   * @param altanerId - Altaner ID
   * @returns Altaner data with frontend URLs
   */
  async getById(altanerId: string): Promise<FetchAltanerResponse> {
    return this.execute(
      async () => await this.port.fetchAltaner(altanerId),
      'Error fetching altaner',
    );
  }

  /**
   * Fetch list of altaners for an account
   * @param options - Query options (account_id, limit, offset)
   * @returns Altaners list with pagination
   */
  async getList(options: FetchAltanersOptions): Promise<AltanersListResponse> {
    return this.execute(
      async () => await this.port.fetchAltanersList(options),
      'Error fetching altaners list',
    );
  }

  /**
   * Create a new altaner
   * @param accountId - Account ID
   * @param data - Altaner configuration
   * @param idea - Optional idea parameter
   * @returns Created altaner
   */
  async create(accountId: string, data: CreateAltanerData, idea?: string): Promise<Altaner> {
    return this.execute(
      async () => await this.port.createAltaner(accountId, data, idea),
      'Error creating altaner',
    );
  }

  /**
   * Update an altaner
   * @param altanerId - Altaner ID
   * @param data - Altaner updates
   * @returns Updated altaner
   */
  async update(altanerId: string, data: UpdateAltanerData): Promise<Altaner> {
    return this.execute(
      async () => await this.port.updateAltaner(altanerId, data),
      'Error updating altaner',
    );
  }

  /**
   * Delete an altaner
   * @param altanerId - Altaner ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(altanerId: string): Promise<void> {
    return this.execute(
      async () => await this.port.deleteAltaner(altanerId),
      'Error deleting altaner',
    );
  }

  /**
   * Update altaner positions
   * @param altanerId - Altaner ID
   * @param data - Positions update data
   * @returns Updated altaner
   */
  async updatePositions(altanerId: string, data: UpdateAltanerPositionsData): Promise<Altaner> {
    return this.execute(
      async () => {
        const response = await this.port.updateAltanerPositions(altanerId, data);
        return response.altaner;
      },
      'Error updating altaner positions',
    );
  }

  // ==================== Component Operations ====================

  /**
   * Create an altaner component
   * @param altanerId - Altaner ID
   * @param data - Component configuration
   * @returns Created component
   */
  async createComponent(
    altanerId: string,
    data: CreateAltanerComponentData,
  ): Promise<AltanerComponent> {
    return this.execute(
      async () => {
        const response = await this.port.createAltanerComponent(altanerId, data);
        return response.component;
      },
      'Error creating altaner component',
    );
  }

  /**
   * Update an altaner component
   * @param altanerId - Altaner ID
   * @param componentId - Component ID
   * @param data - Component updates
   * @returns Updated component
   */
  async updateComponent(
    altanerId: string,
    componentId: string,
    data: UpdateAltanerComponentData,
  ): Promise<AltanerComponent> {
    return this.execute(
      async () => {
        const response = await this.port.updateAltanerComponent(altanerId, componentId, data);
        return response.component;
      },
      'Error updating altaner component',
    );
  }

  /**
   * Update an altaner component by ID only
   * @param componentId - Component ID
   * @param data - Component updates
   * @returns Updated component
   */
  async updateComponentById(
    componentId: string,
    data: UpdateAltanerComponentData,
  ): Promise<AltanerComponent> {
    return this.execute(
      async () => {
        const response = await this.port.updateAltanerComponentById(componentId, data);
        return response.component;
      },
      'Error updating altaner component',
    );
  }

  /**
   * Delete an altaner component
   * @param componentId - Component ID
   * @returns Promise that resolves when deletion is complete
   */
  async deleteComponent(componentId: string): Promise<void> {
    return this.execute(
      async () => await this.port.deleteAltanerComponent(componentId),
      'Error deleting altaner component',
    );
  }
}

// Singleton instance
let altanerServiceInstance: AltanerService | null = null;

/**
 * Get AltanerService singleton instance
 * @returns AltanerService instance
 */
export const getAltanerService = (): AltanerService => {
  if (!altanerServiceInstance) {
    altanerServiceInstance = new AltanerService();
  }
  return altanerServiceInstance;
};

