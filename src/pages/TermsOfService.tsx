import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <FileText className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using Alice Tattoos, you agree to be bound by these Terms of Service
              and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Use of Services</h2>
            <p className="text-gray-600 mb-4">
              Our AI-powered design services are intended for personal use and inspiration.
              Generated designs may be subject to copyright and other intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You are responsible for maintaining the confidentiality of your account
              and password. Please notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Credits and Payments</h2>
            <p className="text-gray-600 mb-4">
              Credits purchased are non-transferable and may expire after a certain period.
              All payments are processed securely through our payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Content Guidelines</h2>
            <p className="text-gray-600 mb-4">
              Users must not request or generate content that is illegal, offensive,
              or violates third-party rights. We reserve the right to refuse service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              Generated designs are provided for personal use. Commercial rights may
              require additional licensing or permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Alice Tattoos is not responsible for any damages arising from the use
              of our services or the implementation of generated designs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
            <div className="space-y-2 text-gray-600">
              <p>For questions about these Terms of Service, please contact us at:</p>
              <p>Email: support@alicetattoos.com</p>
              <p>Phone: 071 462 1132</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}