import { useTheme } from '@mui/material';
import { memo } from 'react';

import AltanerFrame from './AltanerFrame.jsx';
import { selectAccountId } from '../../../../redux/slices/general/index.ts';
import { useSelector } from '../../../../redux/store.ts';

const GateFrame = ({ id }) => {
  const accountId = useSelector(selectAccountId);
  const theme = useTheme();
  return (
    <AltanerFrame
      title={`iframe-gate-${id}`}
      url={`https://app.altan.ai/account/${accountId}/gates/${id}?theme=${theme.palette.mode}`}
      allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
    />
  );
};

export default memo(GateFrame);
