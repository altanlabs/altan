/**
 * Simple Dependency Injection Container
 * Manages service registration and lazy instantiation
 */
import type { IContainer, ServiceFactory } from './types';

export class Container implements IContainer {
  private services: Map<string, unknown>;
  private factories: Map<string, ServiceFactory>;

  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  /**
   * Register a service factory
   * @param name - Service name
   * @param factory - Factory function that returns service instance
   */
  register<T = unknown>(name: string, factory: ServiceFactory<T>): void {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for '${name}' must be a function`);
    }
    this.factories.set(name, factory as ServiceFactory);
  }

  /**
   * Get a service instance (lazy instantiation)
   * @param name - Service name
   * @returns Service instance
   */
  get<T = unknown>(name: string): T {
    // Return cached instance if available
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    // Get factory
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service '${name}' not registered in container`);
    }

    // Create and cache instance
    try {
      const instance = factory(this);
      this.services.set(name, instance);
      return instance as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to instantiate service '${name}': ${message}`);
    }
  }

  /**
   * Check if a service is registered
   * @param name - Service name
   * @returns True if service is registered
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * Reset service instance(s)
   * Forces re-instantiation on next get()
   * @param name - Service name to reset, or undefined to reset all
   */
  reset(name?: string): void {
    if (name) {
      this.services.delete(name);
    } else {
      this.services.clear();
    }
  }

  /**
   * Get all registered service names
   * @returns Array of service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.factories.keys());
  }
}

