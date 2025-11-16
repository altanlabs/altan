/**
 * Commit Service - Business logic layer for commit operations
 * Implements Single Responsibility Principle by handling commit-specific business logic
 */
import { getPodsPort } from '../di';
import { BaseService } from './BaseService';
import type { IPodsPort, Commit } from './types';

/**
 * Commit Service - Handles all commit-related operations
 */
export class CommitService extends BaseService {
  private port: IPodsPort;

  constructor() {
    super();
    this.port = getPodsPort<IPodsPort>();
  }

  /**
   * Fetch commit details by hash
   * @param interfaceId - Interface ID
   * @param hash - Commit hash
   * @returns Commit details
   */
  async fetchCommitDetails(interfaceId: string, hash: string): Promise<Commit> {
    return this.execute(async () => {
      const data = await this.port.fetchCommitDetails(interfaceId, hash);
      return data;
    }, 'Error fetching commit details');
  }

  /**
   * Restore to a specific commit
   * @param interfaceId - Interface ID
   * @param hash - Commit hash
   */
  async restoreCommit(interfaceId: string, hash: string): Promise<void> {
    return this.execute(async () => {
      await this.port.restoreCommit(interfaceId, hash);
    }, 'Error restoring commit');
  }
}

// Singleton instance
let commitServiceInstance: CommitService | null = null;

/**
 * Get or create CommitService instance
 * @returns CommitService instance
 */
export const getCommitService = (): CommitService => {
  if (!commitServiceInstance) {
    commitServiceInstance = new CommitService();
  }
  return commitServiceInstance;
};

