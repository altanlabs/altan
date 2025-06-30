import { Stack, Card, CardHeader, CardContent, Drawer, IconButton } from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';

import { useExternalData } from './provider/SAExternalDataProvider';
import { SAExternalSettingsProvider } from './provider/SAExternalSettingsProvider';
import SAExternalDrawer from './SAExternalDrawer';
import SAExternalTable from './SAExternalTable';
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
import { bgBlur } from '../../../../utils/cssStyles';
import DrawerToggle from '../components/drawer/DrawerToggle';

const SAExternalSection = ({ index }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isSmallScreen = useResponsive('down', 'md');
  const { hasDataAtIndex } = useExternalData();

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [setIsDrawerOpen]);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), [setIsDrawerOpen]);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), [setIsDrawerOpen]);

  const hasData = !!hasDataAtIndex(index);

  useEffect(() => {
    if (!!hasData && !isSmallScreen) {
      openDrawer();
    }
  }, [hasData, isSmallScreen]);

  return (
    <SAExternalSettingsProvider index={index}>
      <Stack
        direction="row"
        width="100%"
        height="100%"
        {...(!hasData ? { justifyContent: 'center' } : {})}
      >
        {!isSmallScreen || !hasData ? (
          <Stack
            paddingTop={1}
            paddingX={1}
            width="100%"
            maxWidth={!!hasData ? 350 : `${isSmallScreen ? 100 : 50}vw`}
            sx={{
              overflowY: 'auto',
              ...(!isDrawerOpen &&
                !!hasData && {
                display: 'none',
              }),
            }}
          >
            <SAExternalDrawer />
          </Stack>
        ) : (
          <Drawer
            open={isDrawerOpen}
            onClose={closeDrawer}
            anchor="left"
            sx={{
              width: '100%',
              '& .MuiDrawer-paper': {
                width: '100%',
                position: 'absolute',
                ...bgBlur({ opacity: 0.6 }),
              },
            }}
          >
            <Card
              sx={{
                backgroundColor: 'transparent',
              }}
            >
              <CardHeader
                title="Set up"
                action={
                  <IconButton
                    size="small"
                    onClick={closeDrawer}
                  >
                    <Iconify icon="mdi:close" />
                  </IconButton>
                }
              />
              <CardContent>
                <SAExternalDrawer />
              </CardContent>
            </Card>
          </Drawer>
        )}
        <SAExternalTable index={index} />
      </Stack>
      {!!hasData && (
        <DrawerToggle
          drawerWidth={366}
          drawerOpen={isDrawerOpen}
          side="left"
          toggleOpenDrawer={toggleDrawer}
        />
      )}
    </SAExternalSettingsProvider>
  );
};

export default memo(SAExternalSection);
