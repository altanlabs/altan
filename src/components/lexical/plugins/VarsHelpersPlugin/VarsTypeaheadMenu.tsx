// /**
//  * Copyright (c) Altan, Inc.
//  */

// // import Draggable, { DraggableData } from 'react-draggable';
// import React, {memo, useCallback, useState} from 'react';
// import * as ReactDOM from 'react-dom';
// // import {
// //   $convertToMarkdownString,
// //   $convertFromMarkdownString,
// //   TRANSFORMERS
// // } from '@lexical/markdown';
// // import {$createMentionNode} from '../../nodes/MentionNode';
// import { Box } from '@mui/material';
// import ModuleInput from '../../../../sections/@dashboard/flows/modulemenu/input/ModuleInput';
// import { bgBlur } from '../../../../utils/cssStyles';


// const VarsTypeaheadMenu = ({ 
//   anchorElementRef, 
//   selectOptionAndCleanUp, 
//   // position, 
//   // setPosition 
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [isDragging, setIsDragging] = useState(false);

//   const handleDrag = useCallback((e, data: DraggableData) => {
//     setIsDragging(true);
//     // setPosition({ x: data.x, y: data.y });
//   }, []);

//   const handleStop = useCallback(() => {
//     setIsDragging(false);
//   }, []);

//   const onClose = useCallback(() => {
//     selectOptionAndCleanUp(null);
//     setIsOpen(false);
//   }, [selectOptionAndCleanUp]);

//   return (anchorElementRef?.current && !!isOpen) ? (
//     ReactDOM.createPortal(
//       // <Draggable 
//       //   // position={position}
//       //   onDrag={handleDrag}
//       //   onStop={handleStop}
//       //   bounds="body"
//       // >
//       // <Box
//       //   sx={{
//       //     position: 'fixed',
//       //     top: '5%',
//       //     left: '10%',
//       //     // transform: `translate(${position.x}px, ${position.y}px)`,
//       //     height: '90%',
//       //     width: '500px',
//       //     maxWidth: '90vw',
//       //     zIndex: 9999,
//       //     padding: 1,
//       //     borderRadius: 2,
//       //     boxShadow: '0px 0px 17px 3px rgba(0,0,0,0.37)',
//       //     ...bgBlur({ opacity: 0.5 })
//       //   }}
//       // >
//       //   <ModuleInput 
//       //     onSelect={selectOptionAndCleanUp} 
//       //     onClose={onClose}
//       //   />
//       // </Box>
//       // </Draggable>,
//       <></>,
//       anchorElementRef.current
//     )
//   ) : null;
// };

// export default memo(VarsTypeaheadMenu);