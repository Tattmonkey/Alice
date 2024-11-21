import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateArticle } from '../../utils/openai';

interface Props {
  onArticleGenerated: (article: { title: string; content: string }) => void;
}

export default function ArticleGenerator({ onArticleGenerated }: Props) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const article = await generateArticle(topic);
      onArticleGenerated(article);
      toast.success('Article generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate article';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          AI Article Generator
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Topic
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full h-32 px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe the tattoo-related topic you'd like to explore..."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <motion.button
            onClick={handleGenerate}
            disabled={loading || !topic}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            Generate Article
          </motion.button>
        </div>
      </div>
    </div>
  );
}