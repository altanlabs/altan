// import { memo, useMemo } from "react";
// import { Drawer, Typography } from '@mui/material';
// import { isInteger } from 'lodash';
// import { dispatch } from "../../../redux/store";
// import { setDrawerOpenJob } from "../../../redux/slices/room";
// import { isMobile } from "../utils";
// import Threads from "../Threads";
// import { useCall } from "../../../providers/LiveCallProvider";

// const closeDrawer = (e) => dispatch(setDrawerOpenJob(false));

// const RoomDrawerRight = ({
//   isSmallScreen,
//   drawerWidth,
//   drawerOpen,
//   setDragger,
//   anchor = "left",
// }) => {
//   const { inCall } = useCall();
//   const content = useMemo(() => !inCall ? null: <Threads isInDrawer={true}/>, [inCall]);

//   return (
//     <>
//       {
//         !isSmallScreen && !!drawerOpen && (
//           <div
//             style={{
//               width: 10,
//               height: '100%',
//               bgcolor: 'none',
//               cursor: 'ew-resize',
//               position: 'absolute',
//               right: !isSmallScreen ? (isInteger(drawerWidth) ? drawerWidth : 0) - 5 : 0,
//               zIndex: 100
//             }}
//             onMouseDown={setDragger}
//           />
//         )
//       }
//       {
//         isMobile() ? content : (
//           <Drawer
//             sx={{
//               width: drawerOpen ? (drawerWidth > 200 ? drawerWidth : 200) : 0,
//               '& .MuiDrawer-paper': {
//                 width: drawerWidth,
//               },
//               zIndex: 99
//             }}
//             variant={isSmallScreen ? "temporary" : "persistent"}
//             anchor={anchor}
//             open={drawerOpen}
//             onClose={closeDrawer}
//           >
//             {content}
//           </Drawer>
//         )
//       }
//     </>
//   );
// };
// export default memo(RoomDrawerRight);
