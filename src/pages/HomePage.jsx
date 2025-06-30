// @mui
import { Box, useTheme } from '@mui/material';

// sections

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import useResponsive from '../hooks/useResponsive';
import { HomeHero2 } from '../sections/home';

// components
// const HomeAdvertisement = lazy(() => import('../sections/home/HomeAdvertisement'));
// const HowItWorks = lazy(() => import('../sections/home/HowItWorks'));

// function LoadingSkeleton() {
//   return (
//     <Box>
//       <Skeleton variant="rectangular" height={250} />
//       <Skeleton variant="text" />
//       <Skeleton variant="text" />
//       <Skeleton variant="text" width="60%" />
//     </Box>
//   );
// }

export default function HomePage() {
  const theme = useTheme();
  const [isScrolledOne, setScrolledOne] = useState(false);
  const isMobile = useResponsive('down', 'sm');

  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 5) {
      setScrolledOne(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const videoSource = !isMobile ? '/assets/videos/desktop.mp4' : '/assets/videos/abstract.mp4';

  return (
    <>
      <Helmet>
        <title>Altan | Human-AI Collaboration</title>
        <meta
          name="description"
          content="Altan: The no-code platform for intelligent conversational apps. Effortlessly build, configure, and deploy AI-powered chat solutions for your business."
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />

        <script
          defer
          type="application/ld+json"
        >
          {`
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "url": "https://www.altan.ai",
                "logo": "https://www.altan.ai/favicon/android-chrome-512x512.png"
              }
            `}
        </script>
      </Helmet>
      {/* <ScrollProgress /> */}

      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <video
          autoPlay
          playsInline
          loop
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.15,
          }}
        >
          <source
            src={videoSource}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <HomeHero2 theme={theme} />
        {/* <HomeTitle
          title="Imagine a seamless shopping experience"
          subtitle="where every question you have is answered promptly, every concern addressed instantly, guiding you effortlessly from curiosity to purchase.
          The moment you need help, it's there, making your journey feel valued and understood.
          "
        />
        <HomeBenefits/>
        <HomeGrid/>
        <HomeTitle
          title="How it works"
          subtitle="Simply upload your documents or provide a link to your website, and effortlessly create a ChatGPT-like chatbot tailored to your data."
        />
        {
          isScrolledOne && (
            <Suspense fallback={<LoadingSkeleton />}>
              <HowItWorks theme={theme}/>
              <HomeAdvertisement/>
            </Suspense>
          )
        } */}
      </Box>
    </>
  );
}
