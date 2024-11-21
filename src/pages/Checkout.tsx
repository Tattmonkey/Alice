import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentForm from '../components/checkout/PaymentForm';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Please sign in to checkout</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Continue Shopping
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  }

  const subtotal = user.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 50; // Fixed shipping cost
  const total = subtotal + shipping;

  const handlePaymentSuccess = () => {
    // Here you would implement order creation and cart clearing
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Checkout
            </h1>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-4">
              {user.cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × R{item.price}
                    </p>
                  </div>
                  <span className="font-medium dark:text-white">
                    R{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="dark:text-white">R{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Payment Details</h2>
            <PaymentForm amount={total} onSuccess={handlePaymentSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}