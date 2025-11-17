import React, { memo } from 'react';

import TemplateManager from './TemplateManager';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';

const TemplateDialog = ({
  open,
  onClose,
  mode = 'agent',
  templateSelector,
  versionsSelector = null,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] max-h-[800px] overflow-hidden p-0 flex flex-col">
        <TemplateManager
          mode={mode}
          templateSelector={templateSelector}
          versionsSelector={versionsSelector}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default memo(TemplateDialog);
