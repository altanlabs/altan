import React, { memo } from 'react';

import ToolModule from './abstract/ToolModule';

const SearchModule = (props) => {
  return (
    <ToolModule
      mode="search"
      {...props}
    />
  );
};

export default memo(SearchModule);
