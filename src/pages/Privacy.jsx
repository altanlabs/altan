import { Container } from '@mui/material';

import { CompactLayout } from '../layouts/dashboard';
import Footer from '../layouts/main/Footer';

export default function Privacy() {
  return (
    <CompactLayout title="Privacy Policy · Altan">
      <Container sx={{ pb: 20 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-[80px]">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <p>Last Updated: June 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
          <p>
            At Altan Labs Inc., we value your privacy and are committed to protecting your personal
            data. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website or use our services. By accessing or using our
            services, you agree to the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
          <h3 className="text-xl font-bold mt-6 mb-2">Personal Data</h3>
          <p>
            When you use our services, we may collect personal data that you provide to us directly,
            such as your name, email address, phone number, billing information, and any other
            information you choose to provide.
          </p>
          <h3 className="text-xl font-bold mt-6 mb-2">Usage Data</h3>
          <p>
            We automatically collect certain information about your device and how you interact with
            our services. This may include your IP address, browser type, operating system,
            referring URLs, access times, and pages viewed.
          </p>
          <h3 className="text-xl font-bold mt-6 mb-2">Integration Data</h3>
          <p>
            As an integration engine, we facilitate the transfer and processing of data between
            different applications. We only process data on your behalf and according to your
            instructions.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect in the following ways:</p>
          <ul className="list-disc pl-5">
            <li>To provide, operate, and maintain our services</li>
            <li>To improve, personalize, and expand our services</li>
            <li>To understand and analyze how you use our services</li>
            <li>To develop new products, services, features, and functionality</li>
            <li>
              To communicate with you, either directly or through one of our partners, including for
              customer service, to provide you with updates and other information relating to the
              service, and for marketing and promotional purposes
            </li>
            <li>To process your transactions and manage your orders</li>
            <li>To find and prevent fraud</li>
            <li>For compliance with legal obligations</li>
          </ul>

          {/* Added Section */}
          <h2 className="text-2xl font-bold mt-8 mb-4">Use of Google Workspace APIs</h2>
          <p>
            We use Google Workspace APIs solely to provide and enhance the services requested by our
            users. We do <strong>not</strong> use any data obtained through Google Workspace APIs to
            develop, improve, or train generalized AI or Machine Learning models. All data accessed
            via Google Workspace APIs is used only for the specific purposes authorized by the user
            and is not shared with any third parties for AI/ML model training.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal
            data. All sensitive information is transmitted via Secure Socket Layer (SSL) technology
            and encrypted in our database. Access to your personal data is restricted to authorized
            personnel only.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Data Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal data to third parties without
            your consent, except for the specific purposes outlined in this Privacy Policy:
          </p>
          <ul className="list-disc pl-5">
            <li>
              To trusted third-party service providers who assist us in operating our website,
              conducting our business, or serving our users, so long as those parties agree to keep
              this information confidential
            </li>
            <li>
              To comply with legal obligations, prevent fraud, resolve disputes, and enforce our
              agreements
            </li>
            <li>
              In connection with a merger, sale, or acquisition of all or a portion of our business
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal
            data:
          </p>
          <ul className="list-disc pl-5">
            <li>
              The right to access – You have the right to request copies of your personal data.
            </li>
            <li>
              The right to rectification – You have the right to request that we correct any
              information you believe is inaccurate or complete information you believe is
              incomplete.
            </li>
            <li>
              The right to erasure – You have the right to request that we erase your personal data,
              under certain conditions.
            </li>
            <li>
              The right to restrict processing – You have the right to request that we restrict the
              processing of your personal data, under certain conditions.
            </li>
            <li>
              The right to object to processing – You have the right to object to our processing of
              your personal data, under certain conditions.
            </li>
            <li>
              The right to data portability – You have the right to request that we transfer the
              data that we have collected to another organization, or directly to you, under certain
              conditions.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Compliance with European Union Standards</h2>
          <p>
            We comply with all applicable data protection regulations of the European Union,
            including the General Data Protection Regulation (GDPR). We ensure that your personal
            data is processed lawfully, fairly, and transparently, and is collected for specified,
            explicit, and legitimate purposes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date at the
            top of this Privacy Policy. You are advised to review this Privacy Policy periodically
            for any changes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <address>
            Altan Labs Inc.
            <br />
            2055 Limestone Rd, Wilmington, Delaware 19808
            <br />
            Email: contact@altan.ai
          </address>

          <p>
            Thank you for trusting Altan with your data. We are committed to protecting your privacy
            and ensuring the security of your personal information.
          </p>
        </div>
      </Container>
      <Footer />
    </CompactLayout>
  );
}
