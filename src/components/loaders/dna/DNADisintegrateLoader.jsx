// import React, { memo } from 'react';
// import { m } from 'framer-motion';

// const generateParticles = () => {
//   const numParticles = 150;
//   const particles = [];

//   for (let i = 0; i < numParticles; i++) {
//     const size = Math.random() * 3 + 1; // Size between 1px and 4px
//     const angle = Math.random() * 360; // Random angle in degrees
//     const distance = Math.random() * 150 + 50; // Travel distance between 50px and 200px
//     const duration = Math.random() * 2 + 3; // Duration between 3s and 5s
//     const delay = Math.random() * 1; // Delay up to 1s

//     particles.push({
//       id: i,
//       size,
//       angle,
//       distance,
//       duration,
//       delay,
//     });
//   }
//   return particles;
// };

// const AltanBigBang = memo(() => {
//   const particles = generateParticles();
//   return particles.map((particle) => {
//     const angleRad = (particle.angle * Math.PI) / 180;
//     const dx = particle.distance * Math.cos(angleRad);
//     const dy = particle.distance * Math.sin(angleRad);
//     return (
//       <div
//         key={`particle-${particle.id}`}
//         className="particle"
//         style={{
//           width: particle.size,
//           height: particle.size,
//           animationDelay: `${particle.delay}s`,
//           top: '50%',
//           left: '50%',
//         }}
//       >
//         <div
//           className="particle-inner"
//           style={{
//             '--dx': `${dx}px`,
//             '--dy': `${dy}px`,
//             animationDuration: `${particle.duration}s`,
//             animationTimingFunction: 'cubic-bezier(0.6, 0, 0.2, 1)', // Starts fast, slows down
//           }}
//         ></div>
//       </div>
//     );
//   })
// });

// const DNADisintegrateLoader = () => {
//   return (
//     <div
//       className="absolute inset-0 overflow-hidden flex items-center justify-center z-[10000] loading-container backdrop-blur-md"
//     >
//       <m.svg
//         width="145"
//         height="125"
//         viewBox="0 0 84 72"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{
//           opacity: 0,
//           filter: 'blur(10px)',
//           scale: 0.5,
//           transition: {
//             duration: 3,
//             ease: 'easeOut',
//           },
//         }}
//         transition={{ duration: 2, ease: 'easeOut' }}
//         className="logo-svg"
//       >
//         <m.path
//           fillRule="evenodd"
//           clipRule="evenodd"
//           d="M83.5643 71.9914L42 0L0.435791 71.9914C9.40753 67.1723 24.6747 64 42 64C59.3253 64 74.5925 67.1723 83.5643 71.9914Z"
//           fill="rgba(255, 255, 255, 0.6)"
//         />
//       </m.svg>
//       {/* <div className="particle-container">
//         <AltanBigBang />
//       </div> */}
//     </div>
//   );
// };

// export default memo(DNADisintegrateLoader);
