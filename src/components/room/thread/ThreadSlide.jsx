import {  useTheme } from '@mui/material';
import { memo } from 'react';
import { SwiperSlide } from 'swiper/react';

import { bgBlur } from '@utils/styleUtils';

import Thread from './Thread';
import { isMobile } from '../utils';

const ThreadSlide = ({ threadId, ...props }) => {
  const theme = useTheme();
  return (
    <SwiperSlide
      {...props}
      style={{
        ...!isMobile() ? bgBlur({ opacity: 0.8, blur: 16, color: theme.palette.background.secondary }) : {
          backgroundColor: theme.palette.background.secondary,
        },
      }}
    >
      <Thread
        tId={threadId}
      />
    </SwiperSlide>
  );
};

export default memo(ThreadSlide);
