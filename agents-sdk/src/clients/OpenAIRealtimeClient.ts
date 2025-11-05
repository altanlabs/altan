/**
 * OpenAI Realtime API Client (WebRTC)
 * Based on OpenAI's official console implementation
 */

import type { 
  AgentConfig, 
  ClientCallbacks, 
  ClientTools, 
  ConnectionStatus, 
  OpenAIRealtimeEvent,
  VoiceClient 
} from '../types';

export class OpenAIRealtimeClient implements VoiceClient {
  private agentId: string;
  private agentConfig: AgentConfig;
  private clientTools: ClientTools;
  
  // WebRTC references
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  
  // State
  private status: ConnectionStatus = 'idle';
  private isMuted: boolean = false;
  
  // Callbacks
  private callbacks?: ClientCallbacks;
  private onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;
  private onToolCall: ((toolName: string, args: Record<string, unknown>) => void) | null = null;

  constructor(agentId: string, agentConfig: AgentConfig, clientTools: ClientTools = {}) {
    this.agentId = agentId;
    this.agentConfig = agentConfig;
    this.clientTools = clientTools;
  }

  /**
   * Mute/unmute microphone
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    // Mute all audio tracks
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    
    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach((sender) => {
        if (sender.track?.kind === 'audio') {
          sender.track.enabled = !muted;
        }
      });
    }
    
    console.log('[OpenAI]', muted ? '🔇 Muted' : '🔊 Unmuted');
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Start WebRTC session
   */
  async startSession(callbacks: ClientCallbacks = {}): Promise<boolean> {
    try {
      // CRITICAL: Clean up any existing connection first
      if (this.peerConnection) {
        console.log('[OpenAI] Cleaning up existing peer connection before starting new session');
        this.cleanup();
      }
      
      this.status = 'connecting';
      this.callbacks = callbacks; // Store all callbacks
      this.onStatusChange = callbacks.onStatusChange;
      this.onError = callbacks.onError;
      this.onToolCall = callbacks.onToolCall;
      
      if (this.onStatusChange) {
        this.onStatusChange('connecting');
      }

      // Create NEW RTCPeerConnection
      console.log('[OpenAI] Creating NEW RTCPeerConnection');
      const pc = new RTCPeerConnection();
      this.peerConnection = pc;

      // Set up audio element to auto-play remote audio
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      this.audioElement = audioEl;
      
      pc.ontrack = (e) => {
        console.log('[OpenAI] Received remote audio track');
        audioEl.srcObject = e.streams[0];
      };

      // Request microphone access and add track
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;
      pc.addTrack(stream.getTracks()[0]);

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events');
      this.dataChannel = dc;

      // Handle data channel events
      dc.addEventListener('open', () => {
        console.log('[OpenAI] Data channel opened');
        this.status = 'connected';
        if (this.onStatusChange) {
          this.onStatusChange('connected');
        }
        if (callbacks.onConnect) {
          callbacks.onConnect();
        }
      });

      dc.onmessage = (e) => {
        if (this.status !== 'idle') {
          this.handleDataChannelMessage(e.data, callbacks);
        }
      };

      dc.onclose = () => {
        console.log('[OpenAI] Data channel closed');
        if (this.status !== 'idle') {
          this.cleanup();
          callbacks.onDisconnect?.();
        }
      };

      dc.addEventListener('error', (error) => {
        console.error('[OpenAI] Data channel error:', error);
        this.handleError(new Error('Data channel error'));
      });

      // Generate SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP offer to backend
      const response = await this.sendSDPOffer(offer.sdp);
      
      // Apply SDP answer
      const answer = {
        type: 'answer',
        sdp: response,
      };
      await pc.setRemoteDescription(answer);

      console.log('[OpenAI] WebRTC peer connection established');
      return true;
    } catch (error) {
      console.error('[OpenAI] Failed to start session:', error);
      this.handleError(error);
      this.cleanup();
      return false;
    }
  }

  /**
   * Send SDP offer to backend
   */
  private async sendSDPOffer(sdp: string): Promise<string> {
    const formData = new FormData();
    formData.append('sdp', sdp);
    
    const response = await fetch(
      `https://api.altan.ai/platform/agent/${this.agentId}/openai-realtime-webrtc`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Handle incoming data channel messages
   */
  private handleDataChannelMessage(data: string, callbacks: ClientCallbacks = {}): void {
    try {
      const event: OpenAIRealtimeEvent = JSON.parse(data);

      // Handle errors
      if (event.type === 'error' && event.error) {
        console.error('[OpenAI] API error:', event.error);
        this.handleError(new Error(event.error.message));
        return;
      }

      // Handle function/tool calls
      if (event.type === 'response.function_call_arguments.done') {
        this.handleToolCall(event);
      }

      // Pass all messages to callback for transcript handling
      if (callbacks.onMessage) {
        callbacks.onMessage(event);
      }
    } catch (error) {
      console.error('[OpenAI] Error parsing message:', error);
    }
  }

  /**
   * Handle tool calls from the agent
   */
  private async handleToolCall(event: OpenAIRealtimeEvent): Promise<void> {
    const toolName = event.name;
    const callId = event.call_id;
    
    if (!toolName || !callId) {
      console.warn('[OpenAI] Invalid tool call event - missing name or call_id');
      return;
    }
    
    try {
      const args: Record<string, unknown> = event.arguments ? JSON.parse(event.arguments) : {};
      console.log(`[OpenAI] Tool call: ${toolName}`, args);

      // Notify callback
      if (this.onToolCall) {
        this.onToolCall(toolName, args);
      }

      // Execute registered client tool
      if (this.clientTools[toolName]) {
        const result = await this.clientTools[toolName](args);
        
        // Send result back via data channel
        this.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(result),
          },
        });
      } else {
        console.warn(`[OpenAI] Tool ${toolName} not registered`);
        
        // Send error response
        this.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify({
              success: false,
              error: `Tool ${toolName} not found`,
            }),
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[OpenAI] Tool execution error:`, error);
      
      // Send error response
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({
            success: false,
            error: errorMessage,
          }),
        },
      });
    }
  }

  /**
   * Send event via data channel
   */
  private sendEvent(event: OpenAIRealtimeEvent): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      event.event_id = event.event_id || crypto.randomUUID();
      this.dataChannel.send(JSON.stringify(event));
    } else {
      console.warn('[OpenAI] Cannot send event - data channel not open');
    }
  }

  /**
   * Send a text message as the user
   * This creates a user message item in the conversation
   */
  sendUserMessage(text: string): void {
    if (!text.trim()) {
      console.warn('[OpenAI] Cannot send empty message');
      return;
    }

    console.log('[OpenAI] 📤 Sending user text message:', text);
    
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    });

    // Trigger response generation
    this.sendEvent({
      type: 'response.create',
    });
  }

  /**
   * Create a user message without triggering a response
   * Useful for adding context before generating a response
   */
  createUserMessage(text: string): void {
    if (!text.trim()) {
      console.warn('[OpenAI] Cannot create empty message');
      return;
    }

    console.log('[OpenAI] 📝 Creating user message (no response):', text);
    
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    });
  }

  /**
   * Stop the session - IMMEDIATE
   */
  async stopSession(): Promise<boolean> {
    console.log('[OpenAI] 🛑 Stopping...');
    
    // IMMEDIATELY stop everything
    this.status = 'idle';
    
    // Remove event listeners FIRST to stop events
    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.onopen = null;
      this.dataChannel.onclose = null;
      this.dataChannel.onerror = null;
    }
    
    this.cleanup();
    
    // Call disconnect after cleanup
    const disconnectCallback = this.callbacks?.onDisconnect;
    if (disconnectCallback) {
      disconnectCallback();
    }
    
    if (this.onStatusChange) {
      this.onStatusChange('idle');
    }
    
    console.log('[OpenAI] ✅ Stopped');
    return true;
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    // Audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    // Data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Stop ALL tracks
    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach((sender) => {
        sender.track?.stop();
      });
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.status = 'idle';
    this.isMuted = false;
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.status = 'error';
    if (this.onError) {
      this.onError(error);
    }
    if (this.onStatusChange) {
      this.onStatusChange('error');
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionStatus {
    return this.status;
  }
}

