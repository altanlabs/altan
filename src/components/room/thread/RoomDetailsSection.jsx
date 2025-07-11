import { Box, Tab, Tabs } from '@mui/material';
import { useState, memo } from 'react';

import ConversationsList from '../../conversations/ConversationsList.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import MembersList from '../../members/MembersList.jsx';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`room-tabpanel-${index}`}
    aria-labelledby={`room-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const RoomDetailsSection = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 120,
            },
          }}
        >
          <Tab
            label="Members"
            icon={
              <Iconify
                icon="mdi:account-group"
                width={20}
              />
            }
            iconPosition="start"
          />
          <Tab
            label="Conversations"
            icon={
              <Iconify
                icon="mdi:chat-outline"
                width={20}
              />
            }
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel
        value={tabValue}
        index={0}
      >
        <MembersList />
      </TabPanel>

      <TabPanel
        value={tabValue}
        index={1}
      >
        <ConversationsList />
      </TabPanel>
    </Box>
  );
};

export default memo(RoomDetailsSection);
