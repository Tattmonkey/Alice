import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Image as ImageIcon, Loader2, Type, Sparkles, CreditCard, AlertTriangle, Zap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { User, SymbolMeaning } from '../types';
import SymbolismInsight from './SymbolismInsight';
import TextGenerator from './TextGenerator';
import { analyzeSymbolism } from '../utils/symbolism';
import CreditPlans from './CreditPlans';
import { useAuth } from '../contexts/AuthContext';
import { generateImage } from '../utils/api';

interface Props {
  user: User;
}

export default function Generator({ user }: Props) {
  const { updateUserCredits } = useAuth();
  const [mode, setMode] = useState<'design' | 'text'>('design');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [symbolMeanings, setSymbolMeanings] = useState<SymbolMeaning[]>([]);
  const [showCreditPlans, setShowCreditPlans] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const meanings = analyzeSymbolism(prompt);
    setSymbolMeanings(meanings);
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Please enter a description');
      return;
    }

    if (user.credits < 1) {
      setShowCreditPlans(true);
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
      await updateUserCredits(user.id, -1);
      toast.success('Design generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('design')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
            mode === 'design'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          Design Generator
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('text')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
            mode === 'text'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Type className="w-5 h-5" />
          Text Generator
        </motion.button>
      </div>

      {mode === 'design' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              AI Design Generator
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Design
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                placeholder="Describe the tattoo design you'd like to create..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">
                  {user.credits} credits remaining
                </span>
              </div>

              <motion.button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                Generate Design
              </motion.button>
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-6"
                >
                  <div className="text-center animate-pulse-border rounded-xl p-8">
                    <Wand2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-float" />
                    <p className="text-purple-600 font-medium">
                      Creating your design...
                    </p>
                  </div>
                </motion.div>
              )}

              {generatedImage && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-6"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <img
                      src={generatedImage}
                      alt="Generated design"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {symbolMeanings.length > 0 && (
              <SymbolismInsight meanings={symbolMeanings} />
            )}
          </div>
        </motion.div>
      ) : (
        <TextGenerator user={user} />
      )}

      <AnimatePresence>
        {showCreditPlans && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setShowCreditPlans(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Need More Credits?</h2>
                <p className="text-gray-600">
                  Choose a credit package to continue generating designs
                </p>
              </div>

              <CreditPlans />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}