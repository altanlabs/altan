
import { Stack, Box, Button, Drawer } from '@mui/material';
import React, { useState, useEffect, useCallback, memo } from 'react';

import ToolNavigator from './navigation/ToolNavigator';
import { SpaceToolCard } from './StyledCards';
import ActionTypeCard from './tools/ActionTypeCard';
import ClientToolDrawer from './tools/ClientToolDrawer';
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import { HEADER, NAV } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectAccount } from '../../../redux/slices/general';
import {
  // getRootSpaces,
  getSpace,
} from '../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { bgBlur } from '../../../utils/cssStyles';
import Each from '../../../utils/each';

const GET_OPTIONS = {
  successMessage: 'Fetch successful.',
  errorMessage: 'Error while fetching space: ',
  useSnackbar: {
    error: true,
    success: false,
  },
};

const Space = ({ navigate, spaceId, isPreview }) => {
  const { themeLayout } = useSettingsContext();
  const isNavMini = themeLayout === 'mini';
  const isDesktop = useResponsive('up', 'lg');
  const top = HEADER.H_MOBILE;
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedClientTool, setSelectedClientTool] = useState(null);
  const [toolDrawer, setToolDrawer] = useState(false);
  const [clientToolDrawer, setClientToolDrawer] = useState(false);
  const current = useSelector((state) => state.spaces.current);
  const account = useSelector(selectAccount);
  const { enqueueSnackbar } = useSnackbar();

  const onCloseEditTool = useCallback(() => {
    setSelectedTool(null);
  }, []);

  const onCloseEditClientTool = useCallback(() => {
    setSelectedClientTool(null);
    setClientToolDrawer(false);
  }, []);

  const handleToolEdit = useCallback((toolItem) => {
    const isClientTool = toolItem.tool?.tool_type === 'client';

    if (isClientTool) {
      setSelectedClientTool(toolItem);
      setClientToolDrawer(true);
    } else {
      setSelectedTool(toolItem);
    }
  }, []);

  const handleServerTool = useCallback(() => {
    setToolDrawer(true);
  }, []);

    const handleClientTool = useCallback(() => {
    setSelectedClientTool(null);
    setClientToolDrawer(true);
  }, []);

  useEffect(() => {
    if (!!account?.id) {
      if (current?.id !== spaceId) {
        dispatch(getSpace(spaceId), GET_OPTIONS);
      }
    }
  }, [account?.id, spaceId, current]);

  useEffect(() => {
    if (
      !!account?.id &&
      !!current?.id &&
      current.id !== 'root' &&
      current.account_id !== account.id
    )
      navigate(PATH_DASHBOARD.spaces.root, { replace: true });
  }, [account?.id, current]);

  return (
    <>
      {!!current?.id && current.id !== 'root' && (
        <>
          <ToolNavigator
            toolDrawer={toolDrawer}
            setToolDrawer={setToolDrawer}
            enqueueSnackbar={enqueueSnackbar}
          />
        </>
      )}
      <ClientToolDrawer
        open={clientToolDrawer}
        onClose={onCloseEditClientTool}
        toolToEdit={selectedClientTool}
      />
      <Box
        sx={
          isPreview
            ? undefined
            : {
                background: 'transparent',
                position: 'fixed',
                padding: 0,
                margin: 0,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 0,
                paddingTop: `${top}px`,
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'row',
                ...(isDesktop && {
                  width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
                  left: `${NAV.W_DASHBOARD}px`,
                  ...(isNavMini && {
                    width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
                    left: `${NAV.W_DASHBOARD_MINI}px`,
                  }),
                }),
              }
        }
      >
        <Stack
          direction="column"
          sx={{ height: '90%', width: '100%' }}
        >
          <Box>
            <div className="flex flex-row items-center gap-3">
              <Button
                color="inherit"
                variant="soft"
                onClick={handleServerTool}
                fullWidth
                startIcon={
                  <Iconify
                    icon="mdi:server"
                    width={15}
                  />
                }
              >
                Add Server Tool
              </Button>
              <Button
                color="inherit"
                variant="soft"
                onClick={handleClientTool}
                fullWidth
                startIcon={
                  <Iconify
                    icon="mdi:desktop-classic"
                    width={15}
                  />
                }
              >
                Add Client Tool
              </Button>
            </div>
            <div className="flex flex-col space-y-1 py-2 px-1">
              {current?.tools?.items && (
                <Each
                  of={current.tools.items}
                  render={(tool, index) => (
                    <SpaceToolCard
                      key={`space_tool_${tool.id}_${index}`}
                      item={tool}
                      onEdit={handleToolEdit}
                      spaceId={current.id}
                    />
                  )}
                />
              )}
            </div>
            <Drawer
              open={Boolean(selectedTool)}
              onClose={onCloseEditTool}
              anchor="right"
              PaperProps={{
                sx: {
                  width: 1,
                  maxWidth: 600,
                  backgroundColor: 'transparent',
                  padding: 1,
                  pb: 2,
                  ...bgBlur({ opacity: 0.1 }),
                },
              }}
              slotProps={{
                backdrop: { invisible: true },
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                }}
              >
                {!!selectedTool?.tool && (
                  <ActionTypeCard
                    action={selectedTool.tool.action_type}
                    tool={selectedTool.tool}
                    onSave={onCloseEditTool}
                  />
                )}
              </Box>
            </Drawer>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export default memo(Space);
