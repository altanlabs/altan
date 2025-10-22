import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to play audio files for agent messages
 * @param {string} audioFile - Path to audio file in public folder
 * @param {boolean} shouldPlay - Whether to play the audio
 * @param {function} onComplete - Callback when audio finishes
 */
export const useAudio = (audioFile, shouldPlay = false, onComplete) => {
  const audioRef = useRef(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!audioFile || !shouldPlay || hasPlayedRef.current) return;

    // Mark as played immediately to prevent duplicate plays
    hasPlayedRef.current = true;

    // Create audio element
    const audio = new Audio(audioFile);
    audioRef.current = audio;

    // Set up event listeners
    const handleEnded = () => {
      if (onComplete) {
        onComplete();
      }
      // Clean up after playback completes
      audio.src = '';
    };

    const handleError = (error) => {
      console.warn('Audio loading error:', error);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Play audio
    audio.play().catch((error) => {
      // Only log if it's not an abort error from cleanup
      if (error.name !== 'AbortError') {
        console.warn('Audio playback failed:', error);
      }
    });

    // Cleanup - only remove listeners, don't interrupt playback
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      // Don't pause or clear src here - let audio finish naturally
    };
  }, [audioFile, shouldPlay, onComplete]);

  // Reset hasPlayed when audioFile changes
  useEffect(() => {
    hasPlayedRef.current = false;
  }, [audioFile]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
  }, []);

  return { stop };
};

/**
 * Get the audio file path for a specific message
 * @param {string} messageKey - Key identifying the message
 * @returns {string|null} - Path to audio file or null
 */
export const getAudioForMessage = (messageKey) => {
  const audioMap = {
    // Demo Scene
    'altan-response': '/audio/agents/altan-response.mp3',
    'altan-recruitment': '/audio/agents/altan-recruitment.mp3',
    'cloud-intro': '/audio/agents/cloud-intro.mp3',
    'interface-intro': '/audio/agents/interface-intro.mp3',
    'services-intro': '/audio/agents/services-intro.mp3',
    'altan-planning': '/audio/agents/altan-planning.mp3',
    'altan-execution': '/audio/agents/altan-execution.mp3',
    'altan-complete': '/audio/agents/altan-complete.mp3',
  };

  return audioMap[messageKey] || null;
};

