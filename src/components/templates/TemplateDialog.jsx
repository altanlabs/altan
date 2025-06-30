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
      className="max-w-md"
      // PaperProps={{
      //   style: {
      //     height: '80vh',
      //     padding: '20px'
      //   }
      // }}
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
