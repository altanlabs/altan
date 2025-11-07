import {
  Box,
  Typography,
  Button,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';

import { optimai } from '../../../../utils/axios';
import Iconify from '../../../iconify';

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'ash', name: 'Ash' },
  { id: 'ballad', name: 'Ballad' },
  { id: 'cedar', name: 'Cedar' },
  { id: 'coral', name: 'Coral' },
  { id: 'echo', name: 'Echo' },
  { id: 'marin', name: 'Marin' },
  { id: 'sage', name: 'Sage' },
  { id: 'shimmer', name: 'Shimmer' },
  { id: 'verse', name: 'Verse' },
  // Additional voices sometimes present in docs
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' },
];

// Attempt preview from OpenAI CDN following the alloy pattern
const getPreviewUrl = (voiceId) => `https://cdn.openai.com/API/voice-previews/${voiceId}.flac`;

export default function OpenAIVoiceConfig({ agentData, settings, onSettingChange }) {
  const [isTestingRealtime, setIsTestingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const audioElementRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const currentAudioRef = useRef(null);
  const [playingUrl, setPlayingUrl] = useState(null);

  const playPreview = useCallback(
    (url) => {
      if (!url) return;

      if (playingUrl === url && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
        setPlayingUrl(null);
        return;
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setPlayingUrl(url);

      audio.play().catch(() => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      });

      audio.onended = () => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      };
      audio.onerror = () => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      };
    },
    [playingUrl],
  );

  const handleVoiceChange = (voiceId) => {
    const prev = settings.openai_config || {};
    onSettingChange('openai_config', {
      ...prev,
      voice_id: voiceId,
      preview_url: getPreviewUrl(voiceId),
    });
  };

  const handleTestRealtime = async () => {
    setIsTestingRealtime(true);
    setRealtimeError(null);
    setRealtimeStatus('Initializing WebRTC...');

    try {
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      setRealtimeStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;
      pc.addTrack(stream.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.addEventListener('open', () => {
        setRealtimeStatus('Connected! Say something...');
      });
      dc.addEventListener('message', (e) => {
        const event = JSON.parse(e.data);
        if (event.type === 'error') {
          setRealtimeError(event.error.message);
        }
      });
      dc.addEventListener('close', () => {
        setRealtimeStatus(null);
        setIsTestingRealtime(false);
      });

      setRealtimeStatus('Creating WebRTC offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setRealtimeStatus('Connecting to OpenAI...');
      const formData = new FormData();
      formData.append('sdp', offer.sdp);
      const response = await optimai.post(
        `/agent/${agentData.id}/openai-realtime-webrtc`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const answer = { type: 'answer', sdp: response.data };
      await pc.setRemoteDescription(answer);
    } catch (error) {
      setRealtimeError(error.message || 'Failed to start session');
      setIsTestingRealtime(false);

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const stopRealtimeTest = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    setIsTestingRealtime(false);
    setRealtimeStatus(null);
  };

  useEffect(() => {
    return () => {
      if (dataChannelRef.current) dataChannelRef.current.close();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.getSenders().forEach((sender) => {
          if (sender.track) sender.track.stop();
        });
        peerConnectionRef.current.close();
      }
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioElementRef.current) audioElementRef.current.srcObject = null;
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
    };
  }, []);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: 'text.primary' }}
        >
          OpenAI Voice
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={isTestingRealtime ? stopRealtimeTest : handleTestRealtime}
          disabled={isTestingRealtime && !realtimeStatus}
          startIcon={
            isTestingRealtime ? (
              <Iconify
                icon="mdi:stop"
                width={16}
              />
            ) : (
              <Iconify
                icon="mdi:play"
                width={16}
              />
            )
          }
          color={isTestingRealtime ? 'error' : 'primary'}
        >
          {isTestingRealtime ? 'Stop Test' : 'Test Realtime'}
        </Button>
      </Box>

      {realtimeStatus && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
        >
          {realtimeStatus}
        </Alert>
      )}
      {realtimeError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {realtimeError}
        </Alert>
      )}

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 2 }}
      >
        Select an OpenAI voice and preview a sample.
      </Typography>

      <RadioGroup
        value={settings.openai_config?.voice_id || 'alloy'}
        onChange={(e) => handleVoiceChange(e.target.value)}
      >
        {OPENAI_VOICES.map((voice) => {
          const url = getPreviewUrl(voice.id);
          const isPlaying = playingUrl === url;
          return (
            <Box
              key={voice.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 1,
              }}
            >
              <FormControlLabel
                value={voice.id}
                control={<Radio size="small" />}
                label={voice.name}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(url);
                }}
                color={isPlaying ? 'primary' : 'default'}
              >
                <Iconify
                  icon={isPlaying ? 'heroicons:pause' : 'heroicons:play'}
                  width={18}
                />
              </IconButton>
            </Box>
          );
        })}
      </RadioGroup>
    </Box>
  );
}

OpenAIVoiceConfig.propTypes = {
  agentData: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  onSettingChange: PropTypes.func.isRequired,
};
