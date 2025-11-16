import { RoomPort } from '../../ports/RoomPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Room HTTP Adapter
 * Implements RoomPort using HTTP/REST API
 */
export class RoomHttpAdapter extends RoomPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_room',
    });
  }

  // ==================== Room Operations ====================

  async fetchRoom(roomId) {
    return this.adapter.get(`/rooms/${roomId}`);
  }

  async fetchRoomByExternalId(externalId, accountId) {
    // Note: /external endpoint is at root level, not versioned
    return this.adapter.getRaw(`/external/${externalId}?account_id=${accountId}`);
  }

  async createRoom(roomData) {
    // Root endpoint for creating rooms (non-versioned)
    return this.adapter.postRaw('/', roomData);
  }

  async updateRoom(roomId, updates) {
    return this.adapter.patch(`/rooms/${roomId}`, updates);
  }

  async deleteRoom(roomId) {
    // Non-versioned delete endpoint
    return this.adapter.deleteRaw(`/${roomId}`);
  }

  async joinRoom(roomId) {
    // Non-versioned join endpoint
    return this.adapter.getRaw(`/${roomId}/join`);
  }

  async updateRoomMemory(roomId, updateMemory) {
    // Non-versioned memory endpoint
    return this.adapter.patchRaw(`/${roomId}/memory`, { update_memory: updateMemory });
  }

  async fetchUserRooms(options = {}) {
    const { cursor, limit } = options;
    let url = '/';
    const params = [];
    if (cursor) params.push(`cursor=${cursor}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    // Non-versioned endpoint
    return this.adapter.getRaw(url);
  }

  async searchRooms(query, options = {}) {
    const { limit = 50 } = options;
    // Non-versioned search endpoint
    return this.adapter.getRaw(`/?name=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // ==================== Thread Operations ====================

  async fetchThread(threadId) {
    return this.adapter.get(`/threads/${threadId}`);
  }

  async fetchThreads(roomId, options = {}) {
    const { limit = 100, cursor } = options;
    let url = `/rooms/${roomId}/threads?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    return this.adapter.get(url);
  }

  async createThread(roomId, threadData) {
    return this.adapter.post(`/rooms/${roomId}/threads`, threadData);
  }

  async createThreadFromMessage(messageId, threadData) {
    return this.adapter.post(`/messages/${messageId}/threads`, threadData);
  }

  async updateThread(threadId, updates) {
    return this.adapter.patch(`/threads/${threadId}`, updates);
  }

  async deleteThread(threadId) {
    return this.adapter.delete(`/threads/${threadId}`);
  }

  async markThreadRead(threadId, timestamp) {
    // Non-versioned endpoint
    return this.adapter.patchRaw(`/thread/${threadId}/read`, { timestamp });
  }

  async updateThreadVoiceStatus(threadId, voiceStatus) {
    // Non-versioned endpoint
    return this.adapter.patchRaw(`/thread/${threadId}/voice-status`, voiceStatus);
  }

  // ==================== Message Operations ====================

  async fetchMessages(threadId, options = {}) {
    const { limit = 25, cursor } = options;
    let url = `/threads/${threadId}/messages?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    return this.adapter.get(url);
  }

  async sendMessage(threadId, messageData, config = {}) {
    return this.adapter.post(`/threads/${threadId}/messages`, messageData, config);
  }

  async sendAgentMessage(threadId, agentId, messageData, config = {}) {
    return this.adapter.post(`/threads/${threadId}/messages?agent_id=${agentId}`, messageData, config);
  }

  async updateMessage(messageId, updates) {
    return this.adapter.patch(`/messages/${messageId}`, updates);
  }

  async deleteMessage(messageId) {
    return this.adapter.delete(`/messages/${messageId}`);
  }

  async addReaction(messageId, reactionData) {
    return this.adapter.post(`/messages/${messageId}/reactions`, reactionData);
  }

  // ==================== Member Operations ====================

  async fetchMembers(roomId, options = {}) {
    const { limit = 100 } = options;
    return this.adapter.get(`/rooms/${roomId}/members?limit=${limit}`);
  }

  async updateMember(roomId, action, body) {
    // Non-versioned endpoint
    return this.adapter.patchRaw(`/${roomId}/member/${action}`, body);
  }

  async inviteMembers(roomId, invitation) {
    // Non-versioned endpoint
    return this.adapter.postRaw(`/${roomId}/invite`, invitation);
  }

  async exitRoom(roomId) {
    // Non-versioned endpoint
    return this.adapter.postRaw(`/${roomId}/exit`);
  }

  // ==================== Media Operations ====================

  async createMedia(roomId, mediaData) {
    // Non-versioned endpoint - returns response.data directly from adapter
    const data = await this.adapter.postRaw(`/${roomId}/media`, mediaData);
    return data.media_url;
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}


