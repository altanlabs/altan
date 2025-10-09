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
    
    // If voice is not enabled, don't show voice-specific states
    if (!isVoiceEnabled) {
      return null; // Use regular SendButton
    }

    if (isVoiceConnecting) {
      return {
        icon: <div className="animate-spin">⟳</div>,
        text: 'Connecting...',
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        disabled: true,
      };
    }

    if (isVoiceActive) {
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

    if (!isSendEnabled) {
      return {
        icon: <MicrophoneSvg />,
        text: 'Start Voice',
        className: 'hover:bg-blue-600 text-white',
        disabled: false,
      };
    }

    return null; // Use regular SendButton
  }, [isVoiceConnecting, isVoiceActive, isSendEnabled, isVoiceEnabled, hasActiveGeneration, onStopGeneration]);

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
