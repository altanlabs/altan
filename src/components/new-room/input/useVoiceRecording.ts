import { useState, useCallback, useRef, useEffect } from 'react';
import { optimai_room } from '../../../utils/axios';
import { dispatch } from '../../../redux/store';
import { sendMessage, addThread, setThreadMain } from '../../../redux/slices/room';
import analytics from '../../../lib/analytics';

interface UseVoiceRecordingProps {
  threadId: string;
  roomId: string;
  selectedAgent: any;
  onAgentClear: () => void;
  enqueueSnackbar: (message: string, options: any) => void;
}

export const useVoiceRecording = ({
  threadId,
  roomId,
  selectedAgent,
  onAgentClear,
  enqueueSnackbar,
}: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const shouldTranscribeRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let options = { mimeType: 'audio/mp4' };
      if (!MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/webm' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const baseMimeType = mediaRecorder.mimeType.split(';')[0];
        const blob = new Blob(audioChunksRef.current, { type: baseMimeType });

        if (audioChunksRef.current.length > 0) {
          setAudioBlob(blob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      enqueueSnackbar('Failed to access microphone', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      shouldTranscribeRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
      setAudioBlob(null);
    }
  }, [isRecording]);

  const acceptRecording = useCallback(() => {
    if (isRecording) {
      shouldTranscribeRef.current = true;
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  const transcribeAudio = useCallback(
    async (blob: Blob) => {
      setIsTranscribing(true);

      try {
        const formData = new FormData();
        const mimeType = blob.type;
        const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
        formData.append('file', blob, `recording.${extension}`);

        const baseUrl = 'https://d9e17293-cf6.db-pool-europe-west1.altan.ai';
        const response = await fetch(
          `${baseUrl}/services/api/transcription_storage/transcribe-and-store`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.text) {
          let messageContent = result.text;

          // Prepend agent mention if selected
          if (selectedAgent) {
            messageContent = `**[@${selectedAgent.name}](/member/${selectedAgent.id})**\n\n${result.text}`;
          }

          if (threadId === 'new') {
            // Create thread first
            const threadName = messageContent.substring(0, 50).trim() || 'New Chat';
            const threadResponse = await optimai_room.post(`/v2/rooms/${roomId}/threads`, {
              name: threadName,
            });
            const newThread = threadResponse.data;

            dispatch(addThread(newThread));
            dispatch(setThreadMain({ current: newThread.id }));

            await dispatch(
              sendMessage({
                threadId: newThread.id,
                content: messageContent,
                attachments: [],
              }),
            );
          } else {
            await dispatch(
              sendMessage({
                content: messageContent,
                attachments: [],
                threadId,
              }),
            );
          }

          analytics.featureUsed('speech_to_text', {
            thread_id: threadId,
            text_length: result.text.length,
          });

          setAudioBlob(null);
          onAgentClear();
        } else {
          throw new Error(result.error || 'Transcription failed');
        }
      } catch (err: any) {
        enqueueSnackbar(err.message || 'Failed to transcribe audio', { variant: 'error' });
      } finally {
        setIsTranscribing(false);
      }
    },
    [threadId, roomId, selectedAgent, onAgentClear, enqueueSnackbar],
  );

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (!isRecording && audioBlob && !isTranscribing && shouldTranscribeRef.current) {
      shouldTranscribeRef.current = false;
      const timer = setTimeout(() => {
        transcribeAudio(audioBlob);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRecording, audioBlob, isTranscribing, transcribeAudio]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    cancelRecording,
    acceptRecording,
  };
};
