// import { Player } from '@lottiefiles/react-lottie-player';
import React, { memo, useEffect, useRef, useState } from 'react';
// import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

import { getLottieWorker, releaseLottieWorker } from './workerManager';
import Iconify from '../iconify';

const cache = new Map();

const AdaptiveDotLottie = ({ icon, sx = {} }) => {
  // const playerRef = useRef(null);
  const animationData = useRef(null);
  const [loadedAnimation, setLoadedAnimation] = useState(false);

  const [, name, settings] = icon.split(':');

  const parsedSettings = settings
    ? settings.split(',').reduce(
        (acc, key) => {
          if (key.startsWith('rotate(')) {
            const degrees = key.slice(7, -1); // Extract number from rotate(X)
            if (!isNaN(degrees)) {
              // Normalize degrees to a range of 0-360
              const normalizedDegrees = ((degrees % 360) + 360) % 360;

              // Add rotation in degrees to the styles object
              acc.inlineStyles = {
                ...acc.inlineStyles,
                transform: `rotate(${normalizedDegrees}deg)`,
              };
            }
          } else {
            acc[key] = true;
          }
          return acc;
        },
        { inlineStyles: {} },
      )
    : { inlineStyles: {} };

  const { inlineStyles, ...propsSettings } = parsedSettings;

  const { pointerEvents, width, height, ...restSx } = sx;

  useEffect(() => {
    const fetchLottie = async () => {
      if (cache.has(name)) {
        animationData.current = cache.get(name);
        setLoadedAnimation(true);
        return;
      }

      const lottiePath = `/assets/icons/animated/${name}.lottie`;

      try {
        const response = await fetch(lottiePath);
        const buffer = await response.arrayBuffer();

        const worker = getLottieWorker();
        worker.postMessage({ propsSettings, name, buffer });

        const onWorkerMessage = (event) => {
          const { name: nameFromWorker, success, data, error } = event.data;
          if (name === nameFromWorker) {
            if (success) {
              cache.set(name, data);
              animationData.current = data;
              setLoadedAnimation(true);
            } else {
              console.error('Worker Error:', error);
            }
          }
        };

        worker.addEventListener('message', onWorkerMessage);

        return () => {
          worker.removeEventListener('message', onWorkerMessage);
          releaseLottieWorker(); // Release worker reference
        };
      } catch (error) {
        console.error('Failed to load .lottie file:', error);
      }
    };

    fetchLottie();
  }, [name]);

  useEffect(() => {
    return () => {
      animationData.current = null;
      // playerRef.current = null;
    };
  }, []);

  // const getLottieRef = useCallback((instance) => {
  //   playerRef.current = instance;
  //   if (playerRef.current) {
  //     playerRef.current.setSubframe = false;
  //   }
  // }, []);

  if (!loadedAnimation) {
    return <Iconify icon="svg-spinners:gooey-balls-2" />;
  }

  return (
    <lord-icon
      trigger="appear-hover-loop"
      // state="in-reveal"
      // sequence="state:in-*,play,delay:last:1000"
      style={{
        ...restSx,
        ...inlineStyles,
        width: width ? width + 10 : undefined,
        height: height ? height + 10 : undefined,
      }}
      src={animationData.current}
    >
    </lord-icon>
    // <Player
    //   lottieRef={getLottieRef}
    //   src={animationData.current}
    //   {...propsSettings}
    //   rendererSettings={{
    //     preserveAspectRatio: 'xMidYMid meet',
    //     progressiveLoad: true,
    //     hideOnTransparent: true,
    //   }}
    //   style={{
    //     ...restSx,
    //     ...inlineStyles,
    //     width: width ? width + 10 : undefined,
    //     height: height ? height + 10 : undefined,
    //   }}
    // />
  );
};

export default memo(AdaptiveDotLottie);
