import { useTheme } from '@mui/material';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { EffectCreative } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import DrawerToggle from './drawer/DrawerToggle.jsx';
import RoomContent from './RoomContent.jsx';
import Threads from './Threads.jsx';
import GeneralToolbar from '../../layouts/room/GeneralToolbar.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import {
  selectRoom,
  selectRoomId,
  selectRoomThreadMain,
  selectThreadDrawerDetails,
} from '../../redux/slices/room';

const selectIsCreation = (state) => selectThreadDrawerDetails(state)?.isCreation;

const MobileRoom = ({
  // New personalization options
  tabs = true,
  conversation_history = true,
  members = true,
  settings = true,
  show_close_button = false,
  show_fullscreen_button = false,
  show_sidebar_button = false,
  onFullscreen,
  onSidebar,
  onClose,
} = {}) => {
  const { isOpen, subscribe, unsubscribe } = useWebSocket();
  const theme = useTheme();
  const isCreation = useSelector(selectIsCreation);

  const [swiper, setSwiper] = useState(null);
  const [swiperActiveIndex, setSwiperActiveIndex] = useState(0);
  const threadInMain = useSelector(selectRoomThreadMain);
  const room = useSelector(selectRoom);
  const roomId = useSelector(selectRoomId);

  const DRAWER_INDEX = 0;
  const MAIN_INDEX = 1;

  // Scoped Swiper styles to prevent affecting parent page
  const swiperStyles = {
    height: 'calc(100% - 100px)',
    minHeight: '-webkit-fill-available',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'relative',
    overflow: 'hidden',
    listStyle: 'none',
    padding: 0,
    zIndex: 1,
  };

  const swiperSlideStyles = {
    flexShrink: 0,
    width: '100%',
    height: '100%',
    position: 'relative',
    transitionProperty: 'transform',
  };

  useEffect(() => {
    if (!!isOpen && !!roomId) {
      const lastRoomId = roomId;
      subscribe(`room:${roomId}`);
      return () => {
        unsubscribe(`room:${lastRoomId}`);
      };
    }
  }, [isOpen, roomId]);

  const handleSwiperIndexChange = useCallback(
    (sw) => {
      const newActiveIndex = sw.activeIndex;
      if (swiperActiveIndex !== newActiveIndex) {
        setSwiperActiveIndex(newActiveIndex);
      }
    },
    [swiperActiveIndex],
  );

  const renderDrawerToggle = useCallback(
    (open) => (
      <DrawerToggle
        drawerWidth={window.innerWidth}
        drawerOpen={open}
        side="left"
        toggleOpenDrawer={() => swiper.slideTo(!open ? DRAWER_INDEX : MAIN_INDEX)}
      />
    ),
    [DRAWER_INDEX, MAIN_INDEX, swiper],
  );

  useEffect(() => {
    if (!!swiper && threadInMain) {
      swiper.slideTo(MAIN_INDEX);
    }
  }, [threadInMain]);

  useEffect(() => {
    if (!!swiper && isCreation) {
      swiper.slideTo(DRAWER_INDEX);
    }
  }, [isCreation]);

  return (
    <>
      <Helmet>
        <title>{room?.name || 'Room'}</title>
        <meta
          name="description"
          content={room?.description}
        />
      </Helmet>
      <Swiper
        key={`swiper-drawer-${theme.palette.mode}`}
        onSwiper={setSwiper}
        onTransitionEnd={handleSwiperIndexChange}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ['100%', 0, 0],
          },
          next: {
            translate: ['-100%', 0, 0],
          },
        }}
        modules={[EffectCreative]}
        style={swiperStyles}
        className="room-swiper"
        initialSlide={MAIN_INDEX}
        nested={true}
      >
        <SwiperSlide style={swiperSlideStyles}>
          <RoomContent className="px-2" />
          {renderDrawerToggle(true)}
        </SwiperSlide>
        <SwiperSlide style={swiperSlideStyles}>
          <GeneralToolbar
            left={0}
            right={0}
            tabs={tabs}
            conversation_history={conversation_history}
            members={members}
            settings={settings}
            show_close_button={show_close_button}
            show_fullscreen_button={show_fullscreen_button}
            show_sidebar_button={show_sidebar_button}
            onFullscreen={onFullscreen}
            onSidebar={onSidebar}
            onClose={onClose}
          />
          <Threads />
          {renderDrawerToggle(false)}
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default memo(MobileRoom);
