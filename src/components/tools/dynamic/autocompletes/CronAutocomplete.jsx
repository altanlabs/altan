import { Box, styled, Typography } from '@mui/material';
import { memo } from 'react';
import { Cron } from 'react-js-cron';
import 'react-js-cron/dist/styles.css';

const CronWrapper = styled(Box)(({ theme }) => ({
  padding: '5px 10px',
  'div.react-js-cron-error div.react-js-cron-custom-select': {
    background: 'transparent',
  },
  'div.react-js-cron-error .react-js-cron-select .ant-select-selector': {
    backgroundColor: theme.palette.background.paper,
  },
  '.react-js-cron': {
    '.ant-btn:hover': {
      borderColor: 'red',
    },
    '.ant-select-arrow': {
      color: theme.palette.text.primary,
    },
    '.ant-select-selector': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

const CronAutocomplete = ({ value, onChange }) => {
  return (
    <CronWrapper>
      <Cron
        value={value || ''}
        setValue={onChange}
      />
      <Typography variant="caption">*Note: Timezone is UTC</Typography>
    </CronWrapper>
  );
};

export default memo(CronAutocomplete);
