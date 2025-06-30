import React, { memo } from 'react';

import ToolModule from './abstract/ToolModule.jsx';

const ActionModule = (props) => {
  return (
    <ToolModule
      mode="action"
      {...props}
    />
  );
};

export default memo(ActionModule);
