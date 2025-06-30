import { memo } from 'react';
import { Position } from 'reactflow';

import Iconify from '../../../../iconify';
import ModuleHandle from '../handles/ModuleHandle';

const ModuleNodeSourceHandles = ({ sourceHandles, handleStyle, highlighted = false }) => {
  if (!sourceHandles?.length) {
    return null;
  }
  return (
    <div className="handles sources">
      {(sourceHandles || []).map((handle) => (
        // <Stack
        //   direction="row"
        //   spacing={1}
        //   width="100%"
        // >
        <ModuleHandle
          key={handle.id}
          id={handle.id}
          highlighted={highlighted}
          type="source"
          className="source-handle"
          position={Position.Right}
          style={{
            ...handleStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            ...(handle.default && {
              border: '2px dashed #000',
            }),
            // ...conditions?.length && {
            //   transform: `scale(${1 - conditions.length * 0.15})`
            // }
          }}
          isConnectableStart={1}
        >
          <Iconify
            icon="mdi:plus"
            width={22}
            className="plus-icon-handle"
            sx={{
              opacity: 0,
              transition: 'all 300ms ease',
              pointerEvents: 'none',
              color: 'black',
            }}
          />
        </ModuleHandle>
        // <div style={handleStyle}></div>
        // </Stack>
      ))}
    </div>
  );
};

export default memo(ModuleNodeSourceHandles);
