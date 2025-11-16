import { BaseHttpAdapter } from './BaseHttpAdapter';
import { AgentPort } from '../../ports/AgentPort';

/**
 * Agent HTTP Adapter
 * Implements AgentPort using HTTP/REST API
 */
export class AgentHttpAdapter extends AgentPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_agent',
    });
  }

  async stopAgentResponse(responseId) {
    return this.adapter.post(`activation/response/${responseId}/stop`);
  }

  async stopThreadGeneration(threadId) {
    return this.adapter.delete(`activations/threads/${threadId}/responses`);
  }

  async retryResponse(retryData) {
    return this.adapter.post('activations/retry', retryData);
  }

  async listVoices(options = {}) {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.nextPageToken) params.append('next_page_token', options.nextPageToken);

    const queryString = params.toString();
    const url = queryString ? `list-voices?${queryString}` : 'list-voices';

    // Note: This endpoint is on platform API, not agent API
    // We'll need to handle this differently or move to PlatformPort
    return this.adapter.get(url);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}
