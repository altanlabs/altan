import { Box, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 9998,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

// const ProgressWrapper = styled('div')(({ theme }) => ({
//   position: 'absolute',
//   right: '5%',
//   top: '50%',
//   transform: 'translateY(-50%)',
//   display: 'flex',
//   alignItems: 'center',
//   fontSize: '1.5rem',
//   width: '45%',
//   justifyContent: 'flex-end',
//   [theme.breakpoints.down('sm')]: {
//     fontSize: '1rem',
//     right: '2%',
//     width: '48%',
//   },
// }));

// const Line = styled('div')(({ theme }) => ({
//   width: '200px',
//   height: '2px',
//   marginLeft: '10px',
//   [theme.breakpoints.down('sm')]: {
//     width: '100px',
//   },
// }));

// const TextWrapper = styled('div')(({ theme }) => ({
//   position: 'absolute',
//   left: '5%',
//   top: '50%',
//   transform: 'translateY(-50%)',
//   width: '45%',
//   zIndex: 1,
//   [theme.breakpoints.down('sm')]: {
//     left: '2%',
//     width: '48%',
//   },
// }));

// ----------------------------------------------------------------------

function LoadingScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // const [progress, setProgress] = useState(0);
  // const [showText, setShowText] = useState(false);
  // const [index, setIndex] = useState(0);
  // const [text, setText] = useState('');
  // const [isDeleting, setIsDeleting] = useState(false);
  // const welcomes = ['securing connection', 'loading altaners', 'starting platform', 'loading your future'];
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // useEffect(() => {
  //   if (!!reload) {
  //     setTimeout(() => window.location.reload(), reload * 1000);
  //   }
  // }, [reload]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress((oldProgress) => {
  //       if (oldProgress === 100) {
  //         clearInterval(interval);
  //         setTimeout(() => setShowText(true), 500);
  //         return oldProgress;
  //       }
  //       return Math.min(oldProgress + 1, 100);
  //     });
  //   }, 30);
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   const typingSpeed = 40;
  //   const deletingSpeed = 5;
  //   let timeout;

  //   if (!isDeleting) {
  //     timeout = setTimeout(() => {
  //       setText(welcomes[index].substring(0, text.length + 1));
  //       if (text === welcomes[index]) {
  //         setTimeout(() => setIsDeleting(true), 1000);
  //       }
  //     }, typingSpeed);
  //   } else {
  //     timeout = setTimeout(() => {
  //       setText(welcomes[index].substring(0, text.length - 1));
  //       if (text.length === 0) {
  //         setIsDeleting(false);
  //         setIndex((prevIndex) => (prevIndex + 1) % welcomes.length);
  //       }
  //     }, deletingSpeed);
  //   }

  //   return () => clearTimeout(timeout);
  // }, [text, index, isDeleting]);

  // const isProgressHigh = progress >= 75;

  return (
    <StyledRoot>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          padding: '0 20px',
        }}
      >
        <img
          src={
            theme.palette.mode === 'light'
              ? '/logos/v2/bold/logoBlack.svg'
              : '/logos/v2/bold/logoWhite.svg'
          }
          alt="ALTAN"
          style={{
            transition: 'opacity 0.5s ease-in-out',
            opacity: 1,
            height: isMobile ? '40px' : '55px', // Smaller height on mobile
            width: 'auto',
            maxWidth: isMobile ? '60%' : '80%', // More constrained on mobile
            objectFit: 'contain',
          }}
        />
        <LinearProgress
          sx={{
            width: isMobile ? '150px' : '200px', // Smaller progress bar on mobile
            color: theme.palette.mode === 'dark' ? 'white' : 'black', // Change color based on theme mode
          }}
          color="inherit"
        />
      </Box>
      {/* <Box
        sx={{
          position: 'absolute',
          width: `${progress * 2}%`,
          height: `${progress * 2}%`,
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          transition: 'all 0.5s ease-in-out',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }}
      />
      {!isMobile && !showText && (
        <TextWrapper>
          <Typography
            variant="h3"
            sx={{
              whiteSpace: 'pre',
              color: isProgressHigh ? '#000000' : '#FFFFFF',
              transition: 'color 0.5s ease-in-out',
            }}
          >
            {text}
            <span
              style={{
                display: 'inline-block',
                marginLeft: '5px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: isProgressHigh ? '#000000' : '#FFFFFF',
                animation: 'blink 1s step-start 0s infinite',
              }}
            />
          </Typography>
        </TextWrapper>
      )}
      {!showText ? (
        <ProgressWrapper>
          <Typography
            variant="h3"
            sx={{
              color: isProgressHigh ? '#000000' : '#FFFFFF',
              transition: 'color 0.5s ease-in-out',
            }}
          >
            {`${progress}%`}
          </Typography>

          <Line
            sx={{
              backgroundColor: isProgressHigh ? '#000000' : '#FFFFFF',
              transition: 'background-color 0.5s ease-in-out',
            }}
          />
        </ProgressWrapper>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <img
            src="https://altan.ai/logos/horizontalBlack.png"
            alt="ALTAN"
            style={{
              transition: 'opacity 0.5s ease-in-out',
              opacity: showText ? 1 : 0,
              height: '50px',
              width: 'auto',
            }}
          />
          <LinearProgress
            sx={{ width: '200px', color: 'black' }}
            color="inherit"
          />
        </Box>
      )} */}
    </StyledRoot>
  );
}

export default memo(LoadingScreen);
// import { m } from 'framer-motion';
// import { useLocation } from 'react-router-dom';
// import { useEffect, useRef, useState } from 'react';
// // @mui
// import { styled } from '@mui/material/styles';
// import { Box, Typography, Stack } from '@mui/material';
// // hooks
// import useResponsive from '../../hooks/useResponsive';
// // config
// import { NAV ,HEADER} from '../../config-global';
// // auth
// import { useAuthContext } from '../../auth/useAuthContext';
// //
// import Logo from '../logo';
// import ProgressBar from '../progress-bar';
// import { useSettingsContext } from '../settings';

// // ----------------------------------------------------------------------

// const StyledRoot = styled('div')(({ theme }) => ({
//   right: 0,
//   bottom: 0,
//   zIndex: 9998,
//   width: '100%',
//   height: '100%',
//   position: 'fixed',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: theme.palette.background.default,
// }));

// const StyledCanvas = styled('canvas')({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   zIndex: -1,
// });

// // ----------------------------------------------------------------------

// export default function LoadingScreen() {
//   const { pathname } = useLocation();

//   const isDesktop = useResponsive('up', 'lg');

//   const { isInitialized } = useAuthContext();

//   const { themeLayout } = useSettingsContext();

//   const isDashboard = isInitialized && pathname.includes('/app') && isDesktop;

//   const size =
//     (themeLayout === 'mini' && NAV.W_DASHBOARD_MINI) ||
//     (themeLayout === 'vertical' && NAV.W_DASHBOARD) ||
//      144;

//   const canvasRef = useRef(null);

//   const [index, setIndex] = useState(0);
//   const [text, setText] = useState('');
//   const [isDeleting, setIsDeleting] = useState(false);
//   const welcomes = ['securing connection', 'loading altaners', 'starting platform', 'loading your future']

//   useEffect(() => {
//     const typingSpeed = 40;
//     const deletingSpeed = 5;
//     let timeout;

//     if (!isDeleting) {
//       timeout = setTimeout(() => {
//         setText(welcomes[index].substring(0, text.length + 1));
//         if (text === welcomes[index]) {
//           setTimeout(() => setIsDeleting(true), 1000);
//         }
//       }, typingSpeed);
//     } else {
//       timeout = setTimeout(() => {
//         setText(welcomes[index].substring(0, text.length - 1));
//         if (text.length === 0) {
//           setIsDeleting(false);
//           setIndex((prevIndex) => (prevIndex + 1) % welcomes.length);
//         }
//       }, deletingSpeed);
//     }

//     return () => clearTimeout(timeout);
//   }, [text, index, isDeleting]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
//     const fontSize = 10;
//     const columns = canvas.width / fontSize;

//     const drops = Array(Math.floor(columns)).fill(1);

//     function draw() {
//       ctx.fillStyle = 'rgba(0, 0, 0, .1)';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       ctx.fillStyle = '#0f0';
//       ctx.font = `${fontSize}px monospace`;

//       for (let i = 0; i < drops.length; i++) {
//         const text = letters[Math.floor(Math.random() * letters.length)];
//         ctx.fillText(text, i * fontSize, drops[i] * fontSize);
//         drops[i]++;
//         if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
//           drops[i] = 0;
//         }
//       }
//     }

//     const intervalId = setInterval(draw, 26);

//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <>
//       <ProgressBar />

//       <StyledRoot
//         sx={{
//           ...(isDashboard && {
//             width: `calc(100% - ${size}px)`,
//             height: `calc(100% - ${HEADER.H_DASHBOARD_DESKTOP}px)`,
//             ...(themeLayout === 'horizontal' && {
//               width: 1,
//               height: `calc(100% - ${size}px)`,
//             }),
//           }),
//         }}
//       >
//         <StyledCanvas ref={canvasRef} />
//         <Stack spacing={2}>
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',  // Ensures the logo is centered
//               minHeight: '56px',
//               color: 'white'
//             }}
//           >
//             <Logo disabledLink sx={{ width: 75, height: 75 }} color="white" />
//           </Box>
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',  // Ensures the text is centered
//               minHeight: '56px',
//               color: 'white'
//             }}
//           >
//             <Typography variant={"h3"} sx={{ whiteSpace: 'pre' }}>
//               {text}
//               <span
//                 style={{
//                   display: 'inline-block',
//                   marginLeft: '5px',
//                   width: "20px",
//                   height: "20px",
//                   borderRadius: '50%',
//                   backgroundColor: 'white',
//                   animation: 'blink 1s step-start 0s infinite'
//                 }}
//               />
//             </Typography>
//           </Box>
//         </Stack>

//         {/* {isDashboard ? (
//           <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
//         ) : (
//           <>
//             <m.div
//               animate={{
//                 scale: [1, 0.9, 0.9, 1, 1],
//                 opacity: [1, 0.48, 0.48, 1, 1],
//               }}
//               transition={{
//                 duration: 2,
//                 ease: 'easeInOut',
//                 repeatDelay: 1,
//                 repeat: Infinity,
//               }}
//             >
//                 <Logo disabledLink sx={{ width: 50, height: 50 }} />
//             </m.div>

//             <Box
//               component={m.div}
//               animate={{
//                 scale: [1.6, 1, 1, 1.6, 1.6],
//                 rotate: [270, 0, 0, 270, 270],
//                 opacity: [0.25, 1, 1, 1, 0.25],
//                 borderRadius: ['25%', '25%', '50%', '50%', '25%'],
//               }}
//               transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
//               sx={{
//                 width: 100,
//                 height: 100,
//                 position: 'absolute',
//                 border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`,
//               }}
//             />

//             <Box
//               component={m.div}
//               animate={{
//                 scale: [1, 1.2, 1.2, 1, 1],
//                 rotate: [0, 270, 270, 0, 0],
//                 opacity: [1, 0.25, 0.25, 0.25, 1],
//                 borderRadius: ['25%', '25%', '50%', '50%', '25%'],
//               }}
//               transition={{
//                 ease: 'linear',
//                 duration: 3.2,
//                 repeat: Infinity,
//               }}
//               sx={{
//                 width: 120,
//                 height: 120,
//                 position: 'absolute',
//                 border: (theme) => `solid 8px ${alpha(theme.palette.secondary.dark, 0.24)}`,

//               }}
//             />
//           </>
//         )} */}

//       </StyledRoot>

//     </>
//   );
// }
