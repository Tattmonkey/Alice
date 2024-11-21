import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { SymbolMeaning } from '../types';

interface Props {
  meanings: SymbolMeaning[];
}

export default function SymbolismInsight({ meanings }: Props) {
  if (!meanings.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-purple-600 animate-float" />
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Symbolic Meanings
        </h3>
      </div>
      
      <div className="space-y-4">
        {meanings.map((meaning, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-50"
          >
            <h4 className="font-medium text-purple-800 mb-1">{meaning.symbol}</h4>
            {meaning.culture && (
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {meaning.culture}
              </span>
            )}
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{meaning.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}