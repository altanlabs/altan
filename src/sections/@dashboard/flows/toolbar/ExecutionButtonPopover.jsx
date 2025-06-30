import { Paper, Popover } from '@mui/material';
import { memo } from 'react';
import { FormProvider } from 'react-hook-form';

import EventRetriggerCard from './components/EventRetriggerCard';
import FormParameters from '../../../../components/tools/form/FormParameters';

const ExecutionButtonPopover = ({
  showRetriggerCard,
  showWorkflowArgs,
  anchorEl,
  flowSchema,
  onClose,
  flowArgsMethods,
}) => {
  return (
    <Popover
      open={showRetriggerCard || showWorkflowArgs}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      style={{ zIndex: 1300 }}
      onClose={onClose}
    >
      <Paper
        elevation={3}
        sx={{
          width: 300,
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          backgroundColor: 'transparent',
        }}
        className="backdrop-blur-xl bg-white/50 dark:bg-black/50"
      >
        {showRetriggerCard ? (
          <EventRetriggerCard onClose={onClose} />
        ) : !!flowSchema ? (
          <FormProvider {...flowArgsMethods}>
            <div className="items-center justify-center p-4">
              <FormParameters
                formSchema={flowSchema}
                enableLexical={false}
                enableAIFill={false}
                path=""
                // handleVariableClick={handleVariableClick}
              />
            </div>
          </FormProvider>
        ) : null}
      </Paper>
    </Popover>
  );
};

export default memo(ExecutionButtonPopover);
