/**
 * ElevenLabs Conversational AI Client
 * Wrapper around @elevenlabs/react useConversation
 */

import type { AgentConfig, ClientCallbacks, ElevenLabsConversation, VoiceClient } from '../types';

// Global storage for captured media streams (outside the class)
const globalMediaStreams: MediaStream[] = [];

export class ElevenLabsClient implements VoiceClient {
  private elevenlabsAgentId: string;
  private agentConfig: AgentConfig;
  private conversation: ElevenLabsConversation;
  private isMuted: boolean = false;
  private previousVolume: number = 1.0;
  private audioTracks: MediaStreamTrack[] = [];
  private getUserMediaInterceptor: (() => void) | null = null;

  constructor(elevenlabsAgentId: string, agentConfig: AgentConfig, conversationHook: ElevenLabsConversation) {
    this.elevenlabsAgentId = elevenlabsAgentId;
    this.agentConfig = agentConfig;
    
    // Store the conversation hook instance (from provider)
    this.conversation = conversationHook;
    
    // Set up getUserMedia interceptor BEFORE session starts
    this.setupGetUserMediaInterceptor();
  }

  /**
   * Intercept getUserMedia to capture the microphone stream
   */
  private setupGetUserMediaInterceptor(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn('[ElevenLabs] navigator.mediaDevices not available');
      return;
    }

    // Store the original getUserMedia
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    
    // Override it
    navigator.mediaDevices.getUserMedia = async (constraints: MediaStreamConstraints) => {
      console.log('[ElevenLabs] getUserMedia intercepted, constraints:', constraints);
      const stream = await originalGetUserMedia(constraints);
      
      if (constraints.audio) {
        // Store the stream globally
        globalMediaStreams.push(stream);
        this.audioTracks = stream.getAudioTracks();
        console.log('[ElevenLabs] ✅ Captured audio tracks:', this.audioTracks.length);
        
        // Apply current mute state if already muted
        if (this.isMuted) {
          this.audioTracks.forEach(track => {
            track.enabled = false;
            console.log('[ElevenLabs] Track muted on capture');
          });
        }
      }
      
      return stream;
    };
    
    this.getUserMediaInterceptor = () => {
      // Restore original on cleanup
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    };
    
    console.log('[ElevenLabs] getUserMedia interceptor installed');
  }

  /**
   * Try to re-capture audio tracks from stored streams
   */
  private refreshAudioTracks(): void {
    // Try to get from global storage
    if (globalMediaStreams.length > 0) {
      const latestStream = globalMediaStreams[globalMediaStreams.length - 1];
      this.audioTracks = latestStream.getAudioTracks();
      console.log('[ElevenLabs] Refreshed audio tracks from global storage:', this.audioTracks.length);
      return;
    }
    
    // Try to find in conversation object
    const conv = this.conversation as any;
    if (conv.mediaStream) {
      this.audioTracks = conv.mediaStream.getAudioTracks();
      console.log('[ElevenLabs] Found audio tracks in conversation.mediaStream:', this.audioTracks.length);
    } else if (conv.audioStream) {
      this.audioTracks = conv.audioStream.getAudioTracks();
      console.log('[ElevenLabs] Found audio tracks in conversation.audioStream:', this.audioTracks.length);
    } else {
      console.log('[ElevenLabs] No audio tracks found. Available properties:', Object.keys(this.conversation));
    }
  }

  /**
   * Start ElevenLabs conversation
   */
  async startSession(callbacks: ClientCallbacks = {}): Promise<boolean> {
    try {
      console.log('[ElevenLabs] Starting session with agent:', this.elevenlabsAgentId);

      // Get language from overrides or agent config
      const defaultLanguage = this.agentConfig.voice?.meta_data?.language || 'en';
      const language = callbacks.language || defaultLanguage;

      // Prepare overrides
      const sessionOverrides = {
        agent: {
          language,
          ...(callbacks.prompt && { 
            prompt: { 
              prompt: callbacks.prompt 
            } 
          }),
          ...(callbacks.firstMessage && { first_message: callbacks.firstMessage }),
        },
        ...(callbacks.tts && { tts: callbacks.tts }),
        ...(callbacks.conversation && { conversation: callbacks.conversation }),
      };

      console.log('[ElevenLabs] Session overrides:', sessionOverrides);

      // Start conversation with ElevenLabs
      // Note: Callbacks are handled in the provider's useConversation hook
      await this.conversation.startSession({
        agentId: this.elevenlabsAgentId,
        overrides: sessionOverrides,
      });

      // Try to capture audio tracks after session starts
      setTimeout(() => {
        this.refreshAudioTracks();
      }, 1000);

      return true;
    } catch (error) {
      console.error('[ElevenLabs] Failed to start session:', error);
      return false;
    }
  }

  /**
   * Stop the conversation
   */
  async stopSession(): Promise<boolean> {
    try {
      await this.conversation.endSession();
      
      // Clean up interceptor
      if (this.getUserMediaInterceptor) {
        this.getUserMediaInterceptor();
        this.getUserMediaInterceptor = null;
      }
      
      // Clear audio tracks
      this.audioTracks = [];
      
      return true;
    } catch (error) {
      console.error('[ElevenLabs] Error stopping session:', error);
      return false;
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.conversation.status || 'idle';
  }

  /**
   * Mute/unmute the microphone input
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    console.log(`[ElevenLabs] setMuted called with: ${muted}`);
    
    // Try to refresh audio tracks if we don't have any
    if (this.audioTracks.length === 0) {
      this.refreshAudioTracks();
    }
    
    // First try: Use ElevenLabs native setMuted
    if (this.conversation.setMuted) {
      this.conversation.setMuted(muted);
      console.log(muted ? '[ElevenLabs] 🔇 Microphone muted (SDK)' : '[ElevenLabs] 🔊 Microphone unmuted (SDK)');
      return;
    }
    
    // Second try: Control audio tracks directly
    if (this.audioTracks.length > 0) {
      this.audioTracks.forEach(track => {
        track.enabled = !muted;
      });
      console.log(muted ? '[ElevenLabs] 🔇 Microphone muted (tracks)' : '[ElevenLabs] 🔊 Microphone unmuted (tracks)');
      return;
    }
    
    // Fallback: mute output only
    console.warn('[ElevenLabs] No way to mute microphone found, muting output instead');
    if (this.conversation.setVolume) {
      if (muted) {
        this.conversation.setVolume(0);
        console.log('[ElevenLabs] 🔇 Output muted (fallback)');
      } else {
        this.conversation.setVolume(this.previousVolume);
        console.log('[ElevenLabs] 🔊 Output unmuted (fallback)');
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }
}

