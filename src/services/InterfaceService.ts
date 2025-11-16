/**
 * InterfaceService - Handles interface file operations and repository management
 * Implements business logic for file tree, file operations, and git operations
 */

import { BaseService } from './BaseService';
import { getOptimaiPods } from '../di';
import type { AxiosInstance } from 'axios';

// ==================== Types ====================

/**
 * File tree node
 */
export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
  [key: string]: unknown;
}

/**
 * File tree response
 */
export interface FileTreeResponse {
  tree?: FileTreeNode;
  [key: string]: unknown;
}

/**
 * File content response
 */
export interface FileContentResponse {
  content: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Create file data
 */
export interface CreateFileData {
  file_name: string;
  content: string;
}

/**
 * Create directory data
 */
export interface CreateDirectoryData {
  path: string;
}

/**
 * Commit data
 */
export interface CommitData {
  message: string;
}

/**
 * Diff changes response
 */
export interface DiffChangesResponse {
  [key: string]: unknown;
}

/**
 * Accept changes data
 */
export interface AcceptChangesData {
  message: string;
}

// ==================== Service ====================

/**
 * InterfaceService - Service for managing interface files and repositories
 */
export class InterfaceService extends BaseService {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    super();
    this.axiosInstance = axiosInstance;
  }

  /**
   * Fetch file tree for an interface
   * @param interfaceId - Interface ID
   * @param includeHidden - Whether to include hidden files
   * @returns File tree structure
   */
  async fetchFileTree(
    interfaceId: string,
    includeHidden: boolean = false
  ): Promise<FileTreeNode | null> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post<FileTreeResponse>(
        `/interfaces/dev/${interfaceId}/files/list-tree-json`,
        { include_hidden: includeHidden }
      );
      return response.data.tree || response.data as unknown as FileTreeNode || null;
    }, `Error fetching file tree for interface ${interfaceId}`);
  }

  /**
   * Read file content
   * @param interfaceId - Interface ID
   * @param path - File path
   * @returns File content
   */
  async readFile(interfaceId: string, path: string): Promise<FileContentResponse> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post<FileContentResponse>(
        `/interfaces/dev/${interfaceId}/files/read`,
        path
      );
      return response.data;
    }, `Error reading file ${path} for interface ${interfaceId}`);
  }

  /**
   * Create or update a file
   * @param interfaceId - Interface ID
   * @param data - File data (file_name and content)
   * @returns Response data
   */
  async createFile(interfaceId: string, data: CreateFileData): Promise<unknown> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post(
        `/interfaces/dev/${interfaceId}/files/create`,
        data
      );
      return response.data;
    }, `Error creating file ${data.file_name} for interface ${interfaceId}`);
  }

  /**
   * Create a directory
   * @param interfaceId - Interface ID
   * @param data - Directory data (path)
   * @returns Response data
   */
  async createDirectory(interfaceId: string, data: CreateDirectoryData): Promise<unknown> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post(
        `/interfaces/dev/${interfaceId}/files/create-directory`,
        data
      );
      return response.data;
    }, `Error creating directory ${data.path} for interface ${interfaceId}`);
  }

  /**
   * Commit changes to repository
   * @param interfaceId - Interface ID
   * @param data - Commit data (message)
   * @returns Response data
   */
  async commitChanges(interfaceId: string, data: CommitData): Promise<unknown> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post(
        `/interfaces/dev/${interfaceId}/repo/commit`,
        data
      );
      return response.data;
    }, `Error committing changes for interface ${interfaceId}`);
  }

  /**
   * Fetch diff changes
   * @param interfaceId - Interface ID
   * @returns Diff changes
   */
  async fetchDiffChanges(interfaceId: string): Promise<DiffChangesResponse> {
    return this.execute(async () => {
      const response = await this.axiosInstance.get<DiffChangesResponse>(
        `/interfaces/dev/${interfaceId}/changes`
      );
      return response.data;
    }, `Error fetching diff changes for interface ${interfaceId}`);
  }

  /**
   * Accept changes
   * @param interfaceId - Interface ID
   * @param data - Accept changes data (message)
   * @returns Response data
   */
  async acceptChanges(interfaceId: string, data: AcceptChangesData): Promise<unknown> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post(
        `/interfaces/dev/${interfaceId}/accept-changes`,
        data
      );
      return response.data;
    }, `Error accepting changes for interface ${interfaceId}`);
  }

  /**
   * Discard changes
   * @param interfaceId - Interface ID
   * @returns Response data
   */
  async discardChanges(interfaceId: string): Promise<unknown> {
    return this.execute(async () => {
      const response = await this.axiosInstance.post(
        `/interfaces/dev/${interfaceId}/discard-changes`
      );
      return response.data;
    }, `Error discarding changes for interface ${interfaceId}`);
  }
}

// ==================== Singleton ====================

let interfaceServiceInstance: InterfaceService | null = null;

/**
 * Get the singleton instance of InterfaceService
 * @returns InterfaceService instance
 */
export const getInterfaceService = (): InterfaceService => {
  if (!interfaceServiceInstance) {
    const axiosInstance = getOptimaiPods();
    interfaceServiceInstance = new InterfaceService(axiosInstance);
  }
  return interfaceServiceInstance;
};

