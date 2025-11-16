/**
 * Media Service - Business logic layer for media operations
 * Implements Single Responsibility Principle by handling media-specific business logic
 */
import { BaseService } from './BaseService';
import type {
  IPlatformPort,
  MediaItem,
  Media3D,
  MediaListResponse,
  Media3DListResponse,
  CreateMedia3DData,
} from './types';
import { getPlatformPort } from '../di/index';

/**
 * GraphQL query for fetching media
 */
const MEDIA_GQ_QUERY = {
  '@fields': ['id'],
  media: {
    '@fields': ['@base@exc:meta_data', 'file_name', 'mime_type'],
    '@filter': { is_chat: { _eq: 'false' } },
    '@paginate': { limit: 1000, order_by: 'date_creation', desc: 'true' },
  },
  media3D: {
    '@fields': '@all',
    '@paginate': { limit: 25, order_by: 'date_creation', desc: 'true' },
  },
};

/**
 * Media Service - Handles all media-related operations
 */
export class MediaService extends BaseService {
  private port: IPlatformPort;

  constructor() {
    super();
    this.port = getPlatformPort<IPlatformPort>();
  }

  /**
   * Fetch account media and 3D models
   * @param accountId - Account ID
   * @returns Media and 3D models
   */
  async fetchAccountMedia(accountId: string): Promise<{
    media: MediaListResponse;
    media3D: Media3DListResponse;
  }> {
    return this.execute(async () => {
      const response = await this.port.fetchAccountMedia(accountId, MEDIA_GQ_QUERY);
      
      if (response.id !== accountId) {
        throw new Error('Invalid account response');
      }

      return {
        media: response.media,
        media3D: response.media3D,
      };
    }, 'Error fetching account media');
  }

  /**
   * Create/upload media
   * @param accountId - Account ID
   * @param fileName - File name
   * @param fileType - MIME type
   * @param fileContent - Base64 file content
   * @returns Media URL
   */
  async createMedia(
    accountId: string,
    fileName: string,
    fileType: string,
    fileContent: string
  ): Promise<{ media: MediaItem; mediaUrl: string }> {
    return this.execute(async () => {
      const response = await this.port.createMedia(accountId, {
        file_name: fileName,
        mime_type: fileType,
        file_content: fileContent,
      });

      return {
        media: response.media,
        mediaUrl: response.media_url,
      };
    }, 'Error creating media');
  }

  /**
   * Delete media
   * @param mediaId - Media ID
   */
  async deleteMedia(mediaId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.deleteMedia(mediaId);
    }, 'Error deleting media');
  }

  /**
   * Create 3D model
   * @param accountId - Account ID
   * @param data - 3D model data
   * @returns Created 3D model
   */
  async createMedia3D(accountId: string, data: CreateMedia3DData): Promise<Media3D> {
    return this.execute(async () => {
      const response = await this.port.createMedia3D(accountId, data);
      return response.media;
    }, 'Error creating 3D model');
  }

  /**
   * Delete 3D model
   * @param modelId - Model ID
   */
  async deleteMedia3D(modelId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.deleteMedia3D(modelId);
    }, 'Error deleting 3D model');
  }
}

// Singleton instance
let mediaServiceInstance: MediaService | null = null;

/**
 * Get or create MediaService instance
 * @returns MediaService instance
 */
export const getMediaService = (): MediaService => {
  if (!mediaServiceInstance) {
    mediaServiceInstance = new MediaService();
  }
  return mediaServiceInstance;
};

