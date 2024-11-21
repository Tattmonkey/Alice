import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Refund Policy</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Credit Purchase Refunds</h2>
            <p className="text-gray-600 mb-4">
              We offer refunds for unused credits within 14 days of purchase. Once credits have been
              used for design generation, they cannot be refunded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Shop Product Returns</h2>
            <p className="text-gray-600 mb-4">
              Physical products purchased from our shop can be returned within 30 days of delivery
              if they are unused and in their original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Refund Process</h2>
            <p className="text-gray-600 mb-4">
              Refunds will be processed using the original payment method. Please allow 5-10
              business days for the refund to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Exceptions</h2>
            <p className="text-gray-600 mb-4">
              Custom designs and personalized items cannot be refunded unless they arrive damaged
              or defective.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Contact Us</h2>
            <div className="space-y-2 text-gray-600">
              <p>For refund requests or questions, please contact us at:</p>
              <p>Email: support@alicetattoos.com</p>
              <p>Phone: 071 462 1132</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}