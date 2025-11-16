/**
 * Base Service - Shared error handling for all services
 * Implements DRY principle by centralizing error handling logic
 */

/**
 * Base service class providing standardized error handling
 */
export class BaseService {
  /**
   * Execute operation with standardized error handling
   * @param operation - Async operation to execute
   * @param errorContext - Context for error messages
   * @returns Result of the operation
   */
  protected async execute<T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorContext}:`, error);
      throw error;
    }
  }
}

