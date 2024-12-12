import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CreditPlan {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  features: string[];
}

const creditPlans: CreditPlan[] = [
  {
    id: 'basic',
    credits: 50,
    price: 99,
    features: [
      'Generate 50 unique designs',
      'Download in high resolution',
      'Valid for 3 months',
    ],
  },
  {
    id: 'pro',
    credits: 150,
    price: 249,
    popular: true,
    features: [
      'Generate 150 unique designs',
      'Download in high resolution',
      'Priority support',
      'Valid for 6 months',
    ],
  },
  {
    id: 'unlimited',
    credits: 500,
    price: 699,
    features: [
      'Generate 500 unique designs',
      'Download in high resolution',
      'Priority support',
      'Valid for 12 months',
      'Custom design requests',
    ],
  },
];

interface CreditPlansProps {
  onClose: () => void;
}

export default function CreditPlans({ onClose }: CreditPlansProps) {
  const { addCredits } = useAuth();

  const handlePurchase = async (plan: CreditPlan) => {
    try {
      // Here you would integrate with your payment provider (e.g., iKhokha)
      // For now, we'll just add the credits directly
      await addCredits(plan.credits);
      onClose();
    } catch (error) {
      console.error('Error purchasing credits:', error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-[#1a0b2e] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose Your Credit Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select the plan that best suits your needs
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl'
                    : 'bg-white dark:bg-[#2d1b4e] border-2 border-gray-100 dark:border-purple-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className={`text-xl font-bold mb-2 ${
                    plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.credits} Credits
                  </h3>
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold ${
                      plan.popular ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      R{plan.price}
                    </span>
                    <span className={`ml-2 ${
                      plan.popular ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      once-off
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${
                        plan.popular ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'
                      }`} />
                      <span className={
                        plan.popular ? 'text-purple-100' : 'text-gray-600 dark:text-gray-300'
                      }>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchase(plan)}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-purple-600 hover:bg-purple-50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}