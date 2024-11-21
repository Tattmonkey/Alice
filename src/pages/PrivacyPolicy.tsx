import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Information Collection</h2>
            <p className="text-gray-600 mb-4">
              We collect information that you provide directly to us, including when you create an account,
              make a purchase, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Use of Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              process your transactions, and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell or share your personal information with third parties except as
              described in this policy or with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information
              from unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to access, correct, or delete your personal information.
              You may also object to or restrict certain processing of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
            <div className="space-y-2 text-gray-600">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p>Email: support@alicetattoos.com</p>
              <p>Phone: 071 462 1132</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}