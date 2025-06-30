import {
  Card, CardMedia, useTheme,
  Box, Tooltip, Typography, IconButton, Stack,
} from '@mui/material';
import { memo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Pagination, Navigation, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import RoomDetailsCard from './roomrow/RoomDetailsCard.jsx';
import { fetchPublicRooms, selectRoomStateInitialized } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store.tsx';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-flip';
import SearchIconButton from '../../../sections/circle/SearchButton.jsx';
import { bgBlur } from '../../../utils/cssStyles';
import Iconify from '../../iconify/Iconify.jsx';

const selectPublicRooms = (state) => state.room.publicRooms;
const selectPublicRoomsInit = selectRoomStateInitialized('publicRooms');

const PublicRooms = () => {
  const publicRooms = useSelector(selectPublicRooms);
  const initialized = useSelector(selectPublicRoomsInit);
  const history = useHistory();;
  const theme = useTheme();
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchPublicRooms());
    }
  }, [initialized]);

  const handleJoinRoom = useCallback((roomId) => history.push(`/room/${roomId}`), [history]);

  return (
    <Card sx={{ height: '225px', px: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', my: 1 }}>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          <Typography color="text.secondary" variant="h6" sx={{ ml: 1 }}>
            Trending rooms
          </Typography>
          <IconButton
            size="small"
            className="arrow-left"
          >
            <Iconify icon="mdi:chevron-left" />
          </IconButton>
          <IconButton
            size="small"
            className="arrow-right"
          >
            <Iconify icon="mdi:chevron-right" />
          </IconButton>
        </Stack>
        <SearchIconButton />
      </Box>

      <Swiper
        slidesPerView={'auto'}
        modules={[Pagination, Navigation, Mousewheel]}
        direction="horizontal"
        mousewheel={{
          forceToAxis: true,
          thresholdDelta: 10,
        }}
        navigation={{ nextEl: '.arrow-right', prevEl: '.arrow-left' }}
        spaceBetween={4}
        breakpoints={{
          '480': {
            slidesPerView: 2,
          },
          '640': {
            slidesPerView: 4,
          },
          '800': {
            slidesPerView: 5,
          },
        }}
      >

        {publicRooms.map((room) => (
          <SwiperSlide key={room.id}>
            <Card
              onClick={() => history.push(`/room/${room.id}`)}
              sx={{
                textAlign: 'center',
                background: 'black',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                overflow: 'hidden',
                transition: 'opacity 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.5,
                },
              }}
            >
              <CardMedia
                component="img"
                alt={room.name}
                image={room?.avatar_url || room?.account?.company?.logo_url || '/assets/globe.png'}
                sx={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                }}
              />
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                width="100%"
              >
                <Tooltip
                  title={(
                    <RoomDetailsCard
                      room={room.id}
                      account={room.account}
                      onClick={() => handleJoinRoom(room.id)}
                    />
                  )}
                  arrow
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        position: 'relative',
                        borderRadius: '5%',
                        width: '50vw',
                        maxWidth: '600px',
                        padding: 0,
                        ...bgBlur({ opacity: 0.2, blur: 5, color: theme.palette.mode === 'dark' ? '#000' : '#bbb' }),

                      },
                    },
                  }}
                >
                  <Iconify
                    icon="mdi:info-outline"
                    width={15}
                  />
                </Tooltip>
                <Typography
                  variant="subtitle2"
                  sx={{ my: 1, color: 'white' }}
                  noWrap
                >
                  {room?.name || 'anonymous room'}
                </Typography>
              </Stack>
            </Card>
          </SwiperSlide>

        ))}
      </Swiper>

    </Card>
  );
};

export default memo(PublicRooms);
