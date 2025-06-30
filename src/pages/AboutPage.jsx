import { Helmet } from 'react-helmet-async';

// @mui
// sections
import { AboutHero, AboutWhat, AboutVision } from '../sections/about';

// ----------------------------------------------------------------------

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About us · Altan</title>
        <meta
          name="description"
          content="Learn more about Altan, our team, vision, and what we do. Discover how we can help you optimize your business processes."
        />
        <link
          rel="icon"
          href="/favicon/favicon.ico"
        />
      </Helmet>

      <AboutHero />

      <AboutWhat />

      <AboutVision />

      {/* <Divider sx={{ my: 10, mx: 'auto', width: 2, height: 40 }} /> */}

      {/* <Divider orientation="vertical" sx={{ my: 10, mx: 'auto', width: 2, height: 40 }} />

      <AboutTeam /> */}

      {/* <AboutTestimonials /> */}
    </>
  );
}
