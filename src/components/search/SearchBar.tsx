import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Hash, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface SearchResult {
  type: 'artist' | 'tag' | 'location';
  id: string;
  text: string;
  subtext?: string;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchLower = debouncedSearch.toLowerCase();

        // Search artists
        const artistsQuery = query(
          collection(db, 'users'),
          where('role.type', '==', 'artist'),
          where('displayName', '>=', searchLower),
          where('displayName', '<=', searchLower + '\uf8ff'),
          limit(3)
        );
        const artistsSnapshot = await getDocs(artistsQuery);
        const artistResults = artistsSnapshot.docs.map(doc => ({
          type: 'artist' as const,
          id: doc.id,
          text: doc.data().displayName,
          subtext: doc.data().location
        }));

        // Search tags
        const tagsQuery = query(
          collection(db, 'tags'),
          where('name', '>=', searchLower),
          where('name', '<=', searchLower + '\uf8ff'),
          limit(3)
        );
        const tagsSnapshot = await getDocs(tagsQuery);
        const tagResults = tagsSnapshot.docs.map(doc => ({
          type: 'tag' as const,
          id: doc.id,
          text: doc.data().name,
          subtext: `${doc.data().count} posts`
        }));

        // Search locations
        const locationsQuery = query(
          collection(db, 'locations'),
          where('name', '>=', searchLower),
          where('name', '<=', searchLower + '\uf8ff'),
          limit(3)
        );
        const locationsSnapshot = await getDocs(locationsQuery);
        const locationResults = locationsSnapshot.docs.map(doc => ({
          type: 'location' as const,
          id: doc.id,
          text: doc.data().name,
          subtext: `${doc.data().artistCount} artists`
        }));

        setResults([...artistResults, ...tagResults, ...locationResults]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'artist':
        navigate(`/profile/${result.id}`);
        break;
      case 'tag':
        navigate(`/gallery?tag=${result.text}`);
        break;
      case 'location':
        navigate(`/search?location=${result.text}`);
        break;
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'artist':
        return <User className="w-4 h-4" />;
      case 'tag':
        return <Hash className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search artists, tags, or locations..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setResults([]);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (searchTerm || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <motion.button
                    key={`${result.type}-${result.id}`}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 flex items-center gap-3 text-left"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {getIcon(result.type)}
                    </span>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {result.text}
                      </div>
                      {result.subtext && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.subtext}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
