import React, { memo } from 'react';

import TemplateManager from './TemplateManager';
import CustomDialog from '../dialogs/CustomDialog.jsx';

const TemplateDialog = ({
  open,
  onClose,
  mode = 'agent',
  templateSelector,
  versionsSelector = null,
}) => {
  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <TemplateManager
        mode={mode}
        templateSelector={templateSelector}
        versionsSelector={versionsSelector}
        onClose={onClose}
      />
    </CustomDialog>
  );
};

export default memo(TemplateDialog);
