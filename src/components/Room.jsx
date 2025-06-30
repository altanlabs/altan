import { memo, useCallback } from 'react';

import useMessageListener from '@hooks/useMessageListener.ts';

import { useSettingsContext } from './settings';

const Room = ({ roomId, header = false }) => {
  const themeMode = useSettingsContext();

  const handleCopy = useCallback((data) => {
    try {
      navigator.clipboard.writeText(data);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  const handleMessage = useCallback(
    (event) => {
      if (event.data.type === 'COPY_TO_CLIPBOARD') handleCopy(event.data.text);
    },
    [handleCopy],
  );

  useMessageListener(['https://app.altan.ai', 'https://app.altan.ai'], handleMessage);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <iframe
        title="Master Room"
        src={`https://app.altan.ai/room/${roomId}?header=${header}&theme=${themeMode}`}
        allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
};

export default memo(Room);
