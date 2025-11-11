
// sections
import { CompactLayout } from '../layouts/dashboard';
import Footer from '../layouts/dashboard/new/Footer';
import { ContactSupport } from '../sections/contact';

// ----------------------------------------------------------------------

export default function ContactPage() {
  return (
    <CompactLayout title="Contact us · Altan">
      <ContactSupport />
      <Footer />
    </CompactLayout>
  );
}
