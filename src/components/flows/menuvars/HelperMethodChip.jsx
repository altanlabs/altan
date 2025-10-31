import { Chip, Tooltip } from '@mui/material';
import { memo } from 'react';

import HelperMethodTooltipCard from './HelperMethodTooltipCard';
import { HelperOption } from '../../legacy_lexical/nodes/HelperNode';

const HelperMethodChip = ({ prefix, method, onSelect = null }) => {
  return (
    <Tooltip
      arrow
      title={<HelperMethodTooltipCard method={method} />}
      slotProps={{
        tooltip: {
          sx: {
            padding: 0,
            backgroundColor: 'transparent',
          },
        },
        popper: {
          sx: {
            zIndex: 100000,
          },
        },
      }}
      enterDelay={800}
      enterNextDelay={800}
      leaveDelay={800}
    >
      <Chip
        size="small"
        onClick={() => {
          if (!!onSelect) {
            onSelect(new HelperOption(`${prefix}.${method.name}`, prefix, method));
          } else {
            // navigator.clipboard.writeText(`${prefix}.${method.name}`)
            return null;
          }
        }}
        label={!!onSelect ? method.name : `${method.name}(`}
        sx={{
          borderRadius: 1,
          // ...!onSelect && {
          //   pointerEvents: 'none'
          // }
        }}
      />
    </Tooltip>
  );
};

export default memo(HelperMethodChip);
