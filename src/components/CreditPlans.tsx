import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Shield, Sparkles, Star, Gift, ArrowRight } from 'lucide-react';
import { CreditPlan } from '../types';
import CheckoutModal from './checkout/CheckoutModal';
import toast from 'react-hot-toast';

const plans: CreditPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 99,
    credits: 25,
    savings: 0,
    features: [
      '25 AI Generations',
      'Basic Support',
      'Valid for 3 months'
    ]
  },
  {
    id: 'popular',
    name: 'Value Pack',
    price: 349,
    credits: 125,
    savings: 25,
    features: [
      '125 AI Generations',
      'Priority Support',
      'Valid for 6 months',
      '25% Extra Value'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 799,
    credits: 375,
    savings: 50,
    features: [
      '375 AI Generations',
      'Premium Support',
      'Valid for 12 months',
      '50% Extra Value',
      'Exclusive Designs'
    ]
  }
];

export default function CreditPlans() {
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleSuccess = () => {
    toast.success(`${selectedPlan?.credits} credits added to your account!`);
  };

  const getPricePerCredit = (plan: CreditPlan) => {
    return (plan.price / plan.credits).toFixed(2);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Choose Your Credit Pack</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Get more value with bigger packs. Credits never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onHoverStart={() => setHoveredPlan(plan.id)}
              onHoverEnd={() => setHoveredPlan(null)}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border transition-all duration-300 ${
                plan.id === 'popular'
                  ? 'border-purple-200 dark:border-purple-700 scale-105'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              {plan.id === 'popular' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.savings > 0 && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                    Save {plan.savings}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">R{plan.price}</span>
                <span className="text-sm text-gray-500">one-time</span>
              </div>

              <div className="flex items-center gap-1 mb-6">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  R{getPricePerCredit(plan)} per generation
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {index === 0 ? (
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    ) : index === 1 ? (
                      <Shield className="w-5 h-5 text-purple-500" />
                    ) : index === 2 ? (
                      <Star className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Gift className="w-5 h-5 text-purple-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.id === 'popular'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20'
                    : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Get Started
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                  hoveredPlan === plan.id ? 'translate-x-1' : ''
                }`} />
              </motion.button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Secure payment with credit/debit card
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need more credits? Contact us for custom enterprise plans
          </p>
        </div>
      </div>

      <CheckoutModal
        plan={selectedPlan!}
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSuccess={handleSuccess}
      />
    </>
  );
}