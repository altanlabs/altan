// cancellationManager.ts
import { AxiosRequestConfig } from 'axios';

export class RequestCancellationManager {
  private controllers: Map<string, AbortController> = new Map();

  // Simple djb2 hash function to generate a compact hash string.
  private hashString(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    // Convert to an unsigned 32-bit integer, then to base36 for a compact string.
    return (hash >>> 0).toString(36);
  }

  // Generate a unique key based on request details.
  getRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    const keyData = JSON.stringify({ method, url, params, data });
    return this.hashString(keyData);
  }

  // Add a new request controller. If a duplicate exists, cancel it.
  add(config: AxiosRequestConfig) {
    const key = this.getRequestKey(config);

    // Cancel duplicate request if it exists.
    if (this.controllers.has(key)) {
      this.controllers.get(key)?.abort('Canceled duplicate request');
      this.controllers.delete(key);
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    // Optionally store the key in the headers for later removal.
    // config.headers = { ...config.headers, 'x-request-key': key };
    this.controllers.set(key, controller);
    // return config;
  }

  // Remove the controller once the request is finished.
  remove(config: AxiosRequestConfig) {
    let key: string | undefined;
    if (config.headers && config.headers['x-request-key']) {
      key = config.headers['x-request-key'] as string;
    } else {
      key = this.getRequestKey(config);
    }
    this.controllers.delete(key);
  }

  // Cancel a specific request by key.
  cancel(key: string, message: string = 'Operation canceled') {
    if (this.controllers.has(key)) {
      this.controllers.get(key)?.abort(message);
      this.controllers.delete(key);
    }
  }

  // Cancel all active requests.
  cancelAll(message: string = 'Operation canceled') {
    this.controllers.forEach((controller) => {
      controller.abort(message);
    });
    this.controllers.clear();
  }
}
