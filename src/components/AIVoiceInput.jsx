import { Mic } from '@mui/icons-material';
import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';

import { selectAccountId } from '../redux/slices/general';
import { useSelector } from '../redux/store';
import { optimai_agent } from '../utils/axios';

const AIVoiceInput = forwardRef(function AIVoiceInputInner(props, ref) {
  const { onStart, onStop, onTranscript } = props;
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const accountId = useSelector(selectAccountId);

  // Refs for recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Be explicit about the codec
      const mimeType = 'audio/webm;codecs=opus';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
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

  const processRecording = async (audioBlob) => {
    try {
      setTranscribing(true);

      // Convert Blob to base64
      const base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64 = reader.result?.toString().split(',')[1] || '';
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Prepare the request payload
      const payload = {
        file_name: 'recording.webm',
        mime_type: 'audio/webm;codecs=opus',
        file_content: base64Content,
        model: 'whisper-1',
        response_format: 'json',
        temperature: 0,
        meta_data: {},
      };

      try {
        const response = await optimai_agent.post(`/services/stt?account_id=${accountId}`, payload);
        if (response?.data?.data?.transcription) {
          onTranscript?.(response.data.data.transcription);
        }
      } catch (error) {
        console.error('Error in transcription:', error);
      }
    } catch (error) {
      console.error('Error in processRecording:', error);
    } finally {
      setTranscribing(false);
    }
  };

  const stopRecording = async () => {
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
          type: 'audio/webm;codecs=opus',
        });

        // Stop all tracks
        if (mediaRecorder && mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach((track) => {
            track.stop();
          });
        }

        setRecording(false);
        onStop?.(time);
        processRecording(audioBlob);
        resolve();
      };

      try {
        mediaRecorder.stop();
      } catch {
        resolve();
      }
    });
  };

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      stopRecording,
      startRecording,
    }),
    [],
  );

  // Timer effect
  useEffect(() => {
    let intervalId;

    if (recording) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [recording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleButtonClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      className="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1 relative"
      onClick={handleButtonClick}
      disabled={transcribing}
      type="button"
    >
      {recording ? (
        <div
          className="w-5 h-5 rounded-sm animate-spin bg-red-500"
          style={{ animationDuration: '2s' }}
        />
      ) : transcribing ? (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Mic sx={{ fontSize: 20 }} />
      )}
      {recording && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono bg-gray-800 px-2 py-1 rounded">
          {formatTime(time)}
        </span>
      )}
    </button>
  );
});

export default AIVoiceInput;
