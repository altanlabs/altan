import { Stack } from '@mui/material';

import ReusableMap from './map/ReusableMap';

const MarkersMap = ({ widget, theme }) => {
  const data = widget.meta_data;
  const markers = data.markers.map(m => ({ ...m, lat: m.coordinates.latitude, lng: m.coordinates.longitude }));
  const defaultCoordinates = !!markers.length && markers[0].coordinates;
  return (
    <div style={{ padding: 4 }}>
      <Stack spacing={1.5} sx={{ height: 400, width: '100%', minWidth: 300 }}>
        <h3>{data.title || 'Select Location'}</h3>
        <ReusableMap latitude={defaultCoordinates.latitude} longitude={defaultCoordinates.longitude} markers={markers} theme={theme} />
      </Stack>
    </div>

  );
};

export default MarkersMap;
