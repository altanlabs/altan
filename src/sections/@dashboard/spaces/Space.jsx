import { m, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback, memo } from 'react';

import ToolNavigator from './navigation/ToolNavigator';
import { SpaceToolCard } from './StyledCards';
import ActionTypeCard from './tools/ActionTypeCard';
import ClientToolDrawer from './tools/ClientToolDrawer';
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Sheet, SheetContent } from '../../../components/ui/sheet';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { cn } from '../../../lib/utils';
import { selectAccount } from '../../../redux/slices/general';
import { getSpace } from '../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_DASHBOARD } from '../../../routes/paths';

const GET_OPTIONS = {
  successMessage: 'Fetch successful.',
  errorMessage: 'Error while fetching space: ',
  useSnackbar: {
    error: true,
    success: false,
  },
};

const ToolButton = ({ onClick, icon, label, variant = 'default' }) => (
  <m.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1 min-w-0">
    <Button onClick={onClick} variant={variant} className="w-full h-9 text-xs sm:text-sm">
      <Iconify icon={icon} width={14} className="sm:w-4 sm:h-4" />
      <span className="truncate">{label}</span>
    </Button>
  </m.div>
);

const EmptyState = ({ onAddServerTool, onAddClientTool }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] p-4 sm:p-6"
  >
    <Card className="max-w-md w-full border-dashed">
      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 250 }}
          className="mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center"
        >
          <Iconify icon="ri:hammer-fill" width={20} className="sm:w-6 sm:h-6" />
        </m.div>
        <CardTitle className="text-base sm:text-lg">No tools configured</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Add tools to enhance your agent&apos;s capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <ToolButton onClick={onAddServerTool} icon="mdi:server" label="Add Server Tool" />
        <ToolButton onClick={onAddClientTool} icon="mdi:desktop-classic" label="Add Client Tool" variant="outline" />
      </CardContent>
    </Card>
  </m.div>
);

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
  }, [account?.id, current, navigate]);

  const hasTools = current?.tools?.items && current.tools.items.length > 0;

  return (
    <>
      {!!current?.id && current.id !== 'root' && (
        <ToolNavigator
          toolDrawer={toolDrawer}
          setToolDrawer={setToolDrawer}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}
      <ClientToolDrawer
        open={clientToolDrawer}
        onClose={onCloseEditClientTool}
        toolToEdit={selectedClientTool}
      />

      <div
        className={cn(
          'flex flex-col h-full w-full',
          !isPreview && 'fixed top-0 left-0 right-0 bottom-0 bg-transparent',
          isDesktop && !isPreview && 'left-[280px] w-[calc(100%-280px)]',
          isDesktop && isNavMini && !isPreview && 'left-[88px] w-[calc(100%-88px)]',
        )}
        style={{ paddingTop: isPreview ? 0 : `${top}px` }}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Command Bar */}
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-10 backdrop-blur-xl flex-shrink-0"
          >
            <div className={cn('px-4 py-3', isPreview && 'px-3 py-2')}>
              <div className={cn('flex items-center justify-between mb-3', isPreview && 'mb-2')}>
                <div>
                  <h2 className={cn('text-lg font-semibold', isPreview && 'text-base')}>Tools</h2>
                  <p className={cn('text-xs text-muted-foreground mt-0.5', isPreview && 'text-[11px]')}>
                    Configure the action space that your agent can access and use
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <ToolButton onClick={handleServerTool} icon="mdi:server" label="Add Server Tool" />
                <ToolButton onClick={handleClientTool} icon="mdi:desktop-classic" label="Add Client Tool" variant="outline" />
              </div>
            </div>
          </m.div>

          {/* Tools List or Empty State */}
          <div className={cn('flex-1 overflow-y-auto', isPreview ? 'p-3' : 'p-4')}>
            {!hasTools ? (
              <EmptyState
                onAddServerTool={handleServerTool}
                onAddClientTool={handleClientTool}
              />
            ) : (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="space-y-2 max-w-4xl mx-auto w-full"
              >
                <AnimatePresence mode="popLayout">
                  {current.tools.items.map((tool, index) => (
                    <m.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        delay: index * 0.03,
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                      layout
                    >
                      <SpaceToolCard
                        item={tool}
                        onEdit={handleToolEdit}
                        spaceId={current.id}
                      />
                    </m.div>
                  ))}
                </AnimatePresence>
              </m.div>
            )}
          </div>
        </div>
      </div>

      {/* Tool Detail Sheet */}
      <Sheet open={Boolean(selectedTool)} onOpenChange={(open) => !open && onCloseEditTool()}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!!selectedTool?.tool && (
              <m.div
                key={selectedTool.tool.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ActionTypeCard
                  action={selectedTool.tool.action_type}
                  tool={selectedTool.tool}
                  onSave={onCloseEditTool}
                />
              </m.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default memo(Space);
