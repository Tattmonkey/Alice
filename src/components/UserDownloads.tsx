import React from 'react';
import { motion } from 'framer-motion';
import { Download, Clock, AlertTriangle } from 'lucide-react';
import { UserDownload } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
  downloads: UserDownload[];
}

export default function UserDownloads({ downloads }: Props) {
  const handleDownload = async (download: UserDownload) => {
    try {
      // Here you would implement the download logic
      // Update download count and last download date
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to start download');
    }
  };

  if (!downloads.length) {
    return (
      <div className="text-center py-12">
        <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Downloads</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your purchased downloads will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <div
          key={download.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium dark:text-white">{download.productId}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Purchased on {format(new Date(download.purchaseDate), 'PPP')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDownload(download)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </motion.button>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Download className="w-4 h-4" />
              {download.downloadCount} downloads used
            </div>
            {download.lastDownloadDate && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                Last downloaded {format(new Date(download.lastDownloadDate), 'PP')}
              </div>
            )}
          </div>

          {download.expiryDate && new Date(download.expiryDate) < new Date() && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">Download access expired on {format(new Date(download.expiryDate), 'PP')}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}