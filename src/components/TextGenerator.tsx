import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, RotateCcw, Loader2, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { FONT_STYLES, FontStyle } from '../utils/fonts';
import { generateTextDesign } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function TextGenerator() {
  const { user, updateUserCredits } = useAuth();
  const [text, setText] = useState('');
  const [isAmbigram, setIsAmbigram] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<FontStyle>(FONT_STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text) {
      toast.error('Please enter some text');
      return;
    }

    if (!user) {
      toast.error('Please sign in to generate designs');
      return;
    }

    const creditCost = isAmbigram ? 2 : 1;
    
    if (user.credits < creditCost) {
      toast.error(`Insufficient credits. This design requires ${creditCost} credits.`);
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await generateTextDesign(text, selectedStyle.name, isAmbigram);
      setGeneratedImage(imageUrl);
      await updateUserCredits(user.id, -creditCost);
      toast.success('Text design generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate text design');
    } finally {
      setLoading(false);
    }
  };

  const styleCategories = {
    'Classic': FONT_STYLES.filter(s => ['classic-script', 'gothic', 'old-english'].includes(s.id)),
    'Modern': FONT_STYLES.filter(s => ['minimalist', 'graffiti', 'handwritten'].includes(s.id)),
    'Cultural': FONT_STYLES.filter(s => ['japanese', 'arabic', 'hebrew'].includes(s.id)),
    'Artistic': FONT_STYLES.filter(s => ['tribal', 'watercolor', 'chicano'].includes(s.id)),
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-purple-100"
      >
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Text Design Generator
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
              placeholder="Enter names, dates, or phrases..."
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <button
              onClick={() => setIsStylesOpen(!isStylesOpen)}
              className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{selectedStyle.name}</span>
                <span className="text-sm text-gray-500">{selectedStyle.description}</span>
              </div>
              <motion.div
                animate={{ rotate: isStylesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isStylesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute z-10 w-full mt-2 py-2 bg-white rounded-xl shadow-xl border border-purple-100"
                >
                  <div className="max-h-[400px] overflow-y-auto">
                    {Object.entries(styleCategories).map(([category, styles]) => (
                      <div key={category}>
                        <div className="px-4 py-2 bg-gray-50 font-medium text-gray-700">
                          {category}
                        </div>
                        {styles.map((style) => (
                          <motion.button
                            key={style.id}
                            whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                            onClick={() => {
                              setSelectedStyle(style);
                              setIsStylesOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-50 transition-colors"
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{style.name}</span>
                              <span className="text-sm text-gray-500">{style.description}</span>
                            </div>
                            {selectedStyle.id === style.id && (
                              <Check className="w-5 h-5 text-purple-600" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAmbigram(!isAmbigram)}
              className={`w-full p-3 rounded-lg border ${
                isAmbigram
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              } text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2`}
            >
              <RotateCcw className="w-5 h-5" />
              Make it an Ambigram
              {isAmbigram && (
                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full ml-2">
                  2 Credits
                </span>
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Credits required: {isAmbigram ? 2 : 1}
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !text || !user}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Type className="w-5 h-5" />
              )}
              Generate Text Design
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
                  <Type className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-float" />
                  <p className="text-purple-600 font-medium">
                    Creating your text design...
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
                    alt="Generated text design"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
