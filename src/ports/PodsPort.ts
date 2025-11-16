/**
 * Pods Port - Domain interface for interface/pods operations
 * Handles UI interfaces, deployments, and code operations
 */

export interface Interface {
  id: string;
  name: string;
  account_id: string;
  status: string;
  [key: string]: unknown;
}

export interface InterfaceData {
  name: string;
  account_id: string;
  [key: string]: unknown;
}

export interface InterfaceUpdates {
  name?: string;
  status?: string;
  [key: string]: unknown;
}

export interface DomainData {
  domain: string;
  [key: string]: unknown;
}

export interface CollaboratorData {
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface CommitData {
  message: string;
  files?: string[];
  [key: string]: unknown;
}

export interface CommitResult {
  hash: string;
  message: string;
  [key: string]: unknown;
}

export interface SearchReplaceData {
  search: string;
  replace: string;
  files?: string[];
  [key: string]: unknown;
}

export interface SearchReplaceResult {
  modified_files: string[];
  matches_count: number;
  [key: string]: unknown;
}

export interface CommitDetails {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  files: string[];
  [key: string]: unknown;
}

export interface DeployOptions {
  environment?: string;
  branch?: string;
  [key: string]: unknown;
}

export interface DeploymentResult {
  id: string;
  status: string;
  url?: string;
  [key: string]: unknown;
}

export interface DeploymentStatus {
  id: string;
  status: string;
  progress?: number;
  [key: string]: unknown;
}

export interface OperationResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for interface/pods operations
 */
export abstract class PodsPort {
  // ==================== Interface Operations ====================

  /**
   * Fetch interface details
   * @param interfaceId - Interface ID
   * @returns Interface data
   */
  abstract fetchInterface(interfaceId: string): Promise<Interface>;

  /**
   * Create interface
   * @param interfaceData - Interface configuration
   * @returns Created interface
   */
  abstract createInterface(interfaceData: InterfaceData): Promise<Interface>;

  /**
   * Update interface
   * @param interfaceId - Interface ID
   * @param updates - Interface updates
   * @returns Updated interface
   */
  abstract updateInterface(interfaceId: string, updates: InterfaceUpdates): Promise<Interface>;

  /**
   * Delete interface
   * @param interfaceId - Interface ID
   */
  abstract deleteInterface(interfaceId: string): Promise<void>;

  // ==================== Domain Operations ====================

  /**
   * Add domain to interface
   * @param interfaceId - Interface ID
   * @param domainData - Domain configuration
   * @returns Added domain
   */
  abstract addDomain(interfaceId: string, domainData: DomainData): Promise<DomainData>;

  /**
   * Remove domain from interface
   * @param interfaceId - Interface ID
   * @param domain - Domain name
   */
  abstract removeDomain(interfaceId: string, domain: string): Promise<void>;

  // ==================== Repository Operations ====================

  /**
   * Add collaborator to repository
   * @param interfaceId - Interface ID
   * @param collaboratorData - Collaborator configuration
   * @returns Result
   */
  abstract addCollaborator(interfaceId: string, collaboratorData: CollaboratorData): Promise<OperationResult>;

  /**
   * Commit changes
   * @param interfaceId - Interface ID
   * @param commitData - Commit message and options
   * @returns Commit result
   */
  abstract commitChanges(interfaceId: string, commitData: CommitData): Promise<CommitResult>;

  /**
   * Restore dev branch to main
   * @param interfaceId - Interface ID
   * @returns Result
   */
  abstract restoreDevToMain(interfaceId: string): Promise<OperationResult>;

  /**
   * Clear cache and restart
   * @param interfaceId - Interface ID
   * @returns Result
   */
  abstract clearCacheAndRestart(interfaceId: string): Promise<OperationResult>;

  /**
   * Search and replace in files
   * @param interfaceId - Interface ID
   * @param searchReplaceData - Search/replace configuration
   * @returns Result
   */
  abstract searchReplaceFiles(interfaceId: string, searchReplaceData: SearchReplaceData): Promise<SearchReplaceResult>;

  // ==================== Commit Operations ====================

  /**
   * Fetch commit details by hash
   * @param interfaceId - Interface ID
   * @param hash - Commit hash
   * @returns Commit details
   */
  abstract fetchCommitDetails(interfaceId: string, hash: string): Promise<CommitDetails>;

  /**
   * Restore to a specific commit
   * @param interfaceId - Interface ID
   * @param hash - Commit hash
   */
  abstract restoreCommit(interfaceId: string, hash: string): Promise<void>;

  // ==================== Deployment Operations ====================

  /**
   * Deploy interface
   * @param interfaceId - Interface ID
   * @param deployOptions - Deployment options
   * @returns Deployment result
   */
  abstract deploy(interfaceId: string, deployOptions?: DeployOptions): Promise<DeploymentResult>;

  /**
   * Get deployment status
   * @param interfaceId - Interface ID
   * @returns Deployment status
   */
  abstract getDeploymentStatus(interfaceId: string): Promise<DeploymentStatus>;
}

