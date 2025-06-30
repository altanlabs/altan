/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
import { Mic } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';

import { useSelector , dispatch } from '@redux/store';

import { cn } from '../../lib/utils';
import { selectAccount, sendMessage } from '../../redux/slices/room';
import { optimai_agent } from '../../utils/axios';

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscript?: (text: string) => void;
  visualizerBars?: number;
  className?: string;
  threadId?: string;
}

export interface AIVoiceInputHandle {
  stopRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
}

const selectAccountId = (state) => selectAccount(state)?.id;

export const AIVoiceInput = forwardRef<AIVoiceInputHandle, AIVoiceInputProps>(
  function AIVoiceInputInner(props, ref) {
    const accountId = useSelector(selectAccountId);
    const { onStart, onStop, onTranscript, visualizerBars = 48, className, threadId } = props;
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [transcribing, setTranscribing] = useState(false);

    // Refs for recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async (): Promise<void> => {
      try {
        audioChunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Be explicit about the codec
        const mimeType = 'audio/webm;codecs=opus';

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(1000);
        setRecording(true);
        onStart?.();
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    const stopRecording = async (): Promise<void> => {
      if (!mediaRecorderRef.current) {
        return;
      }

      return new Promise((resolve) => {
        const mediaRecorder = mediaRecorderRef.current;
        if (!mediaRecorder) {
          resolve();
          return;
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus'  // Match the exact MIME type with codec
          });

          // Stop all tracks
          if (mediaRecorder && mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach((track) => {
              track.stop();
            });
          }

          setRecording(false);
          onStop?.(time);
          void processRecording(audioBlob);
          resolve();
        };

        try {
          mediaRecorder.stop();
        } catch (error) {
          resolve();
        }
      });
    };

    const processRecording = async (audioBlob: Blob): Promise<void> => {
      try {
        setTranscribing(true);

        // Convert Blob to base64
        const base64Content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
            const base64 = reader.result?.toString().split(',')[1] || '';
            resolve(base64);
          };
          reader.readAsDataURL(audioBlob);
        });

        // Prepare the request payload according to AudioTranscriptionRequest
        const payload = {
          file_name: 'recording.webm',
          mime_type: 'audio/webm;codecs=opus',
          file_content: base64Content,
          model: 'whisper-1',
          response_format: 'json',
          temperature: 0,
          meta_data: {}
        };

        try {
          const response = await optimai_agent.post(
            `/services/stt?account_id=${accountId}`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
            }
          );
          if (response?.data?.data?.transcription) {
            const transcription = response.data.data.transcription;
            
            // If we have a threadId, send as message directly
            if (props.threadId) {
              await dispatch(sendMessage({
                threadId: props.threadId,
                content: transcription,
                attachments: []
              }));
            } else {
              // Only call onTranscript if we're not sending as a message
              onTranscript?.(transcription);
            }
          }
        } catch (error) {
          if (error.response) {
            console.error('Error response:', {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers,
            });
          }
        }
      } catch (error) {
        console.error('Error in processRecording:', error);
      } finally {
        setTranscribing(false);
        console.log('Transcribing complete');
      }
    };

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        stopRecording: async () => {
          return stopRecording();
        },
        startRecording: async () => {
          return startRecording();
        },
      }),
      [],
    );

    // Start recording automatically when component mounts
    useEffect(() => {
      setIsClient(true);

      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        // Use void to explicitly ignore the Promise
        void startRecording();
      }, 100);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer effect
    useEffect(() => {
      let intervalId: NodeJS.Timeout;

      if (recording) {
        // Start the timer when recording begins
        intervalId = setInterval(() => {
          setTime((t) => t + 1);
        }, 1000);
      } else {
        // Reset the timer when recording stops
        setTime(0);
      }

      return () => clearInterval(intervalId);
    }, [recording]);

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleButtonClick = (): void => {
      if (recording) {
        void stopRecording();
      } else {
        void startRecording();
      }
    };

    return (
      <div className={cn('w-full py-6', className)}>
        <div className="relative w-full mx-auto flex items-center flex-col gap-5">
          {/* Recording button */}
          <button
            className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-800/80 shadow-md"
            type="button"
            onClick={handleButtonClick}
            disabled={transcribing}
          >
            {recording ? (
              <div
                className="w-8 h-8 rounded-sm animate-spin bg-white/90 cursor-pointer"
                style={{ animationDuration: '2s' }}
              />
            ) : transcribing ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white/80" />
            )}
          </button>

          {/* Timer */}
          <span className="font-mono text-xl font-medium text-white">{formatTime(time)}</span>

          {/* Visualizer bars */}
          <div className="h-8 w-3/4 flex items-center justify-center gap-1">
            {[...Array(visualizerBars)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-none transition-all duration-200 w-1',
                  recording ? 'bg-blue-500' : 'bg-white/10 h-1',
                )}
                style={
                  recording && isClient
                    ? {
                        height: `${10 + Math.random() * 100}%`,
                      }
                    : undefined
                }
              />
            ))}
          </div>

          {transcribing && <div className="text-sm text-blue-300 mt-1">Transcribing...</div>}
        </div>
      </div>
    );
  },
);
