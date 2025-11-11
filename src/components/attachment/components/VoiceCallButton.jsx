import { useMemo } from 'react';

import { Button } from '../../../components/ui/Button.jsx';
import { selectRoom } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';
import Iconify from '../../iconify/Iconify.jsx';
import SendButton from '../SendButton.jsx';
import MicrophoneSvg from '../ui/MicrophoneSvg.jsx';

const VoiceCallButton = ({
  isVoiceActive,
  isVoiceConnecting,
  isSendEnabled,
  onSendMessage,
  hasActiveGeneration = false,
  onStopGeneration = null,
  isRecording = false,
  isTranscribing = false,
  onStartRecording = null,
}) => {
  // Get room and check if voice is enabled
  const room = useSelector(selectRoom);
  const isVoiceEnabled = room?.policy?.voice_enabled;

  // Determine button appearance
  const buttonContent = useMemo(() => {
    // If agent is generating, show stop button
    if (hasActiveGeneration && onStopGeneration) {
      return {
        icon: (
          <Iconify
            icon="mdi:stop"
            className="text-xl"
          />
        ),
        text: 'Stop',
        className: 'bg-red-500 hover:bg-red-600 text-white',
        disabled: false,
        onClick: onStopGeneration,
      };
    }

    // If transcribing, show loading spinner
    if (isTranscribing) {
      return {
        icon: (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ),
        text: 'Transcribing...',
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
        disabled: true,
      };
    }

    // If recording, show recording indicator
    if (isRecording) {
      return {
        icon: (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        ),
        text: 'Recording...',
        className: 'bg-red-500 hover:bg-red-600 text-white',
        disabled: true,
      };
    }

    // Legacy: If voice is enabled and connecting/active
    if (isVoiceEnabled && isVoiceConnecting) {
      return {
        icon: <div className="animate-spin">⟳</div>,
        text: 'Connecting...',
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        disabled: true,
      };
    }

    if (isVoiceEnabled && isVoiceActive) {
      return {
        icon: (
          <Iconify
            icon="mdi:phone-hangup"
            className="text-xl"
          />
        ),
        text: 'End Call',
        className: 'bg-red-500 hover:bg-red-600 text-white',
        disabled: false,
      };
    }

    // When disabled (no text), show microphone for transcription
    if (!isSendEnabled) {
      return {
        icon: (
          <Iconify
            icon="mdi:microphone"
            className="text-xl"
          />
        ),
        text: 'Record & Transcribe',
        className: 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
        disabled: false,
        onClick: onStartRecording,
      };
    }

    return null; // Use regular SendButton
  }, [isVoiceConnecting, isVoiceActive, isSendEnabled, isVoiceEnabled, hasActiveGeneration, onStopGeneration, isRecording, isTranscribing, onStartRecording]);

  if (buttonContent) {
    return (
      <Button
        onClick={buttonContent.onClick || onSendMessage}
        disabled={buttonContent.disabled}
        title={buttonContent.text}
        size="icon"
        className="rounded-full aspect-square"
      >
        {buttonContent.icon}
      </Button>
    );
  }

  return (
    <SendButton
      onSendMessage={onSendMessage}
      isDisabled={!isSendEnabled}
    />
  );
};

export default VoiceCallButton;
