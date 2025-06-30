import { Box, Stack, useTheme } from '@mui/material';
import { memo } from 'react';

import ModuleCard from '../../../../components/flows/ModuleCard';
import { useSelector } from '../../../../redux/store';
// import ModuleOutput from "./ouput/ModuleOutput";
// import { useDraggable } from "@dnd-kit/core";
// import {CSS} from '@dnd-kit/utilities';

const ModuleMenuLarge = ({
  left,
  middle,
  // right,
  onResize,
}) => {
  // const {attributes, listeners, setNodeRef, transform} = useDraggable({
  //   id: 'draggable-middle'
  // });
  const theme = useTheme();
  const { module: moduleInMenu } = useSelector((state) => state.flows.menuModule);

  return (
    <>
      <Box
        sx={{
          width: `${left}%`,
          p: 2,
          borderRadius: 2,
          height: '85%',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* <ModuleInput /> */}
      </Box>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={-0.5}
        height="100%"
        sx={{
          width: `${middle}%`,
          position: 'relative',
          // transform: CSS.Translate.toString(transform)
        }}
        // ref={setNodeRef}
      >
        {/* <Box
          {...listeners}
          {...attributes}
          sx={{
            cursor: 'grab',
            width: '100px',
            display: 'flex',
            bgcolor: 'background.paper',
            alignItems: 'center',
            justifyContent: 'center',
            height: '20px',
            letterSpacing: '2px',
            fontWeight: 'bold',
            zIndex: 10,
            borderRadius: '5px 5px 0px',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          tabIndex="0"
          onDragStart={(e) => console.log("dragging start")}
        >
          :::::
        </Box> */}
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ModuleCard {...moduleInMenu} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: -5,
            bottom: 0,
            width: '10px',
            cursor: 'ew-resize',
          }}
          onMouseDown={(e) => onResize(e, 'left')}
        />
        {/* <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: -5,
            bottom: 0,
            width: '10px',
            cursor: 'ew-resize'
          }}
          onMouseDown={(e) => onResize(e, 'right')}
        /> */}
      </Stack>
      {/* <Box
        sx={{
          width: `${right}%`,
          p: 2,
          borderRadius: 2,
          height: '85%',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          ...bgBlur({ opacity: 0.3, blur: 4 })
        }}
      >
        <ModuleOutput />
      </Box> */}
    </>
  );
};

export default memo(ModuleMenuLarge);
