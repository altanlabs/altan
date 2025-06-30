import { Stack, Tooltip } from '@mui/material';
import React, { memo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@lib/utils';

// import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
// import DeleteDialog from '../../../dialogs/DeleteDialog';
import useKeyShortcutListener from '../../../../hooks/useKeyShortcutListener.ts';
import ConfirmationButton from '../../../buttons/ConfirmationButton.tsx';
import InteractiveButton from '../../../buttons/InteractiveButton.jsx';
import Iconify from '../../../iconify';
import { ModuleIcon, ModuleName, ModuleType } from '../../schemas/modulePanelSections.jsx';
// import { deleteFlowModule, clearModuleInMenu } from '../../../../redux/slices/flows';

const ModuleHeader = ({ module, onClose }) => {
  const {
    onSubmit,
    handleSubmit,
    formState: { isDirty },
  } = useFormContext();

  // const [deleteDialog, setDeleteDialog] = useState(false);
  // const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  // const onCloseDeleteDialog = useCallback(() => {
  //   setDeleteDialog(false);
  //   dispatch(clearModuleInMenu());
  // }, [setDeleteDialog]);

  // const handleDeleteModule = () => {
  //   dispatchWithFeedback(deleteFlowModule(module.id), {
  //     successMessage: `Module deleted successfully`,
  //     errorMessage: `There was an error deleting the module`,
  //     useSnackbar: true,
  //   }).then(onCloseDeleteDialog);
  // };

  const onSubmitClick = useCallback(() => {
    if (isDirty || !module?.workflow_id) {
      handleSubmit(onSubmit)();
      onClose?.();
    }
  }, [handleSubmit, isDirty, module?.workflow_id, onClose, onSubmit]);

  const eventMappings = [
    // ESC key
    {
      condition: (event) => event.key === 'Escape',
      handler: onClose,
    },
    // Command/Meta + Enter
    {
      condition: (event) => event.key === 'Enter' && (event.metaKey || event.ctrlKey),
      handler: onSubmitClick,
    },
  ];

  useKeyShortcutListener({
    eventsMapping: eventMappings,
    debounceTime: 300,
    stopPropagation: true,
  });

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        padding={1}
        width="100%"
        className="sticky top-0 backdrop-blur-lg z-[10] rounded-xl"
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <ModuleIcon
            module={module}
            size={35}
          />

          <Stack
            spacing={-1}
            height="100%"
          >
            <ModuleName
              module={module}
              onDoubleClick={(e) => {
                navigator.clipboard.writeText(module?.id || '');
                e.preventDefault(); // Prevent text selection
              }}
              sx={{
                maxWidth: '100%',
              }}
            />

            {/* {
                module.type !== 'trigger' && !!module?.type && !!module?.workflow_id && (
                  <IconButton
                    className='delete-module-icon-button'
                    color="error"
                    // onClick={() => deleteNewModule(module.after)}
                    onClick={() => setDeleteDialog(true)}
                    size='small'
                    sx={{
                      padding: 0,
                      '&:hover': {
                        '& .delete-module-icon': {
                          width: 18
                        }
                      }
                    }}
                  >
                    <Iconify
                      icon="ic:round-delete"
                      className="delete-module-icon"
                      sx={{
                        transition: 'width 300ms ease',
                        width: 15
                      }}
                    />
                  </IconButton>
                )
              } */}
            <ModuleType module={module} />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
        >
          {!!onClose && (
            <Tooltip
              arrow
              placement="left"
              title="Close (ESC)"
              enterDelay={700}
              enterNextDelay={700}
            >
              <span>
                <ConfirmationButton
                  containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
                  className={cn(
                    'transition-all duration-200 w-[40px] text-sm text-black dark:text-white flex items-center space-x-1 px-3',
                    isDirty
                      ? 'group-hover:bg-red-400 group-hover:dark:bg-red-600 bg-red-200 dark:bg-red-900 group-hover:w-[150px]'
                      : 'bg-slate-200 dark:bg-slate-900 group-hover:bg-gray-400 group-hover:dark:bg-slate-400 group-hover:w-[90px]',
                  )}
                  confirmationMessage="Are you sure you want to close this module? Your changes will be discarded."
                  confirmButtonText="Yes"
                  cancelButtonText="No"
                  danger
                  isConfirmationEnabled={isDirty || !module?.workflow_id}
                  onClick={onClose}
                  disableAnimation
                >
                  <Iconify
                    className="text-black dark:text-white group-hover:text-white group-hover:dark:text-black"
                    icon="mdi:close"
                  />
                  <span className="hidden group-hover:flex text-white dark:text-black truncate">
                    Close {isDirty ? '& Discard' : ''}
                  </span>
                </ConfirmationButton>
              </span>
            </Tooltip>
          )}
          <Tooltip
            arrow
            placement="left"
            title="Save and close (⌘/Ctrl + Enter)"
            enterDelay={700}
            enterNextDelay={700}
          >
            <span>
              <InteractiveButton
                icon="mdi:check"
                title="Save"
                // loading={isSubmitting}
                onClick={onSubmitClick}
                iconClassName="text-black dark:text-white"
                titleClassName="text-sm font-bold"
                containerClassName="group bg-white dark:bg-black border-transparent"
                // duration={8000}
                // containerClassName="h-[40]"
                // borderClassName="h-[80px] w-[250px]"
                // enableBorder={true}
                disableAnimation={!isDirty}
                disabled={!isDirty}
                className={cn(
                  'px-3 py-[1.5] group-hover:border-transparent',
                  isDirty &&
                    'transition-all duration-500 group-hover:bg-green-300 group-hover:dark:bg-green-700',
                )}
              />
            </span>
            {/* <Button
                variant="soft"
                onClick={onSubmitClick}
                disabled={!isDirty}
                startIcon={<Iconify icon="dashicons:saved" />}
              >
                Save
              </Button>
            </span> */}
          </Tooltip>
        </Stack>
      </Stack>
      {/* <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={onCloseDeleteDialog}
        confirmDelete={handleDeleteModule}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete this module?"
      /> */}
    </>
  );
};

export default memo(ModuleHeader);
