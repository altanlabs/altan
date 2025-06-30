import React, { memo } from 'react';
import { Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { cn } from '@lib/utils';

import 'swiper/css';
import DrawerCreateThread from './drawer/DrawerCreateThread.jsx';
import DrawerRoomHeader from './drawer/DrawerRoomHeader.jsx';
import DrawerRoomMembers from './drawer/DrawerRoomMembers.jsx';
import DrawerThreadsSection from './drawer/DrawerThreadsSection.jsx';
import { isMobile } from './utils';
import { selectThreadDrawerDetails } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';

const DrawerSwiper = memo(() => {
  return (
    <Swiper
      direction="vertical"
      slidesPerView={'auto'}
      spaceBetween={10}
      {...(!isMobile() && {
        mousewheel: {
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
        },
      })}
      observer={true}
      observeParents={true}
      touchReleaseOnEdges={true}
      longSwipes={false}
      longSwipesMs={300}
      {...(!isMobile() && { modules: [Mousewheel] })}
      className="w-full h-full"
    >
      <SwiperSlide
        style={{
          height: 'auto',
        }}
      >
        <DrawerRoomMembers />
      </SwiperSlide>
      <SwiperSlide>
        <DrawerThreadsSection />
      </SwiperSlide>
    </Swiper>
  );
});
DrawerSwiper.displayName = 'DrawerSwiper';

const useDisplayThreads = () => {
  const drawer = useSelector(selectThreadDrawerDetails);
  return !!drawer.display && (!!drawer.current || !!drawer.isCreation);
};

const RoomContent = ({ className }) => {
  const displayThreads = useDisplayThreads();
  return (
    <div className={cn('h-full flex flex-col overflow-hidden', className)}>
      <DrawerRoomHeader />
      <div
        style={{ display: displayThreads ? 'block' : 'none' }}
        className="h-full w-full"
      >
        <DrawerCreateThread />
      </div>
      <div
        style={{ display: displayThreads ? 'none' : 'block' }}
        className="h-full w-full"
      >
        <DrawerSwiper />
      </div>
    </div>
  );
};

export default memo(RoomContent);
