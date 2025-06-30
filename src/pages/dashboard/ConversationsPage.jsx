import { memo } from 'react';

import useMessageListener from '@hooks/useMessageListener.ts';

import { useSettingsContext } from '../../components/settings';
import { CompactLayout } from '../../layouts/dashboard';
import { selectAccountId } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';

const handleCopy = (data) => {
  try {
    navigator.clipboard.writeText(data);
  } catch (error) {
    console.error('Failed to copy text: ', error);
  }
};

const handleMessage = (event) => {
  if (event.data.type === 'COPY_TO_CLIPBOARD') handleCopy(event.data.text);
};

function ConversationsPage() {
  const id = useSelector(selectAccountId);
  const { themeMode } = useSettingsContext();

  useMessageListener(['https://app.altan.ai'], handleMessage);

  return (
    <CompactLayout
      title={'Conversations · Altan'}
      noPadding
    >
      <iframe
        src={`https://app.altan.ai/account/${id}/gates?theme=${themeMode}&header=${false}`}
        allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
        className="relative w-full h-full border-none"
      />
    </CompactLayout>
  );
}

export default memo(ConversationsPage);
