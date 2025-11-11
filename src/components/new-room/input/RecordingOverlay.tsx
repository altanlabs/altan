import React from 'react';
import { createPortal } from 'react-dom';
import { LiveWaveform } from '../../elevenlabs/ui/live-waveform.tsx';
import Iconify from '../../iconify/Iconify.jsx';

interface RecordingOverlayProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onCancel: () => void;
  onAccept: () => void;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  isRecording,
  isTranscribing,
  onCancel,
  onAccept,
}) => {
  if (!isRecording && !isTranscribing) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
      <div className="w-full max-w-xl flex items-center gap-3 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-2.5 shadow-2xl">
        {/* Cancel Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          disabled={isTranscribing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50"
        >
          <Iconify icon="mdi:close" className="text-lg text-white/90" />
        </button>

        {/* Live Waveform */}
        <div className="flex-1 min-w-0 text-white">
          <LiveWaveform
            active={isRecording}
            processing={isTranscribing}
            mode="static"
            height={40}
            barWidth={3}
            barGap={2}
          />
        </div>

        {/* Accept Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          disabled={isTranscribing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all disabled:opacity-50"
        >
          {isTranscribing ? (
            <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Iconify icon="mdi:check" className="text-lg text-white/90" />
          )}
        </button>
      </div>
    </div>,
    document.body
  );
};

