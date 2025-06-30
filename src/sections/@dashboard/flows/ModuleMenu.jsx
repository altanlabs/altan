import { DialogContent, Button } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import React, { memo } from 'react';
import { batch } from 'react-redux';

import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import ModuleCard from '../../../components/flows/ModuleCard.jsx';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';
import { clearModuleInMenu } from '../../../redux/slices/flows';
import { closeGlobalVarsMenu } from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';

const onClose = () =>
  batch(() => {
    dispatch(closeGlobalVarsMenu());
    dispatch(clearModuleInMenu());
  });

const selectModuleInMenu = (state) => state.flows.menuModule?.module;
const selectModuleInMenuAnchor = (state) => state.flows.menuModule?.anchorEl;

const menuVariants = {
  hidden: {
    opacity: 0.6,
    x: '100%',
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut', // Changed to 'easeInOut' for smoother transitions
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

const ModuleMenu = () => {
  const isSmallScreen = useResponsive('down', 'md');
  // const isMediumScreen = useResponsive('down', 'lg');
  const moduleInMenu = useSelector(selectModuleInMenu);
  const anchor = useSelector(selectModuleInMenuAnchor);

  const isOpen = !!anchor && !!(moduleInMenu.id || moduleInMenu.after);

  if (isSmallScreen) {
    return (
      <CustomDialog
        dialogOpen={isOpen}
        onClose={onClose}
        maxWidth={false}
      >
        <Button
          className="absolute left-0 top-0 right -0"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:chevron-left" />}
          onClick={onClose}
        >
          Back to canvas
        </Button>
        <DialogContent className="relative flex w-full h-full flex-col gap-1 mt-2 p-0 overflow-x-hidden mt-0 overflow-y-auto">
          <ModuleCard {...moduleInMenu} />
        </DialogContent>
      </CustomDialog>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <m.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
          className="relative w-full min-w-[60%] md:min-w-[45%] xl:min-w-[33%] max-w-[600px] h-full max-h-full
            overflow-x-hidden overflow-y-auto rounded-2xl shadow-lg border before:backdrop-blur-md before:backdrop-hack
            bg-gradient-to-br from-transparent via-white/50 to-gray-200
            dark:via-black/50 dark:to-black border-gray-300 dark:border-gray-700
            gap-2 z-[1200]"
        >
          <ModuleCard
            key={moduleInMenu.id || moduleInMenu.after}
            {...moduleInMenu}
            onClose={onClose}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default memo(ModuleMenu);
