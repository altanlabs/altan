import { Typography } from '@mui/material';
import React from 'react';

// Subcomponent for AI scenario
function AISubcomponent({ title }) {
  return <Typography variant="body1">[AI Set] {title}</Typography>;
}

export default React.memo(AISubcomponent);
