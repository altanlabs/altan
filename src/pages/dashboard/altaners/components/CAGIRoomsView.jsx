import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect, memo, useCallback } from 'react';

import { selectAccountId } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store';
import { optimai_room } from '../../../../utils/axios';

// Move formatExternalId outside the component
const formatExternalId = (type, id) => {
  switch (type) {
    case 'interface':
      return `interface_${id}`;
    case 'base':
      return `base_${id}`;
    case 'flows':
      return `workflow_${id}`;
    default:
      return id;
  }
};

const RoomFrame = memo(({ roomId, title }) => {
  const theme = useTheme();

  if (!roomId) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <iframe
          src={`https://app.altan.ai/room/${roomId}?theme=${theme.palette.mode}&header=${false}&input=${false}`}
          allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title={`Room ${title}`}
        />
      </Box>
    </Box>
  );
});

RoomFrame.displayName = 'RoomFrame';

const CAGIRoomsView = ({ altanerId, components }) => {
  const [rooms, setRooms] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const accountId = useSelector(selectAccountId);

  const fetchRooms = useCallback(async () => {
    if (!altanerId || !components || Object.keys(components).length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      const allRooms = {};

      for (const [componentId, component] of Object.entries(components)) {
        if (!component) continue;

        const { type, params } = component;

        if (type === 'interface' && params?.id) {
          try {
            const externalId = formatExternalId(type, params.id);
            const response = await optimai_room.get(
              `/external/${externalId}?account_id=${accountId}`,
            );
            allRooms[componentId] = {
              roomId: response.data.room.id,
              title: component.name || `Interface ${componentId}`,
              type: 'interface',
              externalId,
            };
          } catch (error) {
            continue;
          }
        } else if (['base', 'flows', 'forms'].includes(type) && params?.ids?.length > 0) {
          allRooms[componentId] = {
            externalIds: params.ids,
            title:
              component.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${componentId}`,
            type,
            rooms: [],
          };

          for (const id of params.ids) {
            try {
              const externalId = formatExternalId(type, id);
              const response = await optimai_room.get(
                `/external/${externalId}?account_id=${accountId}`,
              );
              allRooms[componentId].rooms.push({
                roomId: response.data.room.id,
                externalId,
                originalId: id,
              });
            } catch (error) {
              continue;
            }
          }
        }
      }

      setRooms(allRooms);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [altanerId, components, accountId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading rooms...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading rooms: {error.message}</Typography>
      </Box>
    );
  }

  if (Object.keys(rooms).length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No rooms found for this altaner.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 0,
      }}
    >
      <Grid
        container
        spacing={2}
        wrap="nowrap"
        sx={{
          flex: 1,
          height: '100%',
          m: 0,
          width: '100%',
          p: 2,
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {(() => {
          // Calculate total number of rooms
          const totalRooms = Object.values(rooms).reduce((acc, room) => {
            if (room.type === 'interface') return acc + 1;
            return acc + room.rooms.length;
          }, 0);

          // Each room takes equal width of the container
          const flexBasis = `${100 / totalRooms}%`;

          return Object.entries(rooms)
            .map(([componentId, room]) => {
              if (room.type === 'interface') {
                return (
                  <Grid
                    item
                    xs={12}
                    sx={{
                      height: '100%',
                      position: 'relative',
                      p: 1,
                      flex: 1,
                      flexBasis,
                      minWidth: 0,
                    }}
                    key={componentId}
                  >
                    <RoomFrame
                      roomId={room.roomId}
                      title={room.title}
                    />
                  </Grid>
                );
              }

              return room.rooms.map((subRoom, index) => (
                <Grid
                  item
                  xs={12}
                  sx={{
                    height: '100%',
                    position: 'relative',
                    p: 1,
                    flex: 1,
                    flexBasis,
                    minWidth: 0,
                  }}
                  key={`${componentId}-${subRoom.originalId || index}`}
                >
                  <RoomFrame
                    roomId={subRoom.roomId}
                    title={`${room.title} - ${subRoom.originalId || index + 1}`}
                  />
                </Grid>
              ));
            })
            .flat();
        })()}
      </Grid>
    </Box>
  );
};

export default memo(CAGIRoomsView);
