import { LazyMotion, domMax } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { DidYouKnow } from '../../../../components/aceternity/DidYouKnow.tsx';
import { SparklesCore } from '../../../../components/aceternity/Sparkles.tsx';
import { TextShimmer } from '../../../../components/aceternity/text/text-shimmer.tsx';

function LoadingFrame({ viewMode }) {
  return (
    <LazyMotion features={domMax}>
      <div
        className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col"
        style={{
          width: viewMode === 'mobile' ? '375px' : '100%',
          margin: viewMode === 'mobile' ? '0 auto' : undefined,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-[40rem] h-40 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 z-30">
              <TextShimmer
                className="font-mono text-base sm:text-lg"
                duration={1.4}
              >
                Loading Live Preview...
              </TextShimmer>
            </div>

            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />

            {/* Radial Gradient */}
            <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#09090b] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] z-10"></div>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto px-4 mb-20 relative z-20">
          <DidYouKnow />
        </div>
      </div>
    </LazyMotion>
  );
}

LoadingFrame.propTypes = {
  viewMode: PropTypes.string,
};

export default memo(LoadingFrame);
