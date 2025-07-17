import { useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AIVoiceInput } from '../AIVoiceInput';
import AltanAnimatedSvg from '../ui/AltanAnimatedSvg.jsx';
import Iconify from '../../iconify/Iconify.jsx';

const SpeechInputModal = ({ 
  open, 
  onClose, 
  onTranscript, 
  threadId,
}) => {
  const voiceInputRef = useRef(null);

  const handleSpeechStart = useCallback(() => {
    console.log('Speech recognition started');
  }, []);

  const handleSpeechStop = useCallback((duration) => {
    console.log('Speech recognition stopped, duration:', duration);
    // Don't close the modal automatically when recording stops
  }, []);

  const handleSendAndClose = useCallback((e) => {
    e.stopPropagation();
    if (voiceInputRef.current && voiceInputRef.current.stopRecording) {
      voiceInputRef.current.stopRecording().then(() => {
        setTimeout(() => onClose(), 500);
      });
    } else {
      onClose();
    }
  }, [onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-gray-900/95 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md rounded-xl p-6 bg-gray-900/90 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <AIVoiceInput
          ref={voiceInputRef}
          onTranscript={onTranscript}
          onStart={handleSpeechStart}
          onStop={handleSpeechStop}
          threadId={threadId}
          visualizerBars={32}
        />

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Iconify
              icon="mdi:close"
              className="text-lg"
            />
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSendAndClose}
            className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <span>Send</span>
            <AltanAnimatedSvg
              size={16}
              className="p-[2px] relative"
              pathClassName=""
            />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SpeechInputModal; 