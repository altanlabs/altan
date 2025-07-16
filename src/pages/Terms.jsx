import { Container } from '@mui/material';

import { CompactLayout } from '../layouts/dashboard';
import Footer from '../layouts/main/Footer';

export default function Terms() {
  return (
    <CompactLayout title="Terms of Service · Altan">
      <Container sx={{ pb: 20 }}>
        <section id="terms">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-[80px]">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            <p>Last Updated: June 2025</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
            <p>
              Welcome to Altan, operated by Altan Labs Inc. These Terms of Service (&ldquo;Terms&rdquo;) govern
              your access to and use of our services, including our website and applications
              (collectively, the &ldquo;Services&rdquo;). By using our Services, you agree to comply with and be
              bound by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Account Registration</h2>
            <p>
              To access certain features of our Services, you may need to register for an account.
              You agree to provide accurate, current, and complete information during the
              registration process and to update such information to keep it accurate, current, and
              complete. You are responsible for safeguarding your account credentials and for any
              activities or actions under your account.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Use of Services</h2>
            <p>
              You agree to use our Services only for lawful purposes and in accordance with these
              Terms. You agree not to use our Services:
            </p>
            <ul className="list-disc pl-5">
              <li>
                In any way that violates any applicable federal, state, local, or international law
                or regulation
              </li>
              <li>
                For the purpose of exploiting, harming, or attempting to exploit or harm minors in
                any way
              </li>
              <li>
                To send, knowingly receive, upload, download, use, or re-use any material that does
                not comply with these Terms
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or promotional material
                without our prior written consent
              </li>
              <li>
                To impersonate or attempt to impersonate Altan, an Altan employee, another user, or
                any other person or entity
              </li>
              <li>
                To engage in any other conduct that restricts or inhibits anyone&rsquo;s use or enjoyment
                of our Services, or which, as determined by us, may harm Altan or users of our
                Services, or expose them to liability
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Refunds &amp; Right of Withdrawal</h2>
            <p>
              New users receive complimentary credits to evaluate our services before making any paid commitments. By subscribing to a paid plan, you acknowledge that your plan includes a fixed number of credits or usage allowance. In accordance with consumer protection laws, you have the right to withdraw from your subscription within 14 days of purchase. However, if you access or consume any part of the service (e.g., use credits or features), you expressly waive your right to withdraw and are not eligible for a refund, as the digital service has been fully performed.
            </p>
            <p>
              Refunds are only eligible if no credits have been used and the service remains unused. If any part of the subscription has been consumed, including partial use of credits, no refund will be issued.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property</h2>
            <p>
              The Services and their entire contents, features, and functionality (including but not
              limited to all information, software, text, displays, images, video, and audio, and
              the design, selection, and arrangement thereof) are owned by Oktopus.io Inc., its
              licensors, or other providers of such material and are protected by United States and
              international copyright, trademark, patent, trade secret, and other intellectual
              property or proprietary rights laws.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Services at our sole
              discretion, without prior notice or liability, for any reason whatsoever, including
              without limitation if you breach these Terms. Upon termination, your right to use the
              Services will immediately cease.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, in no event shall Oktopus.io Inc.,
              its affiliates, directors, employees, or licensors be liable for any indirect,
              incidental, special, consequential, or punitive damages, including without limitation,
              loss of profits, data, use, goodwill, or other intangible losses, resulting from (i)
              your use or inability to use the Services; (ii) any unauthorized access to or use of
              our servers and/or any personal information stored therein; (iii) any interruption or
              cessation of transmission to or from the Services; (iv) any bugs, viruses, trojan
              horses, or the like that may be transmitted to or through our Services by any third
              party; (v) any errors or omissions in any content or for any loss or damage incurred
              as a result of the use of any content posted, emailed, transmitted, or otherwise made
              available through the Services; and/or (vi) any other matters relating to the
              Services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the State
              of [Your State], without regard to its conflict of law provisions. Any legal suit,
              action, or proceeding arising out of, or related to, these Terms or the Services shall
              be instituted exclusively in the federal courts of the United States or the courts of
              the State of [Your State].
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. If a revision is material, we will provide at least 30 days&rsquo; notice prior to any
              new terms taking effect. By continuing to access or use our Services after those
              revisions become effective, you agree to be bound by the revised terms.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <address>
              Altan Labs Inc.
              <br />
              2055 Limestone Rd, Wilmington, Delaware 19808
              <br />
              Email: contact@altan.ai
            </address>
          </div>
        </section>
      </Container>
      <Footer />
    </CompactLayout>
  );
}
