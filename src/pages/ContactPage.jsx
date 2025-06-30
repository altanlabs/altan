import { Helmet } from 'react-helmet-async';

// @mui
// _mock
// sections
import { ContactHero } from '../sections/contact';

// ----------------------------------------------------------------------

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title> Contact us · Altan</title>
      </Helmet>

      <ContactHero />

      {/* <ContactForm /> */}

      {/* <ContactMap contacts={_mapContact} /> */}
    </>
  );
}
