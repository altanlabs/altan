import { memo } from 'react';

import RoomMember from './RoomMember.jsx';
import useResponsive from '../../../hooks/useResponsive';

const RoomCardMembers = ({ members }) => {
  const isSmallScreen = useResponsive('down', 'md');
  const MAX_VISIBLE_MEMBERS = isSmallScreen ? 2 : 3;

  return (
    <div
      className="absolute z-10 right-4 top-1/2 -translate-y-1/2 flex w-min transition-all duration-300 ease-in-out"
    >
      {members
        .slice(0, MAX_VISIBLE_MEMBERS)
        .map((member, index, array) => {
          const size = 30 - (array.length - index - 1) * 10;
          return (
            <RoomMember
              key={index}
              member={member}
              size={size}
              hideBadge={true}
              badgeSize={size}
              hideTooltip={true}
              style={{
                marginRight: '-0.5em',
                transition: 'all 0.3s ease-in-out',
              }}
            />
          );
        })}
    </div>
  );
};

export default memo(RoomCardMembers);

// const RoomCardMembersTooltip = ({ members }) => {

//   return (
//     <>
//       {members
//       .slice(0, 1)
//       .map((member, index, array) => {
//         const { top, left, size, translateX, translateY } = calculateStyles(index, array.length);
//         return (
//         <RoomMember
//           key={index}
//           member={member}
//           size={size} // Linear increase in size based on index
//           badgeSize={size}
//           style={{
//             // zIndex: 999 + index + 1,
//             position: 'absolute',
//             top,
//             left,
//             transition: 'all 0.3s ease',
//             // marginRight: `${marginRight}em`,
//             transform: `translate(${translateX}, ${translateY})`,
//           }}
//         />
//       )})}
//       {/* {members.length > MAX_VISIBLE_MEMBERS && (
//         <Chip
//           label={mustShowAllMembers ? "-Less" : `+${members.length - MAX_VISIBLE_MEMBERS}`}
//           onClick={setShowSomeMembers}
//           sx={{ alignSelf: 'center' }}
//         />
//       )} */}
//     </>
//   );
// }

// const calculateOrbitAndPosition = (index, totalMembers) => {
//   const orbitSizes = [1, 4, 3, 8, 3]; // Number of positions in each orbit
//   let currentOrbit = 0;
//   let positionInOrbit = index;
//   for (let i = 0; i < orbitSizes.length; i++) {
//     if (positionInOrbit < orbitSizes[i]) {
//       currentOrbit = i;
//       break;
//     } else {
//       positionInOrbit -= orbitSizes[i];
//     }
//   }
//   return { currentOrbit, positionInOrbit };
// };

// const calculateStyles = (index, totalMembers) => {
//   const boxSize = (totalMembers - 1) * (25 - 10 - totalMembers);
//   const { currentOrbit, positionInOrbit } = calculateOrbitAndPosition(index, totalMembers);
//   const orbitRadius = boxSize + currentOrbit * 25; // Increase radius for each orbit
//   const angleIncrement = Math.PI * 2 / totalMembers; // Angle increment for each member
//   const angle = angleIncrement * positionInOrbit; // Current angle based on position in orbit

//   // Calculate the position of each member on the orbit
//   const translateX = '-50%'; //  Math.cos(angle) * orbitRadius + boxSize / 2;
//   const translateY = '-50%'; //Math.sin(angle) * orbitRadius + boxSize / 2;
//   const left = '50%';
//   const top = '50%';

//   // Calculate size based on orbit
//   const baseSize = 45; // Base size for the first orbit
//   const sizeDecreaseFactor = 10; // Factor to decrease the size based on the orbit
//   const size = baseSize - (currentOrbit + 1) * sizeDecreaseFactor;

//   return { top, left, size, translateX, translateY };
// };
